import { authService } from './auth.service.js';
import { z } from 'zod';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'WAITER', 'KITCHEN']).optional(),
  branchId: z.string().optional(),
}).refine((data) => {
  if (data.role === 'WAITER' || data.role === 'KITCHEN') {
    return !!data.branchId?.trim();
  }
  return true;
}, { message: 'Branch is required for Waiter and Kitchen roles', path: ['branchId'] }).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const authController = {
  async login(req, res, next) {
    try {
      const body = loginSchema.parse(req.body);
      const result = await authService.login(body.email, body.password);
      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  },

  async register(req, res, next) {
    try {
      const body = registerSchema.parse(req.body);
      const { confirmPassword, ...rest } = body;
      const result = await authService.register(rest);
      res.status(201).json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  },

  async profile(req, res, next) {
    try {
      const user = await authService.getProfile(req.userId);
      res.json({ success: true, user });
    } catch (e) {
      next(e);
    }
  },
};
