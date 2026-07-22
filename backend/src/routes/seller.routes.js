import { Router } from 'express';
import * as seller from '../controllers/seller.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();
router.use(requireAuth, restrictTo(ROLES.SELLER, ROLES.ADMIN));

router.get('/overview', seller.getOverview);
router.get('/revenue', seller.getRevenue);
router.get('/performance', seller.getPerformance);
router.get('/reviews', seller.getSellerReviews);
router.get('/export/bookings', seller.exportBookingsCsv);

export default router;

