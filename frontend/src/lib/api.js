/**
 * API client for RMS backend
 * When VITE_MOCK_MODE=true, uses mock data (for frontend-only / live deployment)
 */

import { APP_CONFIG } from '../config/constants';
import {
  mockAuthApi,
  mockBranchesApi,
  mockOrdersApi,
  mockAnalyticsApi,
  mockNotificationsApi,
  mockInventoryApi,
} from './mockApi.js';

const baseUrl = APP_CONFIG.apiBaseUrl;

let tokenGetter = () => null;

export function setApiToken(getter) {
  tokenGetter = getter;
}

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = tokenGetter();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error || data?.message || `API error: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (endpoint, params) => {
    const qs = params && Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return request(endpoint + qs, { method: 'GET' });
  },
  post: (endpoint, body) =>
    request(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (endpoint, body) =>
    request(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body) =>
    request(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Real API implementations
const realAuthApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
};
const realBranchesApi = {
  list: () => api.get('/branches'),
  get: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  getCategories: (branchId) => api.get(`/branches/${branchId}/categories`),
  getItems: (branchId, categoryId) =>
    api.get(`/branches/${branchId}/items`, categoryId ? { categoryId } : {}),
  getTables: (branchId) => api.get(`/branches/${branchId}/tables`),
  createCategory: (branchId, data) => api.post(`/branches/${branchId}/categories`, data),
  updateCategory: (branchId, id, data) => api.put(`/branches/${branchId}/categories/${id}`, data),
  deleteCategory: (branchId, id) => api.delete(`/branches/${branchId}/categories/${id}`),
  createItem: (branchId, data) => api.post(`/branches/${branchId}/items`, data),
  updateItem: (branchId, id, data) => api.put(`/branches/${branchId}/items/${id}`, data),
  toggleItemAvailable: (branchId, id) => api.patch(`/branches/${branchId}/items/${id}/available`),
  deleteItem: (branchId, id) => api.delete(`/branches/${branchId}/items/${id}`),
  createTable: (branchId, data) => api.post(`/branches/${branchId}/tables`, data),
  updateTable: (branchId, id, data) => api.put(`/branches/${branchId}/tables/${id}`, data),
  updateTableStatus: (branchId, id, status) =>
    api.patch(`/branches/${branchId}/tables/${id}/status`, { status }),
  deleteTable: (branchId, id) => api.delete(`/branches/${branchId}/tables/${id}`),
};
const realOrdersApi = {
  list: (branchId, filters = {}) => api.get('/orders', { branchId, ...filters }),
  get: (id, branchId) => api.get(`/orders/${id}`, { branchId }),
  create: (body, branchId) => api.post('/orders', { ...body, branchId }),
  updateStatus: (id, status, branchId) => api.patch(`/orders/${id}/status`, { status, branchId }),
  cancel: (id, branchId) =>
    api.delete(`/orders/${id}${branchId ? '?branchId=' + encodeURIComponent(branchId) : ''}`),
};
const realAnalyticsApi = {
  dashboard: (branchId, todayOnly = true) =>
    api.get('/analytics/dashboard', { branchId, todayOnly: todayOnly.toString() }),
  sales: (branchId, from, to) => api.get('/analytics/sales', { branchId, from, to }),
  forecast: (branchId, horizon = '7d') => api.get('/analytics/forecast', { branchId, horizon }),
  waste: (branchId, from, to) => api.get('/analytics/waste', { branchId, from, to }),
  wasteIntelligence: (branchId, from, to) => api.get('/analytics/waste-intelligence', { branchId, from, to }),
  executive: (from, to) => api.get('/analytics/executive', { from, to }),
};
const realNotificationsApi = {
  list: (params = {}) => api.get('/notifications', params),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};
const realInventoryApi = {
  list: (branchId) => api.get('/inventory', { branchId }),
  getLowStock: (branchId) => api.get('/inventory/low-stock', { branchId }),
  get: (id, branchId) => api.get(`/inventory/${id}`, { branchId }),
  create: (branchId, data) => api.post('/inventory', { ...data, branchId }),
  update: (id, branchId, data) => api.put(`/inventory/${id}`, { ...data, branchId }),
  addMovement: (id, branchId, data) =>
    api.post(`/inventory/${id}/movement`, { ...data, branchId }),
  logWaste: (id, branchId, data) =>
    api.post(`/inventory/${id}/waste`, { ...data, branchId }),
};

// Export mock or real based on config
export const authApi = APP_CONFIG.mockMode ? mockAuthApi : realAuthApi;
export const branchesApi = APP_CONFIG.mockMode ? mockBranchesApi : realBranchesApi;
export const ordersApi = APP_CONFIG.mockMode ? mockOrdersApi : realOrdersApi;
export const analyticsApi = APP_CONFIG.mockMode ? mockAnalyticsApi : realAnalyticsApi;
export const notificationsApi = APP_CONFIG.mockMode ? mockNotificationsApi : realNotificationsApi;
export const inventoryApi = APP_CONFIG.mockMode ? mockInventoryApi : realInventoryApi;
