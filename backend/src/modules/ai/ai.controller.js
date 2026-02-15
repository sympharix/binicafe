import { aiService } from '../../ai/ai.service.js';

export const aiController = {
  async status(req, res) {
    res.json({ success: true, enabled: aiService.isEnabled() });
  },

  async salesInsight(req, res, next) {
    try {
      const data = req.body || {};
      const result = await aiService.getSalesInsight(data);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },

  async lowStockRecommendation(req, res, next) {
    try {
      const items = req.body?.items ?? [];
      const result = await aiService.getLowStockRecommendation(items);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
};
