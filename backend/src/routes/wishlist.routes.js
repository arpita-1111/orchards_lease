import { Router } from 'express';
import * as wishlist from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();
router.use(requireAuth, restrictTo(ROLES.RENTER));

router.get('/', wishlist.getWishlist);
router.post('/:orchardId/toggle', wishlist.toggleWishlist);

router.get('/compare', wishlist.getCompareList);
router.post('/compare/:orchardId/toggle', wishlist.toggleCompare);
router.delete('/compare', wishlist.clearCompare);

router.get('/recently-viewed', wishlist.getRecentlyViewed);

export default router;
