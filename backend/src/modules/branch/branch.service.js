import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/errors.js';
import { emitToBranch } from '../../socket/index.js';

export const branchService = {
  async list() {
    return prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id) {
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: { select: { tables: true, orders: true } },
      },
    });
    if (!branch) throw new AppError('Branch not found', 404);
    return branch;
  },

  async create(data) {
    return prisma.branch.create({
      data: {
        name: data.name,
        address: data.address,
        timezone: data.timezone || 'UTC',
        isActive: data.isActive !== false,
      },
    });
  },

  async update(id, data) {
    await prisma.branch.findUniqueOrThrow({ where: { id } });
    return prisma.branch.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        timezone: data.timezone,
        isActive: data.isActive,
      },
    });
  },

  async getCategories(branchId) {
    return prisma.category.findMany({
      where: { branchId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  },

  async getItems(branchId, categoryId) {
    const where = { branchId };
    if (categoryId) where.categoryId = categoryId;
    return prisma.item.findMany({
      where,
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async getTables(branchId) {
    return prisma.table.findMany({
      where: { branchId },
      orderBy: { number: 'asc' },
    });
  },

  async createCategory(branchId, data) {
    return prisma.category.create({
      data: { branchId, name: data.name, sortOrder: data.sortOrder ?? 0 },
    });
  },
  async updateCategory(branchId, id, data) {
    await prisma.category.findFirstOrThrow({ where: { id, branchId } });
    return prisma.category.update({
      where: { id },
      data: { name: data.name, sortOrder: data.sortOrder },
    });
  },
  async deleteCategory(branchId, id) {
    await prisma.category.findFirstOrThrow({ where: { id, branchId } });
    return prisma.category.delete({ where: { id } });
  },

  async createItem(branchId, data) {
    return prisma.item.create({
      data: {
        branchId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        available: data.available !== false,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  },
  async updateItem(branchId, id, data) {
    await prisma.item.findFirstOrThrow({ where: { id, branchId } });
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.available !== undefined) updateData.available = data.available;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    return prisma.item.update({
      where: { id },
      data: updateData,
    });
  },
  async toggleItemAvailable(branchId, id) {
    const item = await prisma.item.findFirstOrThrow({ where: { id, branchId } });
    return prisma.item.update({
      where: { id },
      data: { available: !item.available },
    });
  },
  async deleteItem(branchId, id) {
    await prisma.item.findFirstOrThrow({ where: { id, branchId } });
    return prisma.item.delete({ where: { id } });
  },

  async createTable(branchId, data) {
    return prisma.table.create({
      data: {
        branchId,
        number: data.number,
        capacity: data.capacity,
        zone: data.zone,
        status: data.status ?? 'EMPTY',
      },
    });
  },
  async updateTable(branchId, id, data) {
    await prisma.table.findFirstOrThrow({ where: { id, branchId } });
    return prisma.table.update({
      where: { id },
      data: { number: data.number, capacity: data.capacity, zone: data.zone, status: data.status },
    });
  },
  async updateTableStatus(branchId, id, status) {
    await prisma.table.findFirstOrThrow({ where: { id, branchId } });
    const table = await prisma.table.update({ where: { id }, data: { status } });
    emitToBranch(branchId, 'table:status', { tableId: id, status, table });
    return table;
  },
  async deleteTable(branchId, id) {
    await prisma.table.findFirstOrThrow({ where: { id, branchId } });
    return prisma.table.delete({ where: { id } });
  },
};
