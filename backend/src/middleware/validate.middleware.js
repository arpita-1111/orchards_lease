import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Validate request segments against a Zod schema map.
 * @param {{ body?, query?, params? }} schemas
 *
 * Parsed (and coerced) values replace the originals so controllers receive
 * clean, typed data.
 */
export const validate = (schemas = {}) => (req, _res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    return next(err);
  }
};

export default validate;
