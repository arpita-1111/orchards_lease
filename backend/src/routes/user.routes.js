import { Router } from 'express';
import * as user from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadImages } from '../middleware/upload.middleware.js';
import {
  updateProfileSchema,
  notificationSettingsSchema,
  deleteAccountSchema,
} from '../validators/user.validator.js';

const router = Router();
router.use(requireAuth);

router.get('/me', user.getProfile);
router.patch('/me', validate(updateProfileSchema), user.updateProfile);
router.post('/me/avatar', uploadImages.single('avatar'), user.uploadAvatar);
router.patch('/me/notifications', validate(notificationSettingsSchema), user.updateNotificationSettings);
router.get('/me/activity', user.getActivityTimeline);
router.delete('/me', validate(deleteAccountSchema), user.deleteAccount);

export default router;
