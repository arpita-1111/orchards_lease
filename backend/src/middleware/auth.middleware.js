import config from '../config/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import { verifyAccessToken } from '../services/token.service.js';
import { ROLES, ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * Extract a bearer token from the Authorization header.
 */
const getBearer = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

/**
 * Require a valid access token. Populates req.user.
 * Handles the env-based admin (sub === 'env-admin') without a DB lookup.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = getBearer(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token';
    throw ApiError.unauthorized(msg);
  }

  if (payload.type !== 'access') throw ApiError.unauthorized('Invalid token type');

  // Env admin — synthetic principal, no DB record
  if (payload.sub === 'env-admin' && payload.role === ROLES.ADMIN) {
    req.user = {
      _id: 'env-admin',
      id: 'env-admin',
      role: ROLES.ADMIN,
      name: config.admin.name,
      email: config.admin.email,
      isEnvAdmin: true,
    };
    return next();
  }

  const user = await User.findById(payload.sub).select('+password');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.deletedAt) throw ApiError.unauthorized('Account has been deleted');
  if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');
  if (user.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
    throw ApiError.forbidden('Your account is suspended');
  }
  if (user.passwordChangedAfter(payload.iat)) {
    throw ApiError.unauthorized('Password recently changed — please log in again');
  }

  user.password = undefined;
  req.user = user;
  return next();
});

/**
 * Optional auth — attaches req.user if a valid token is present, else continues.
 * Used for endpoints that personalize for logged-in users but allow guests.
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getBearer(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    if (payload.sub === 'env-admin') {
      req.user = { _id: 'env-admin', role: ROLES.ADMIN, isEnvAdmin: true };
      return next();
    }
    const user = await User.findById(payload.sub);
    if (user && !user.isBlocked && !user.deletedAt) req.user = user;
  } catch {
    // ignore — treat as guest
  }
  return next();
});
