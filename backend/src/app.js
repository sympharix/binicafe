import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './utils/errors.js';

import authRoutes from './modules/auth/auth.routes.js';
import branchRoutes from './modules/branch/branch.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

const app = express();

app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, service: 'rms-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

export default app;
