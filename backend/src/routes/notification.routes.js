import { Router } from 'express';
import * as notification from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();
router.use(requireAuth);

router.get('/', notification.listNotifications);
router.get('/unread-count', notification.getUnreadCount);
router.patch('/read-all', notification.markAllAsRead);
router.patch('/:id/read', validate({ params: idParam }), notification.markAsRead);
router.delete('/:id', validate({ params: idParam }), notification.deleteNotification);

export default router;
