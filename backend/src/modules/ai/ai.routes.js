import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate, attachUser, requireRoles } from '../../middleware/auth.js';
const router = Router();

router.get('/status', aiController.status);
router.post('/insights/sales', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), aiController.salesInsight);
router.post('/insights/low-stock', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), aiController.lowStockRecommendation);

export default router;
