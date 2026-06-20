import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new seller or renter
 *     responses:
 *       201: { description: Account created }
 */
router.post('/register', authLimiter, validate(registerSchema), auth.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in (seller/renter)
 *     responses:
 *       200: { description: Logged in }
 */
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/admin/login', authLimiter, validate(adminLoginSchema), auth.adminLogin);

router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), auth.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), auth.verifyEmail);

// authenticated
router.get('/me', requireAuth, auth.me);
router.post('/change-password', requireAuth, validate(changePasswordSchema), auth.changePassword);

// device sessions
router.get('/sessions', requireAuth, auth.listSessions);
router.delete('/sessions/others', requireAuth, auth.revokeOtherSessions);
router.delete('/sessions/:id', requireAuth, validate({ params: idParam }), auth.revokeSessionById);

export default router;
