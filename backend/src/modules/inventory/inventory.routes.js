import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { authenticate, attachUser, requireRoles } from '../../middleware/auth.js';
const router = Router();

router.use(authenticate, attachUser);

router.get('/', inventoryController.list);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/:id', inventoryController.getById);
router.post('/', requireRoles('ADMIN', 'MANAGER'), inventoryController.create);
router.put('/:id', requireRoles('ADMIN', 'MANAGER'), inventoryController.update);
router.post('/:id/movement', requireRoles('ADMIN', 'MANAGER'), inventoryController.addMovement);
router.post('/:id/waste', requireRoles('ADMIN', 'MANAGER'), inventoryController.logWaste);

export default router;
