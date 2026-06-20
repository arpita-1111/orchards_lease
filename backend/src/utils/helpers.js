import crypto from 'crypto';
import { customAlphabet } from 'nanoid';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './constants.js';

const slugId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);

/** Convert an arbitrary string into a URL-safe slug, with a short unique suffix. */
export const slugify = (text, { unique = true } = {}) => {
  const base = String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return unique ? `${base || 'orchard'}-${slugId()}` : base || 'orchard';
};

/** Parse pagination params from a query object. */
export const getPagination = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  page = Number.isNaN(page) || page < 1 ? 1 : page;
  limit = Number.isNaN(limit) || limit < 1 ? DEFAULT_PAGE_SIZE : Math.min(limit, MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/** Build a pagination meta object for responses. */
export const buildPageMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

/** Parse a comma-separated query value into an array. */
export const toArray = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

/** Generate a cryptographically random token + its sha256 hash. */
export const generateToken = (bytes = 32) => {
  const token = crypto.randomBytes(bytes).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

/** Hash a plain token for comparison with a stored hash. */
export const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

/** Pick a subset of keys from an object (whitelist for updates). */
export const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});

/** Calculate percentage growth between two numbers. */
export const growthPercent = (current, previous) => {
  if (!previous) return current ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};
