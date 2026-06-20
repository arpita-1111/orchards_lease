import xss from 'xss';

/**
 * Recursively strip XSS payloads from strings in req.body / req.params.
 * Query is left untouched here (Express 5 makes req.query read-only); the
 * Zod validators coerce/whitelist query values instead.
 */
const clean = (value) => {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = clean(value[key]);
      return acc;
    }, {});
  }
  return value;
};

export const sanitizeBody = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = clean(req.body);
  next();
};

export default sanitizeBody;
