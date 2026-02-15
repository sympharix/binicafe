import { orderService } from './order.service.js';
import { z } from 'zod';

const createOrderSchema = z.object({
  tableId: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().int().min(1),
    notes: z.string().optional(),
  })).min(1),
});
const statusSchema = z.object({ status: z.enum(['PENDING', 'SENT', 'PREPARING', 'READY', 'SERVED']) });

export const orderController = {
  async list(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      const orders = await orderService.list(branchId, {
        tableId: req.query.tableId,
        status: req.query.status,
      });
      res.json({ success: true, data: orders });
    } catch (e) {
      next(e);
    }
  },

  async getById(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      const order = await orderService.getById(req.params.id, branchId);
      res.json({ success: true, data: order });
    } catch (e) {
      next(e);
    }
  },

  async create(req, res, next) {
    try {
      const branchId = req.body.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      const body = createOrderSchema.parse(req.body);
      const order = await orderService.create(branchId, body, req.userId);
      res.status(201).json({ success: true, data: order });
    } catch (e) {
      next(e);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const branchId = req.body.branchId || req.user?.branchId;
      const { status } = statusSchema.parse(req.body);
      const order = await orderService.updateStatus(req.params.id, branchId, status, req.userId);
      res.json({ success: true, data: order });
    } catch (e) {
      next(e);
    }
  },

  async cancel(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      await orderService.cancel(req.params.id, branchId);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
