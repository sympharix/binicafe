import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authenticate, attachUser } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;
