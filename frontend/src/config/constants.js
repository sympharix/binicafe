/**
 * RMS App — Frontend config
 * API base URL will be set when backend is ready.
 */

export const APP_CONFIG = {
  name: 'RMS',
  tagline: 'Restaurant Management',
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
  /** Set VITE_MOCK_MODE=true for frontend-only deployment (no backend) — enables demo login with mock data */
  mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
};

export const ROUTES = {
  dashboard: '/',
  menu: '/menu',
  tables: '/tables',
  orders: '/orders',
  kitchen: '/kitchen',
  inventory: '/inventory',
  analytics: '/analytics',
  executive: '/executive',
  login: '/login',
  register: '/register',
};

export const NAV_ITEMS = [
  { path: ROUTES.dashboard, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.menu, label: 'Menu', icon: 'UtensilsCrossed' },
  { path: ROUTES.tables, label: 'Tables', icon: 'LayoutGrid' },
  { path: ROUTES.orders, label: 'Orders', icon: 'Receipt' },
  { path: ROUTES.kitchen, label: 'Kitchen', icon: 'ChefHat' },
  { path: ROUTES.inventory, label: 'Inventory', icon: 'Package' },
  { path: ROUTES.analytics, label: 'Analytics', icon: 'BarChart3' },
  { path: ROUTES.executive, label: 'Executive', icon: 'Building2', adminOnly: true },
];

export const TABLE_STATUS = {
  empty: { label: 'Empty', color: 'slate' },
  occupied: { label: 'Occupied', color: 'amber' },
  reserved: { label: 'Reserved', color: 'blue' },
};

export const ORDER_STATUS = {
  PENDING: { label: 'Pending', color: 'slate' },
  pending: { label: 'Pending', color: 'slate' },
  SENT: { label: 'Sent', color: 'blue' },
  sent: { label: 'Sent', color: 'blue' },
  PREPARING: { label: 'Preparing', color: 'amber' },
  preparing: { label: 'Preparing', color: 'amber' },
  READY: { label: 'Ready', color: 'emerald' },
  ready: { label: 'Ready', color: 'emerald' },
  SERVED: { label: 'Served', color: 'slate' },
  served: { label: 'Served', color: 'slate' },
};
