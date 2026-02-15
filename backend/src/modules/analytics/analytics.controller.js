import { analyticsService } from './analytics.service.js';

export const analyticsController = {
  async salesReport(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      const data = await analyticsService.getSalesReport(branchId, {
        from: req.query.from,
        to: req.query.to,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async dashboard(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      const todayOnly = req.query.todayOnly !== 'false';
      const data = await analyticsService.getDashboardStats(branchId, todayOnly);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async forecast(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      const horizon = req.query.horizon || '7d';
      const data = await analyticsService.getForecast(branchId, { horizon });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async waste(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      const data = await analyticsService.getWasteReport(branchId, {
        from: req.query.from,
        to: req.query.to,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async executive(req, res, next) {
    try {
      const data = await analyticsService.getExecutiveReport({
        from: req.query.from,
        to: req.query.to,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async wasteIntelligence(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branchId;
      if (!branchId) return res.status(400).json({ success: false, error: 'branchId required' });
      
      const data = await analyticsService.getWasteIntelligence(branchId, {
        from: req.query.from,
        to: req.query.to,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
