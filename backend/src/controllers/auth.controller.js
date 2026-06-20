import ms from 'ms';
import config from '../config/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { generateToken, hashToken } from '../utils/helpers.js';
import { ROLES, TOKEN_TYPE, AUDIT_ACTION } from '../utils/constants.js';

import User from '../models/User.js';
import Session from '../models/Session.js';
import Token from '../models/Token.js';

import {
  issueAuthTokens,
  rotateRefreshToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  revokeSession,
  revokeAllSessions,
} from '../services/token.service.js';
import { recordAudit } from '../services/audit.service.js';
import { notify } from '../services/notification.service.js';
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/email.service.js';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions = (remember) => ({
  httpOnly: true,
  secure: config.isProd,
  sameSite: config.isProd ? 'none' : 'lax',
  path: '/',
  maxAge: ms(remember ? config.jwt.refreshExpiresInRemember : config.jwt.refreshExpiresIn),
});

const setRefreshCookie = (res, token, remember) =>
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions(remember));

const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(false), maxAge: undefined });

/* ----------------------------- Register ---------------------------- */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, role, phone });

  // Email verification placeholder
  const { token, hash } = generateToken();
  await Token.create({
    user: user._id,
    tokenHash: hash,
    type: TOKEN_TYPE.VERIFY,
    expiresAt: new Date(Date.now() + ms(config.jwt.emailVerifyExpiresIn)),
  });
  sendWelcomeEmail(user);
  sendVerificationEmail(user, token);

  const { accessToken, refreshToken, session } = await issueAuthTokens(user, {
    remember: false,
    req,
  });
  setRefreshCookie(res, refreshToken, false);
  await recordAudit({ actor: user._id, actorRole: user.role, action: AUDIT_ACTION.LOGIN, req });

  return created(
    res,
    { user, accessToken, sessionId: session._id },
    'Account created successfully'
  );
});

/* ------------------------------- Login ----------------------------- */
export const login = asyncHandler(async (req, res) => {
  const { email, password, remember } = req.body;

  const user = await User.findOne({ email, deletedAt: null }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  if (user.isLocked) {
    throw ApiError.tooMany('Account temporarily locked due to failed attempts. Try again later.');
  }
  if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');

  const match = await user.comparePassword(password);
  if (!match) {
    await user.registerFailedLogin();
    throw ApiError.unauthorized('Invalid email or password');
  }

  await user.resetLoginAttempts();

  const { accessToken, refreshToken, session } = await issueAuthTokens(user, { remember, req });
  setRefreshCookie(res, refreshToken, remember);
  await recordAudit({ actor: user._id, actorRole: user.role, action: AUDIT_ACTION.LOGIN, req });

  user.password = undefined;
  return ok(res, { user, accessToken, sessionId: session._id }, 'Logged in successfully');
});

/* --------------------------- Admin login --------------------------- */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email !== config.admin.email || password !== config.admin.password) {
    await recordAudit({
      actorLabel: email,
      actorRole: ROLES.ADMIN,
      action: 'admin.login.failed',
      description: 'Failed admin login attempt',
      req,
    });
    throw ApiError.unauthorized('Invalid admin credentials');
  }

  const adminPrincipal = { _id: 'env-admin', role: ROLES.ADMIN };
  const accessToken = signAccessToken(adminPrincipal);
  const refreshToken = signRefreshToken(adminPrincipal, 'env-admin', false);
  setRefreshCookie(res, refreshToken, false);

  await recordAudit({
    actorLabel: config.admin.email,
    actorRole: ROLES.ADMIN,
    action: AUDIT_ACTION.LOGIN,
    description: 'Admin logged in',
    req,
  });

  return ok(
    res,
    {
      user: { id: 'env-admin', name: config.admin.name, email: config.admin.email, role: ROLES.ADMIN },
      accessToken,
    },
    'Admin logged in'
  );
});

/* ----------------------------- Refresh ----------------------------- */
export const refresh = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  if (!incoming) throw ApiError.unauthorized('No refresh token provided');

  let payload;
  try {
    payload = verifyRefreshToken(incoming);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Env admin refresh
  if (payload.sub === 'env-admin') {
    const adminPrincipal = { _id: 'env-admin', role: ROLES.ADMIN };
    const accessToken = signAccessToken(adminPrincipal);
    const newRefresh = signRefreshToken(adminPrincipal, 'env-admin', false);
    setRefreshCookie(res, newRefresh, false);
    return ok(res, { accessToken }, 'Token refreshed');
  }

  const session = await Session.findById(payload.sid);
  if (!session || !session.isActive) throw ApiError.unauthorized('Session expired or revoked');
  if (session.refreshTokenHash !== hashToken(incoming)) {
    // token reuse — revoke entire session as a precaution
    await revokeSession(session._id);
    throw ApiError.unauthorized('Refresh token reuse detected — session revoked');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.isBlocked || user.deletedAt) throw ApiError.unauthorized('Account unavailable');

  const { accessToken, refreshToken } = await rotateRefreshToken(incoming, user, session);
  setRefreshCookie(res, refreshToken, session.rememberMe);
  return ok(res, { accessToken }, 'Token refreshed');
});

/* ------------------------------ Logout ----------------------------- */
export const logout = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.[REFRESH_COOKIE];
  if (incoming) {
    try {
      const payload = verifyRefreshToken(incoming);
      if (payload.sid && payload.sid !== 'env-admin') await revokeSession(payload.sid);
    } catch {
      /* ignore */
    }
  }
  clearRefreshCookie(res);
  if (req.user?._id && req.user._id !== 'env-admin') {
    await recordAudit({ actor: req.user._id, actorRole: req.user.role, action: AUDIT_ACTION.LOGOUT, req });
  }
  return ok(res, null, 'Logged out');
});

/* --------------------------- Current user -------------------------- */
export const me = asyncHandler(async (req, res) => {
  if (req.user?.isEnvAdmin) {
    return ok(res, {
      id: 'env-admin',
      name: config.admin.name,
      email: config.admin.email,
      role: ROLES.ADMIN,
    });
  }
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');
  return ok(res, user);
});

/* ------------------------- Forgot password ------------------------- */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, deletedAt: null });

  // Always respond success to avoid email enumeration
  if (user) {
    const { token, hash } = generateToken();
    await Token.create({
      user: user._id,
      tokenHash: hash,
      type: TOKEN_TYPE.RESET,
      expiresAt: new Date(Date.now() + ms(config.jwt.passwordResetExpiresIn)),
    });
    sendPasswordResetEmail(user, token);
  }

  return ok(res, null, 'If that email exists, a reset link has been sent');
});

/* -------------------------- Reset password ------------------------- */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const tokenDoc = await Token.findOne({
    tokenHash: hashToken(token),
    type: TOKEN_TYPE.RESET,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) throw ApiError.badRequest('Invalid or expired reset token');

  const user = await User.findById(tokenDoc.user).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  user.password = password;
  await user.save();

  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  // Revoke all sessions — force re-login everywhere
  await revokeAllSessions(user._id);
  await notify({
    user: user._id,
    type: 'account',
    title: 'Password reset',
    message: 'Your password was reset successfully.',
  });

  return ok(res, null, 'Password reset successfully. Please log in.');
});

/* -------------------------- Change password ------------------------ */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const match = await user.comparePassword(currentPassword);
  if (!match) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();

  // Keep current session, revoke others
  const currentSid = req.headers['x-session-id'];
  await revokeAllSessions(user._id, currentSid);

  return ok(res, null, 'Password changed successfully');
});

/* -------------------------- Verify email --------------------------- */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const tokenDoc = await Token.findOne({
    tokenHash: hashToken(token),
    type: TOKEN_TYPE.VERIFY,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) throw ApiError.badRequest('Invalid or expired verification token');

  await User.findByIdAndUpdate(tokenDoc.user, { isEmailVerified: true });
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  return ok(res, null, 'Email verified successfully');
});

/* ------------------------ Device sessions -------------------------- */
export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    user: req.user._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ lastUsedAt: -1 })
    .lean();

  const currentSid = req.headers['x-session-id'];
  const data = sessions.map((s) => ({
    id: s._id,
    deviceLabel: s.deviceLabel,
    ip: s.ip,
    userAgent: s.userAgent,
    rememberMe: s.rememberMe,
    lastUsedAt: s.lastUsedAt,
    createdAt: s.createdAt,
    current: String(s._id) === String(currentSid),
  }));

  return ok(res, data, 'Active sessions');
});

export const revokeSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
  if (!session) throw ApiError.notFound('Session not found');
  await revokeSession(session._id);
  return ok(res, null, 'Session revoked');
});

export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const currentSid = req.headers['x-session-id'];
  await revokeAllSessions(req.user._id, currentSid);
  return ok(res, null, 'All other sessions revoked');
});
