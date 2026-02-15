/**
 * Prompt templates for AI layer (insights, recommendations, demand).
 */

export const PROMPTS = {
  salesInsight: (data) =>
    `You are a restaurant analytics assistant. Based on this sales data, give a short insight (1-2 sentences) and one actionable recommendation.\nData: ${JSON.stringify(data)}`,

  demandSuggestion: (itemName, recentOrders) =>
    `Restaurant inventory assistant. Item "${itemName}". Recent order frequency: ${JSON.stringify(recentOrders)}. Suggest whether to increase stock (yes/no) and a short reason.`,

  lowStockRecommendation: (items) =>
    `Restaurant stock alert. These items are low: ${JSON.stringify(items)}. Give one short paragraph: priority order to reorder and a generic tip.`,

  menuRecommendation: (topItems, slowItems) =>
    `Restaurant menu assistant. Top sellers: ${JSON.stringify(topItems)}. Slower items: ${JSON.stringify(slowItems)}. One short suggestion to improve menu or promotions.`,
};
