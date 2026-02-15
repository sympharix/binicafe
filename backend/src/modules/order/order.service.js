import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/errors.js';
import { notificationService } from '../notification/notification.service.js';
import { emitToBranch } from '../../socket/index.js';

const validTransitions = {
  PENDING: ['SENT'],
  SENT: ['PREPARING'],
  PREPARING: ['READY'],
  READY: ['SERVED'],
  SERVED: [],
};

export const orderService = {
  async list(branchId, filters = {}) {
    const where = { branchId };
    if (filters.tableId) where.tableId = filters.tableId;
    if (filters.status) where.status = filters.status;
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        table: { select: { id: true, number: true, capacity: true, status: true } },
        orderItems: { include: { item: { select: { id: true, name: true, price: true } } } },
      },
    });
    return orders;
  },

  async getById(id, branchId) {
    const order = await prisma.order.findFirst({
      where: { id, branchId },
      include: {
        table: true,
        orderItems: { include: { item: true } },
      },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  },

  async create(branchId, data, userId) {
    const { tableId, notes, items } = data;
    const table = await prisma.table.findFirst({ where: { id: tableId, branchId } });
    if (!table) throw new AppError('Table not found', 404);

    const orderItems = [];
    let total = 0;
    for (const line of items) {
      const item = await prisma.item.findFirst({
        where: { id: line.itemId, branchId },
      });
      if (!item) throw new AppError(`Item not found: ${line.itemId}`, 404);
      orderItems.push({
        itemId: item.id,
        quantity: line.quantity,
        notes: line.notes || null,
        price: item.price,
      });
      total += item.price * line.quantity;
    }

    const order = await prisma.order.create({
      data: {
        branchId,
        tableId,
        notes: notes || null,
        status: 'PENDING',
        createdBy: userId,
        orderItems: { create: orderItems },
      },
      include: {
        table: true,
        orderItems: { include: { item: true } },
      },
    });

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status: 'OCCUPIED' },
    });
    emitToBranch(branchId, 'table:status', { tableId, status: 'OCCUPIED', table: updatedTable });
    emitToBranch(branchId, 'order:created', order);

    return order;
  },

  async updateStatus(id, branchId, newStatus, userId) {
    const order = await prisma.order.findFirst({ where: { id, branchId } });
    if (!order) throw new AppError('Order not found', 404);
    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(`Cannot transition from ${order.status} to ${newStatus}`, 400);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        table: true,
        orderItems: { include: { item: true } },
      },
    });

    if (newStatus === 'READY') {
      await notificationService.createOrderReady(branchId, order.id, order.table?.number);
    }
    if (newStatus === 'SERVED') {
      const ordersAtTable = await prisma.order.count({
        where: { tableId: order.tableId, status: { not: 'SERVED' } },
      });
      if (ordersAtTable === 0) {
        const tbl = await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'EMPTY' },
        });
        emitToBranch(branchId, 'table:status', { tableId: order.tableId, status: 'EMPTY', table: tbl });
      }
    }
    emitToBranch(branchId, 'order:status', updated);

    return updated;
  },

  async cancel(id, branchId) {
    const order = await prisma.order.findFirst({ where: { id, branchId } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'PENDING') {
      throw new AppError('Only pending orders can be cancelled', 400);
    }
    await prisma.order.delete({ where: { id } });
    const ordersAtTable = await prisma.order.count({
      where: { tableId: order.tableId },
    });
    if (ordersAtTable === 0) {
      const tbl = await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'EMPTY' },
      });
      emitToBranch(branchId, 'table:status', { tableId: order.tableId, status: 'EMPTY', table: tbl });
    }
    emitToBranch(branchId, 'order:cancelled', { orderId: id });
    return { success: true };
  },
};
