import { Router } from 'express';
import {
  getOrchardAvailability,
  updateOrchardAvailability,
} from '../controllers/availability.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });

// GET /api/orchards/:id/availability (Public)
router.get('/:id/availability', getOrchardAvailability);

// PUT /api/orchards/:id/availability (Protected / Seller)
router.put('/:id/availability', protect, updateOrchardAvailability);

export default router;