import { Router } from 'express';
import { branchController } from './branch.controller.js';
import { authenticate, attachUser, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.get('/', branchController.list);

// More specific routes first (branchId + resource)
router.get('/:branchId/categories', branchController.getCategories);
router.get('/:branchId/items', branchController.getItems);
router.get('/:branchId/tables', branchController.getTables);

router.post('/:branchId/categories', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.createCategory);
router.put('/:branchId/categories/:id', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.updateCategory);
router.delete('/:branchId/categories/:id', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.deleteCategory);

router.post('/:branchId/items', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.createItem);
router.put('/:branchId/items/:id', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.updateItem);
router.patch('/:branchId/items/:id/available', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.toggleItemAvailable);
router.delete('/:branchId/items/:id', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.deleteItem);

router.post('/:branchId/tables', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.createTable);
router.put('/:branchId/tables/:id', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.updateTable);
router.patch('/:branchId/tables/:id/status', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.updateTableStatus);
router.delete('/:branchId/tables/:id', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.deleteTable);

router.get('/:id', branchController.getById);
router.post('/', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.create);
router.put('/:id', authenticate, attachUser, requireRoles('ADMIN', 'MANAGER'), branchController.update);

export default router;
