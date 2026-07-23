import { Router } from 'express';
import {
  getOrchardAvailability,
  createBlockedDate,
  updateBlockedDate,
  deleteBlockedDate,
  updateOrchardAvailability,
} from '../controllers/availability.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBlockDateSchema,
  updateBlockDateSchema,
  blockIdParamSchema,
} from '../validators/availability.validator.js';

const router = Router({ mergeParams: true });

// GET /api/orchards/:id/availability (Public)
router.get('/:id/availability', getOrchardAvailability);

// POST /api/orchards/:id/block-dates (Protected / Seller / Admin)
router.post('/:id/block-dates', protect, validate(createBlockDateSchema), createBlockedDate);

// PUT /api/orchards/:id/block-dates/:blockId (Protected / Seller / Admin)
router.put('/:id/block-dates/:blockId', protect, validate(updateBlockDateSchema), updateBlockedDate);

// DELETE /api/orchards/:id/block-dates/:blockId (Protected / Seller / Admin)
router.delete('/:id/block-dates/:blockId', protect, validate(blockIdParamSchema), deleteBlockedDate);

// PUT /api/orchards/:id/availability (Legacy / Protected)
router.put('/:id/availability', protect, updateOrchardAvailability);

export default router;