import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from '../utils/constants.js';
import {
  userActionSchema,
  settingsSchema,
  bulkOrchardSchema,
} from '../validators/admin.validator.js';
import { moderateOrchardSchema } from '../validators/orchard.validator.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();
router.use(requireAuth, restrictTo(ROLES.ADMIN));

/* Dashboard & analytics */
router.get('/dashboard', admin.getDashboard);
router.get('/analytics', admin.getAnalytics);
router.get('/export/report', admin.exportReport);

/* User management */
router.get('/users', admin.listUsers);
router.get('/users/:id', validate({ params: idParam }), admin.getUserDetail);
router.patch('/users/:id/status', validate({ params: idParam, ...userActionSchema }), admin.updateUserStatus);
router.delete('/users/:id', validate({ params: idParam }), admin.deleteUser);

/* Orchard moderation */
router.get('/orchards', admin.listOrchardsForModeration);
router.get('/orchards/queue', admin.getApprovalQueue);
router.patch('/orchards/:id/moderate', validate({ params: idParam, ...moderateOrchardSchema }), admin.moderateOrchard);
router.post('/orchards/bulk', validate(bulkOrchardSchema), admin.bulkModerateOrchards);

/* Review moderation */
router.get('/reviews/reported', admin.getReportedReviews);
router.patch('/reviews/:id/moderate', validate({ params: idParam }), admin.moderateReview);

/* Audit logs */
router.get('/audit-logs', admin.listAuditLogs);

/* Settings */
router.get('/settings', admin.getSettings);
router.patch('/settings', validate(settingsSchema), admin.updateSettings);

export default router;
