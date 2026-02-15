import { notificationService } from './notification.service.js';

export const notificationController = {
  async list(req, res, next) {
    try {
      const userId = req.userId;
      const branchId = req.query.branchId || req.user?.branchId;
      const unreadOnly = req.query.unreadOnly === 'true';
      const list = await notificationService.list(userId, branchId, { unreadOnly });
      res.json({ success: true, data: list });
    } catch (e) {
      next(e);
    }
  },

  async markRead(req, res, next) {
    try {
      await notificationService.markRead(req.params.id, req.userId);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  async markAllRead(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      await notificationService.markAllRead(req.userId, branchId);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
