import ApiError from '../utils/ApiError.js';

/**
 * Restrict a route to one or more roles.
 * @example router.post('/', requireAuth, restrictTo(ROLES.SELLER), createOrchard)
 */
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  return next();
};

export default restrictTo;
