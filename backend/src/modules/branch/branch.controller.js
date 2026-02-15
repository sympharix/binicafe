import { branchService } from './branch.service.js';
import { z } from 'zod';

const createBranchSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
});
const updateBranchSchema = createBranchSchema.partial();

export const branchController = {
  async list(req, res, next) {
    try {
      const branches = await branchService.list();
      res.json({ success: true, data: branches });
    } catch (e) {
      next(e);
    }
  },

  async getById(req, res, next) {
    try {
      const branch = await branchService.getById(req.params.id);
      res.json({ success: true, data: branch });
    } catch (e) {
      next(e);
    }
  },

  async create(req, res, next) {
    try {
      const body = createBranchSchema.parse(req.body);
      const branch = await branchService.create(body);
      res.status(201).json({ success: true, data: branch });
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const body = updateBranchSchema.parse(req.body);
      const branch = await branchService.update(req.params.id, body);
      res.json({ success: true, data: branch });
    } catch (e) {
      next(e);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await branchService.getCategories(req.params.branchId);
      res.json({ success: true, data: categories });
    } catch (e) {
      next(e);
    }
  },

  async getItems(req, res, next) {
    try {
      const items = await branchService.getItems(
        req.params.branchId,
        req.query.categoryId
      );
      res.json({ success: true, data: items });
    } catch (e) {
      next(e);
    }
  },

  async getTables(req, res, next) {
    try {
      const tables = await branchService.getTables(req.params.branchId);
      res.json({ success: true, data: tables });
    } catch (e) {
      next(e);
    }
  },

  async createCategory(req, res, next) {
    try {
      const body = z.object({ name: z.string(), sortOrder: z.number().optional() }).parse(req.body);
      const data = await branchService.createCategory(req.params.branchId, body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async updateCategory(req, res, next) {
    try {
      const body = z.object({ name: z.string(), sortOrder: z.number() }).partial().parse(req.body);
      const data = await branchService.updateCategory(req.params.branchId, req.params.id, body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async deleteCategory(req, res, next) {
    try {
      await branchService.deleteCategory(req.params.branchId, req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  async createItem(req, res, next) {
    try {
      const body = z.object({
        categoryId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        available: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }).parse(req.body);
      const data = await branchService.createItem(req.params.branchId, body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async updateItem(req, res, next) {
    try {
      const body = z.object({
        name: z.string(),
        categoryId: z.string(),
        description: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        available: z.boolean(),
        sortOrder: z.number().optional(),
      }).partial().parse(req.body);
      const data = await branchService.updateItem(req.params.branchId, req.params.id, body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async toggleItemAvailable(req, res, next) {
    try {
      const data = await branchService.toggleItemAvailable(req.params.branchId, req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async deleteItem(req, res, next) {
    try {
      await branchService.deleteItem(req.params.branchId, req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  async createTable(req, res, next) {
    try {
      const body = z.object({
        number: z.string(),
        capacity: z.number(),
        zone: z.string().optional(),
        status: z.enum(['EMPTY', 'OCCUPIED', 'RESERVED']).optional(),
      }).parse(req.body);
      const data = await branchService.createTable(req.params.branchId, body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async updateTable(req, res, next) {
    try {
      const body = z.object({
        number: z.string(),
        capacity: z.number(),
        zone: z.string(),
        status: z.enum(['EMPTY', 'OCCUPIED', 'RESERVED']),
      }).partial().parse(req.body);
      const data = await branchService.updateTable(req.params.branchId, req.params.id, body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async updateTableStatus(req, res, next) {
    try {
      const body = z.object({ status: z.enum(['EMPTY', 'OCCUPIED', 'RESERVED']) }).parse(req.body);
      const data = await branchService.updateTableStatus(req.params.branchId, req.params.id, body.status);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async deleteTable(req, res, next) {
    try {
      await branchService.deleteTable(req.params.branchId, req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
