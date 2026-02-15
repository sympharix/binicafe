import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate, attachUser, requireRoles } from '../../middleware/auth.js';
const router = Router();

router.use(authenticate, attachUser);

router.get('/sales', requireRoles('ADMIN', 'MANAGER'), analyticsController.salesReport);
router.get('/dashboard', analyticsController.dashboard);
router.get('/forecast', requireRoles('ADMIN', 'MANAGER'), analyticsController.forecast);
router.get('/waste', requireRoles('ADMIN', 'MANAGER'), analyticsController.waste);
router.get('/waste-intelligence', requireRoles('ADMIN', 'MANAGER'), analyticsController.wasteIntelligence);
router.get('/executive', requireRoles('ADMIN'), analyticsController.executive);

export default router;
