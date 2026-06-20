# OrchardLease — Backend API

Node.js + Express + MongoDB (Mongoose) REST API for the OrchardLease orchard
rental marketplace. JWT access + refresh-token auth, role-based access
(seller / renter / admin), analytics, moderation and audit logging.

## Quick start

```bash
cd backend
cp .env.example .env          # then edit secrets
npm install
npm run seed                  # optional: sample sellers, renters, orchards
npm run dev                   # http://localhost:5000
```

- API base: `http://localhost:5000/api/v1`
- Swagger docs: `http://localhost:5000/api-docs`
- Health: `http://localhost:5000/health`

### Seeded credentials
| Role   | Email                       | Password      |
|--------|-----------------------------|---------------|
| Admin  | `ADMIN_EMAIL` (from `.env`) | from `.env`   |
| Seller | seller1@orchardlease.com    | Password123   |
| Renter | renter1@orchardlease.com    | Password123   |

## Architecture

```
src/
├── config/        env loading, db, winston logger, swagger
├── controllers/   request handlers (thin)
├── middleware/    auth, role, validate, rate-limit, sanitize, error, maintenance, upload
├── models/        Mongoose schemas
├── routes/        Express routers (one per domain) + index
├── services/      token, email (placeholder), upload (Cloudinary placeholder), audit, notification, analytics
├── utils/         ApiError, ApiResponse, asyncHandler, helpers, constants, seed
├── validators/    Zod schemas per domain
├── app.js         Express app assembly
└── server.js      bootstrap + graceful shutdown
```

## Auth model

- **Access token** (JWT, short-lived) — sent as `Authorization: Bearer <token>`.
- **Refresh token** (JWT, long-lived) — stored as an `httpOnly` cookie and as a
  hashed row in the `Session` collection (one per device). Rotated on every
  refresh; reuse detection revokes the session.
- **Admin** — single account from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`),
  no DB record. Login only.
- Pass the current session id back via the `x-session-id` header so
  "log out other devices" / change-password can keep the current device alive.

## Security

Helmet, CORS allowlist, `express-mongo-sanitize`, `hpp`, custom XSS body
sanitizer, bcrypt hashing, account lockout after repeated failed logins,
global + auth-specific rate limiting, Zod request validation, central error
handler with leak-safe production output.

## Key endpoints (prefix `/api/v1`)

| Area     | Examples |
|----------|----------|
| Auth     | `POST /auth/register`, `/auth/login`, `/auth/admin/login`, `/auth/refresh`, `/auth/sessions` |
| Users    | `GET/PATCH /users/me`, `POST /users/me/avatar`, `GET /users/me/activity` |
| Orchards | `GET /orchards` (search/filter/sort/paginate), `GET /orchards/:slug`, `POST /orchards`, `/orchards/:id/publish` |
| Bookings | `POST /bookings`, `/bookings/:id/approve|reject|cancel|complete` |
| Reviews  | `POST /reviews`, `GET /orchards/:orchardId/reviews` |
| Wishlist | `GET /wishlist`, `/wishlist/:orchardId/toggle`, `/wishlist/compare` |
| Seller   | `GET /seller/overview|revenue|performance`, `/seller/export/bookings` |
| Admin    | `GET /admin/dashboard|analytics`, `/admin/users`, `/admin/orchards/queue`, `/admin/audit-logs`, `/admin/settings` |
| Meta     | `GET /meta/filters`, `/meta/featured`, `/meta/settings` |

## Placeholders to wire later
- **Cloudinary** — `services/upload.service.js` (returns placeholder URLs today).
- **Email** — `services/email.service.js` (logs to console today).

## Testing
Architecture is test-ready (`supertest` + `jest` installed). Add specs under
`src/**/__tests__`; `NODE_ENV=test` disables rate limiting and file logging.
