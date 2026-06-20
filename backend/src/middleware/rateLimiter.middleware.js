import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';

const handler = (_req, _res, next) =>
  next(ApiError.tooMany('Too many requests — please slow down and try again later'));

/** General API limiter. */
export const apiLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  skip: () => config.isTest,
});

/** Stricter limiter for auth endpoints (login, register, reset). */
export const authLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  skip: () => config.isTest,
});
