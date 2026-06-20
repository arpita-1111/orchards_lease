import { Router } from 'express';
import * as review from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from '../utils/constants.js';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();
router.use(requireAuth);

router.post('/', restrictTo(ROLES.RENTER), validate(createReviewSchema), review.createReview);
router.patch('/:id', validate({ params: idParam, ...updateReviewSchema }), review.updateReview);
router.delete('/:id', validate({ params: idParam }), review.deleteReview);
router.post('/:id/report', validate({ params: idParam }), review.reportReview);

export default router;
