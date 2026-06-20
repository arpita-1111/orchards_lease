import { Router } from 'express';
import * as meta from '../controllers/meta.controller.js';

const router = Router();

router.get('/filters', meta.getFilterOptions);
router.get('/settings', meta.getPublicSettings);
router.get('/featured', meta.getFeaturedOrchards);

export default router;
