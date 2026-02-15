import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/errors.js';
import { notificationService } from '../notification/notification.service.js';
import { emitToBranch } from '../../socket/index.js';

export const inventoryService = {
  async list(branchId) {
    return prisma.inventoryItem.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
      include: { item: { select: { id: true, name: true } } },
    });
  },

  async getById(id, branchId) {
    const inv = await prisma.inventoryItem.findFirst({
      where: { id, branchId },
      include: {
        item: true,
        movements: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!inv) throw new AppError('Inventory item not found', 404);
    return inv;
  },

  async create(branchId, data) {
    return prisma.inventoryItem.create({
      data: {
        branchId,
        itemId: data.itemId || null,
        name: data.name,
        unit: data.unit || 'unit',
        quantity: data.quantity ?? 0,
        minQuantity: data.minQuantity ?? 0,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchaseCost: data.purchaseCost ?? null,
      },
    });
  },

  async update(id, branchId, data) {
    await prisma.inventoryItem.findFirstOrThrow({ where: { id, branchId } });
    const updateData = {
      name: data.name,
      unit: data.unit,
      minQuantity: data.minQuantity,
    };
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null;
    if (data.purchaseCost !== undefined) updateData.purchaseCost = data.purchaseCost ?? null;
    return prisma.inventoryItem.update({
      where: { id },
      data: updateData,
    });
  },

  async logWaste(branchId, inventoryItemId, { quantity, reason, cost }) {
    const inv = await prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, branchId },
    });
    if (!inv) throw new AppError('Inventory item not found', 404);
    if (inv.quantity < quantity) throw new AppError('Insufficient quantity', 400);

    const costPerUnit = cost != null && quantity > 0 ? cost / quantity : null;

    await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { quantity: inv.quantity - quantity },
      }),
      prisma.stockMovement.create({
        data: {
          inventoryItemId,
          branchId,
          type: 'OUT',
          quantity,
          reason: reason ? `WASTE: ${reason}` : 'WASTE',
          costPerUnit,
        },
      }),
      prisma.wasteLog.create({
        data: {
          branchId,
          inventoryItemId,
          itemName: inv.name,
          quantity,
          reason: reason || 'OTHER',
          cost: cost ?? null,
        },
      }),
    ]);

    const updated = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { item: { select: { id: true, name: true } } },
    });
    emitToBranch(branchId, 'inventory:movement', { inventoryItemId, quantity: updated.quantity, type: 'OUT', item: updated });
    return updated;
  },

  async addMovement(branchId, inventoryItemId, { type, quantity, reason }) {
    const inv = await prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, branchId },
    });
    if (!inv) throw new AppError('Inventory item not found', 404);

    let newQty;
    let movementQty = quantity;
    if (type === 'IN') {
      newQty = inv.quantity + quantity;
    } else if (type === 'OUT') {
      if (inv.quantity < quantity) throw new AppError('Insufficient quantity', 400);
      newQty = inv.quantity - quantity;
    } else {
      newQty = Math.max(0, quantity);
      movementQty = newQty;
    }

    await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { quantity: newQty },
      }),
      prisma.stockMovement.create({
        data: {
          inventoryItemId,
          branchId,
          type,
          quantity: movementQty,
          reason: reason || null,
        },
      }),
    ]);

    const updated = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { item: { select: { id: true, name: true } } },
    });
    if (updated.quantity <= updated.minQuantity) {
      await notificationService.createLowStock(branchId, updated.name);
    }
    emitToBranch(branchId, 'inventory:movement', { inventoryItemId, quantity: newQty, type, item: updated });
    return updated;
  },

  async getLowStock(branchId) {
    return prisma.inventoryItem.findMany({
      where: {
        branchId,
        quantity: { lte: prisma.inventoryItem.fields.minQuantity },
      },
    });
  },
};
