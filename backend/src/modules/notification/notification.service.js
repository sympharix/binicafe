import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/errors.js';
import { emitToBranch } from '../../socket/index.js';

export const notificationService = {
  async create(branchId, { userId, type, title, body }) {
    const notif = await prisma.notification.create({
      data: {
        branchId,
        userId: userId || null,
        type: type || 'info',
        title,
        body: body || null,
      },
    });
    emitToBranch(branchId, 'notification:new', notif);
    return notif;
  },

  async createOrderReady(branchId, orderId, tableNumber) {
    const notif = await prisma.notification.create({
      data: {
        branchId,
        type: 'order_ready',
        title: 'Order ready for pickup',
        body: `Order ${orderId} — Table ${tableNumber || '?'}`,
      },
    });
    emitToBranch(branchId, 'notification:new', notif);
    return notif;
  },

  async createLowStock(branchId, inventoryItemName) {
    const notif = await prisma.notification.create({
      data: {
        branchId,
        type: 'low_stock',
        title: 'Low stock alert',
        body: `${inventoryItemName} is below minimum.`,
      },
    });
    emitToBranch(branchId, 'notification:new', notif);
    return notif;
  },

  async list(userId, branchId, { unreadOnly = false } = {}) {
    const where = {};
    if (userId) where.userId = userId;
    if (branchId) where.branchId = branchId;
    if (unreadOnly) where.read = false;
    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async markRead(id, userId) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    return { success: true };
  },

  async markAllRead(userId, branchId) {
    const where = { read: false };
    if (userId) where.userId = userId;
    if (branchId) where.branchId = branchId;
    await prisma.notification.updateMany({ where, data: { read: true } });
    return { success: true };
  },
};
