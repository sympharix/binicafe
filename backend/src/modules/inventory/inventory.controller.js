import { inventoryService } from './inventory.service.js';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  itemId: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().min(0).optional(),
  minQuantity: z.number().min(0).optional(),
  expiryDate: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchaseCost: z.number().min(0).optional().nullable(),
});
const movementSchema = z.object({
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number().positive(),
  reason: z.string().optional(),
  costPerUnit: z.number().min(0).optional(),
});
const wasteSchema = z.object({
  quantity: z.number().positive(),
  reason: z.enum(['EXPIRED', 'DAMAGED', 'SPILL', 'OTHER']).optional(),
  cost: z.number().min(0).optional().nullable(),
});

export const inventoryController = {
  async list(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      const data = await inventoryService.list(branchId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getById(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      const data = await inventoryService.getById(req.params.id, branchId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async create(req, res, next) {
    try {
      const branchId = req.body.branchId || req.user?.branchId;
      const body = createSchema.parse(req.body);
      const data = await inventoryService.create(branchId, body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const branchId = req.body.branchId || req.user?.branchId;
      const body = createSchema.partial().parse(req.body);
      const data = await inventoryService.update(req.params.id, branchId, body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async addMovement(req, res, next) {
    try {
      const branchId = req.body.branchId || req.user?.branchId;
      const body = movementSchema.parse(req.body);
      const data = await inventoryService.addMovement(
        branchId,
        req.params.id,
        body
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async logWaste(req, res, next) {
    try {
      const branchId = req.body.branchId || req.user?.branchId;
      const body = wasteSchema.parse(req.body);
      const data = await inventoryService.logWaste(branchId, req.params.id, body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getLowStock(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      const data = await inventoryService.getLowStock(branchId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
