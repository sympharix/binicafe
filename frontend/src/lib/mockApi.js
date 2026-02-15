/**
 * Mock API — returns mock data when VITE_MOCK_MODE=true.
 * Enables demo login and browsing on frontend-only deployments.
 */

import {
  MOCK_USER,
  MOCK_BRANCHES,
  MOCK_CATEGORIES,
  MOCK_ITEMS,
  MOCK_TABLES,
  MOCK_ORDERS,
  MOCK_DASHBOARD,
  MOCK_SALES,
  MOCK_FORECAST,
  MOCK_WASTE,
  MOCK_EXECUTIVE,
  MOCK_INVENTORY,
  MOCK_NOTIFICATIONS,
  mockRequest,
} from './mockData.js';

const wrap = (data) => ({ success: true, data });

export const mockAuthApi = {
  login: async (email, password) => {
    await mockRequest(() => {});
    if (email === 'admin@rms.local' && password === 'admin123') {
      return { success: true, user: MOCK_USER, token: 'mock-token-' + Date.now() };
    }
    throw new Error('Invalid email or password');
  },
  register: async () => {
    await mockRequest(() => {});
    throw new Error('Registration disabled in demo mode');
  },
  profile: async () => {
    await mockRequest(() => {});
    return wrap(MOCK_USER);
  },
};

export const mockBranchesApi = {
  list: async () => mockRequest(() => wrap(MOCK_BRANCHES)),
  get: async (id) => mockRequest(() => wrap(MOCK_BRANCHES.find((b) => b.id === id) || MOCK_BRANCHES[0])),
  create: async () => mockRequest(() => wrap(MOCK_BRANCHES[0])),
  update: async () => mockRequest(() => wrap(MOCK_BRANCHES[0])),
  getCategories: async () => mockRequest(() => wrap(MOCK_CATEGORIES)),
  getItems: async (branchId, categoryId) => {
    await mockRequest(() => {});
    let items = MOCK_ITEMS;
    if (categoryId) items = items.filter((i) => i.categoryId === categoryId);
    return wrap(items);
  },
  getTables: async () => mockRequest(() => wrap(MOCK_TABLES)),
  createCategory: async () => mockRequest(() => wrap({ id: 'mock-cat-new', name: 'New' })),
  updateCategory: async () => mockRequest(() => wrap(MOCK_CATEGORIES[0])),
  deleteCategory: async () => mockRequest(() => ({ success: true })),
  createItem: async () => mockRequest(() => wrap(MOCK_ITEMS[0])),
  updateItem: async () => mockRequest(() => wrap(MOCK_ITEMS[0])),
  toggleItemAvailable: async () => mockRequest(() => wrap(MOCK_ITEMS[0])),
  deleteItem: async () => mockRequest(() => ({ success: true })),
  createTable: async () => mockRequest(() => wrap(MOCK_TABLES[0])),
  updateTable: async () => mockRequest(() => wrap(MOCK_TABLES[0])),
  updateTableStatus: async () => mockRequest(() => wrap(MOCK_TABLES[0])),
  deleteTable: async () => mockRequest(() => ({ success: true })),
};

export const mockOrdersApi = {
  list: async () => mockRequest(() => wrap(MOCK_ORDERS)),
  get: async () => mockRequest(() => wrap(MOCK_ORDERS[0])),
  create: async () => mockRequest(() => wrap(MOCK_ORDERS[0])),
  updateStatus: async () => mockRequest(() => wrap(MOCK_ORDERS[0])),
  cancel: async () => mockRequest(() => ({ success: true })),
};

export const mockAnalyticsApi = {
  dashboard: (branchId, todayOnly = true) => Promise.resolve({ data: MOCK_DASHBOARD }),
  sales: (branchId, from, to) => Promise.resolve({ data: MOCK_SALES }),
  forecast: (branchId, horizon = '7d') => Promise.resolve({ data: MOCK_FORECAST }),
  waste: (branchId, from, to) => Promise.resolve({ data: MOCK_WASTE }),
  wasteIntelligence: (branchId, from, to) => Promise.resolve({ data: MOCK_WASTE_INTELLIGENCE }),
  executive: (from, to) => Promise.resolve({ data: MOCK_EXECUTIVE }),
};

export const mockNotificationsApi = {
  list: async () => mockRequest(() => wrap(MOCK_NOTIFICATIONS)),
  markRead: async () => mockRequest(() => ({ success: true })),
  markAllRead: async () => mockRequest(() => ({ success: true })),
};

export const mockInventoryApi = {
  list: async () => mockRequest(() => wrap(MOCK_INVENTORY)),
  getLowStock: async () => mockRequest(() => wrap(MOCK_INVENTORY.filter((i) => i.quantity <= i.minQuantity))),
  get: async () => mockRequest(() => wrap(MOCK_INVENTORY[0])),
  create: async () => mockRequest(() => wrap(MOCK_INVENTORY[0])),
  update: async () => mockRequest(() => wrap(MOCK_INVENTORY[0])),
  addMovement: async () => mockRequest(() => wrap(MOCK_INVENTORY[0])),
  logWaste: async () => mockRequest(() => wrap(MOCK_INVENTORY[0])),
};
