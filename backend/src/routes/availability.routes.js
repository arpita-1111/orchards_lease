import { Router } from 'express';
import {
  getOrchardAvailability,
  updateOrchardAvailability,
} from '../controllers/availability.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
const router = Router({ mergeParams: true });

// GET /api/orchards/:id/availability (Public)
router.get('/:id/availability', getOrchardAvailability);

// PUT /api/orchards/:id/availability (Protected / Seller)
router.put('/:id/availability', requireAuth, updateOrchardAvailability);

export default router;