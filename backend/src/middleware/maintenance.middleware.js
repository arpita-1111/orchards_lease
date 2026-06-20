import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';

let cache = { value: null, at: 0 };
const TTL = 15 * 1000; // 15s cache to avoid a DB hit per request

/**
 * Block non-admin traffic when maintenance mode is on.
 * Admins (and auth routes) bypass so the platform stays operable.
 */
export const maintenanceGuard = async (req, _res, next) => {
  try {
    if (Date.now() - cache.at > TTL) {
      const settings = await Setting.getSingleton();
      cache = { value: settings.maintenanceMode, at: Date.now() };
    }
    if (!cache.value) return next();
    if (req.user?.role === ROLES.ADMIN) return next();
    if (req.path.startsWith('/auth') || req.path.startsWith('/admin')) return next();
    return next(new ApiError(503, 'Platform is under maintenance. Please check back soon.'));
  } catch {
    return next();
  }
};

export const invalidateMaintenanceCache = () => {
  cache = { value: null, at: 0 };
};
