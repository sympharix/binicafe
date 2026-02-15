/**
 * Mock data for frontend-only / live server deployment.
 * Used when VITE_MOCK_MODE=true (no backend available).
 */

const MOCK_BRANCH_ID = 'mock-branch-1';
const MOCK_CAT_ID = 'mock-cat-1';
const MOCK_ITEM_ID = 'mock-item-1';
const MOCK_TABLE_1 = 'mock-table-1';
const MOCK_TABLE_2 = 'mock-table-2';

export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'admin@rms.local',
  name: 'Admin',
  role: 'ADMIN',
  branchId: MOCK_BRANCH_ID,
};

export const MOCK_BRANCHES = [
  {
    id: MOCK_BRANCH_ID,
    name: 'Main Branch',
    address: '123 Restaurant St',
    timezone: 'UTC',
    isActive: true,
  },
];

export const MOCK_CATEGORIES = [
  { id: MOCK_CAT_ID, name: 'Mains', sortOrder: 0, branchId: MOCK_BRANCH_ID, _count: { items: 3 } },
  { id: 'mock-cat-2', name: 'Starters', sortOrder: 1, branchId: MOCK_BRANCH_ID, _count: { items: 2 } },
  { id: 'mock-cat-3', name: 'Drinks', sortOrder: 2, branchId: MOCK_BRANCH_ID, _count: { items: 2 } },
];

export const MOCK_ITEMS = [
  { id: MOCK_ITEM_ID, name: 'Grilled Salmon', categoryId: MOCK_CAT_ID, price: 18.5, available: true, sortOrder: 0, category: { id: MOCK_CAT_ID, name: 'Mains' } },
  { id: 'mock-item-2', name: 'Beef Burger', categoryId: MOCK_CAT_ID, price: 14.99, available: true, sortOrder: 1, category: { id: MOCK_CAT_ID, name: 'Mains' } },
  { id: 'mock-item-3', name: 'Caesar Salad', categoryId: MOCK_CAT_ID, price: 12.5, available: true, sortOrder: 2, category: { id: MOCK_CAT_ID, name: 'Mains' } },
  { id: 'mock-item-4', name: 'Soup of the Day', categoryId: 'mock-cat-2', price: 6.99, available: true, sortOrder: 0, category: { id: 'mock-cat-2', name: 'Starters' } },
  { id: 'mock-item-5', name: 'Garlic Bread', categoryId: 'mock-cat-2', price: 4.5, available: true, sortOrder: 1, category: { id: 'mock-cat-2', name: 'Starters' } },
  { id: 'mock-item-6', name: 'Iced Tea', categoryId: 'mock-cat-3', price: 3.5, available: true, sortOrder: 0, category: { id: 'mock-cat-3', name: 'Drinks' } },
  { id: 'mock-item-7', name: 'Fresh Orange Juice', categoryId: 'mock-cat-3', price: 5.0, available: true, sortOrder: 1, category: { id: 'mock-cat-3', name: 'Drinks' } },
];

export const MOCK_TABLES = [
  { id: MOCK_TABLE_1, number: 'T1', capacity: 2, zone: null, status: 'EMPTY', branchId: MOCK_BRANCH_ID },
  { id: MOCK_TABLE_2, number: 'T2', capacity: 4, zone: null, status: 'OCCUPIED', branchId: MOCK_BRANCH_ID },
  { id: 'mock-table-3', number: 'T3', capacity: 6, zone: 'Patio', status: 'EMPTY', branchId: MOCK_BRANCH_ID },
];

export const MOCK_ORDERS = [
  {
    id: 'mock-order-1',
    tableId: MOCK_TABLE_2,
    branchId: MOCK_BRANCH_ID,
    status: 'PREPARING',
    notes: null,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    table: { id: MOCK_TABLE_2, number: 'T2', capacity: 4, status: 'OCCUPIED' },
    orderItems: [
      { id: 'oi-1', itemId: MOCK_ITEM_ID, quantity: 1, price: 18.5, item: { id: MOCK_ITEM_ID, name: 'Grilled Salmon', price: 18.5 } },
      { id: 'oi-2', itemId: 'mock-item-6', quantity: 2, price: 3.5, item: { id: 'mock-item-6', name: 'Iced Tea', price: 3.5 } },
    ],
  },
  {
    id: 'mock-order-2',
    tableId: MOCK_TABLE_2,
    branchId: MOCK_BRANCH_ID,
    status: 'SENT',
    notes: 'No onions',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    table: { id: MOCK_TABLE_2, number: 'T2', capacity: 4, status: 'OCCUPIED' },
    orderItems: [
      { id: 'oi-3', itemId: 'mock-item-2', quantity: 1, price: 14.99, item: { id: 'mock-item-2', name: 'Beef Burger', price: 14.99 } },
    ],
  },
];

export const MOCK_DASHBOARD = {
  ordersToday: 12,
  servedToday: 8,
  totalTables: 3,
  lowStockAlerts: 2,
  revenueToday: 156.48,
};

export const MOCK_SALES = {
  from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  totalOrders: 42,
  totalRevenue: 892.34,
  topItems: [
    { name: 'Grilled Salmon', revenue: 240.5 },
    { name: 'Beef Burger', revenue: 179.88 },
    { name: 'Caesar Salad', revenue: 112.5 },
    { name: 'Iced Tea', revenue: 84.0 },
    { name: 'Fresh Orange Juice', revenue: 75.0 },
  ],
};

export const MOCK_FORECAST = {
  horizon: '7d',
  ordersPerDay: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    day,
    predicted: 5 + Math.floor(Math.random() * 4),
  })),
  topItemsDemand: [
    { name: 'Grilled Salmon', predictedPerDay: 3.2 },
    { name: 'Beef Burger', predictedPerDay: 2.8 },
    { name: 'Caesar Salad', predictedPerDay: 2.1 },
    { name: 'Iced Tea', predictedPerDay: 4.5 },
    { name: 'Fresh Orange Juice', predictedPerDay: 2.9 },
  ],
  peakHours: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: String(h).padStart(2, '0') + ':00',
    Sun: h >= 11 && h <= 14 ? 2 : 0,
    Mon: h >= 12 && h <= 14 ? 4 : 0,
    Tue: h >= 12 && h <= 14 ? 5 : 0,
    Wed: h >= 12 && h <= 14 ? 6 : 0,
    Thu: h >= 12 && h <= 14 ? 5 : 0,
    Fri: h >= 12 && h <= 21 ? 8 : 0,
    Sat: h >= 12 && h <= 21 ? 10 : 0,
  })),
};

export const MOCK_WASTE = {
  totalWastedValue: 45.50,
  expiryAlerts: [
    { id: 'inv-1', name: 'Fresh Tomatoes', quantity: 5, unit: 'kg', daysLeft: 2, cost: 12.50 },
    { id: 'inv-2', name: 'Dairy Products', quantity: 3, unit: 'liters', daysLeft: 5, cost: 8.00 },
  ],
  deadStock: [
    { id: 'inv-3', name: 'Rare Spice', quantity: 0.5, unit: 'kg', daysInactive: 45 },
  ],
  wasteLogs: [
    { id: 'w-1', itemName: 'Fresh Tomatoes', quantity: 2, reason: 'EXPIRED', cost: 5.00, createdAt: '2026-02-10T10:00:00Z' },
    { id: 'w-2', itemName: 'Dairy Products', quantity: 1, reason: 'DAMAGED', cost: 2.50, createdAt: '2026-02-08T14:30:00Z' },
  ],
  wasteTrend: [
    { date: '2026-02-08', cost: 3.50 },
    { date: '2026-02-09', cost: 4.00 },
    { date: '2026-02-10', cost: 2.00 },
  ],
};

export const MOCK_WASTE_INTELLIGENCE = {
  from: '2026-02-01',
  to: '2026-02-14',
  predictions: [
    { date: '2026-02-15', predictedWaste: 3.20, confidence: 95, riskFactors: { expiry: 2.50, seasonal: 1.1, historical: true } },
    { date: '2026-02-16', predictedWaste: 2.80, confidence: 90, riskFactors: { expiry: 1.80, seasonal: 1.0, historical: true } },
    { date: '2026-02-17', predictedWaste: 3.50, confidence: 85, riskFactors: { expiry: 3.20, seasonal: 1.1, historical: true } },
    { date: '2026-02-18', predictedWaste: 2.90, confidence: 80, riskFactors: { expiry: 2.10, seasonal: 1.0, historical: true } },
    { date: '2026-02-19', predictedWaste: 3.10, confidence: 75, riskFactors: { expiry: 1.90, seasonal: 1.1, historical: true } },
    { date: '2026-02-20', predictedWaste: 2.60, confidence: 70, riskFactors: { expiry: 1.70, seasonal: 1.2, historical: true } },
    { date: '2026-02-21', predictedWaste: 2.40, confidence: 65, riskFactors: { expiry: 1.60, seasonal: 1.2, historical: true } },
    { date: '2026-02-22', predictedWaste: 2.20, confidence: 60, riskFactors: { expiry: 1.50, seasonal: 1.1, historical: true } },
  ],
  suggestions: [
    {
      type: 'PRICING',
      priority: 'HIGH',
      title: 'Discount Near-Expiry Items',
      description: 'Apply 20-30% discount to 2 items expiring soon',
      potentialSavings: 6.25,
      actionItems: ['Fresh Tomatoes', 'Dairy Products'],
    },
    {
      type: 'ORDERING',
      priority: 'MEDIUM',
      title: 'Optimize Order Quantities',
      description: 'Reduce order quantities for high-waste items by 15-25%',
      potentialSavings: 8.50,
      actionItems: ['Fresh Tomatoes'],
    },
    {
      type: 'STORAGE',
      priority: 'MEDIUM',
      title: 'Improve Storage Conditions',
      description: 'Review temperature, humidity, and storage organization',
      potentialSavings: 4.75,
      actionItems: ['Temperature monitoring', 'Better organization', 'Regular inspection'],
    },
  ],
  wastePatterns: {
    topReasons: [
      { reason: 'EXPIRED', cost: 25.50, percentage: '56.0' },
      { reason: 'DAMAGED', cost: 15.00, percentage: '33.0' },
      { reason: 'SPILL', cost: 5.00, percentage: '11.0' },
    ],
    peakWasteDays: [
      { day: 'Mon', cost: 8.50 },
      { day: 'Tue', cost: 12.00 },
      { day: 'Wed', cost: 6.50 },
    ],
    problemItems: [
      { item: 'Fresh Tomatoes', cost: 15.50 },
      { item: 'Dairy Products', cost: 8.00 },
      { item: 'Lettuce', cost: 5.50 },
    ],
  },
  costSavings: {
    currentWasteCost: 45.50,
    potentialSavings: 19.50,
    percentageReduction: '42.9',
  },
};

export const MOCK_EXECUTIVE = {
  totalRevenue: 892.34,
  totalOrders: 42,
  branchRanking: [
    { branchId: MOCK_BRANCH_ID, branchName: 'Main Branch', orders: 42, revenue: 892.34, address: '123 Restaurant St' },
  ],
  topItems: [
    { name: 'Grilled Salmon', quantity: 13, revenue: 240.5 },
    { name: 'Beef Burger', quantity: 12, revenue: 179.88 },
    { name: 'Caesar Salad', quantity: 9, revenue: 112.5 },
  ],
};

export const MOCK_INVENTORY = [
  { id: 'inv-1', name: 'Fresh Tomatoes', unit: 'kg', quantity: 5, minQuantity: 10, branchId: MOCK_BRANCH_ID, item: { id: null, name: null } },
  { id: 'inv-2', name: 'Ground Beef', unit: 'kg', quantity: 25, minQuantity: 15, branchId: MOCK_BRANCH_ID, item: { id: null, name: null } },
  { id: 'inv-3', name: 'Salmon Fillet', unit: 'kg', quantity: 8, minQuantity: 5, branchId: MOCK_BRANCH_ID, item: { id: null, name: null } },
  { id: 'inv-4', name: 'Lettuce', unit: 'kg', quantity: 3, minQuantity: 5, branchId: MOCK_BRANCH_ID, item: { id: null, name: null } },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n-1', type: 'order_ready', title: 'Order ready', body: 'Table T2', read: false, meta: { tableNumber: 'T2' } },
];

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mockRequest(fn) {
  await delay(100 + Math.random() * 200);
  return fn();
}
