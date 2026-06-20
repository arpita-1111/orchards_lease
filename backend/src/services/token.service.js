import jwt from 'jsonwebtoken';
import ms from 'ms';
import config from '../config/index.js';
import Session from '../models/Session.js';
import { hashToken } from '../utils/helpers.js';

/** Sign a short-lived access token. */
export const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, type: 'access' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

/** Sign a refresh token (carries a session id for revocation). */
export const signRefreshToken = (user, sessionId, remember = false) =>
  jwt.sign(
    { sub: user._id.toString(), sid: sessionId.toString(), type: 'refresh' },
    config.jwt.refreshSecret,
    {
      expiresIn: remember
        ? config.jwt.refreshExpiresInRemember
        : config.jwt.refreshExpiresIn,
    }
  );

export const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

/**
 * Create a device session row and return both tokens.
 */
export const issueAuthTokens = async (user, { remember = false, req } = {}) => {
  const ttlMs = ms(remember ? config.jwt.refreshExpiresInRemember : config.jwt.refreshExpiresIn);
  const session = await Session.create({
    user: user._id,
    refreshTokenHash: 'pending',
    userAgent: req?.headers?.['user-agent'] || '',
    ip: req?.ip || '',
    deviceLabel: parseDeviceLabel(req?.headers?.['user-agent']),
    rememberMe: remember,
    expiresAt: new Date(Date.now() + ttlMs),
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, session._id, remember);

  session.refreshTokenHash = hashToken(refreshToken);
  await session.save();

  return { accessToken, refreshToken, session };
};

/**
 * Rotate a refresh token: validate against its session, then issue a new pair.
 */
export const rotateRefreshToken = async (oldToken, user, session) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, session._id, session.rememberMe);
  session.refreshTokenHash = hashToken(refreshToken);
  session.lastUsedAt = new Date();
  await session.save();
  return { accessToken, refreshToken };
};

export const revokeSession = async (sessionId) => {
  await Session.findByIdAndUpdate(sessionId, { revokedAt: new Date() });
};

export const revokeAllSessions = async (userId, exceptSessionId = null) => {
  const filter = { user: userId, revokedAt: null };
  if (exceptSessionId) filter._id = { $ne: exceptSessionId };
  await Session.updateMany(filter, { revokedAt: new Date() });
};

function parseDeviceLabel(ua = '') {
  if (!ua) return 'Unknown device';
  if (/mobile/i.test(ua)) return 'Mobile device';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  if (/chrome/i.test(ua)) return 'Chrome browser';
  if (/firefox/i.test(ua)) return 'Firefox browser';
  if (/safari/i.test(ua)) return 'Safari browser';
  if (/edg/i.test(ua)) return 'Edge browser';
  return 'Desktop browser';
}
