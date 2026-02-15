import { Router } from 'express';
import { orderController } from './order.controller.js';
import { authenticate, attachUser } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/', orderController.list);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.patch('/:id/status', orderController.updateStatus);
router.delete('/:id', orderController.cancel);

export default router;
