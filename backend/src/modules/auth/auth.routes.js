import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate, attachUser, requireRoles } from '../../middleware/auth.js';
const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);

router.get('/profile', authenticate, attachUser, authController.profile);

export default router;
