/**
 * AI layer — optional integration with OpenAI (or compatible) API.
 * Used for: insights, demand hints, low-stock recommendations, menu suggestions.
 */

import { config } from '../config/index.js';
import { PROMPTS } from './prompts.js';

async function callOpenAI(prompt, options = {}) {
  if (!config.ai.enabled || !config.ai.openaiApiKey) {
    return { fallback: true, message: 'AI not configured. Set AI_ENABLED=true and OPENAI_API_KEY.' };
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.max_tokens || 300,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    return { text, usage: data.usage };
  } catch (e) {
    return { fallback: true, error: e.message };
  }
}

export const aiService = {
  async getSalesInsight(salesData) {
    const prompt = PROMPTS.salesInsight(salesData);
    return callOpenAI(prompt);
  },

  async getDemandSuggestion(itemName, recentOrders) {
    const prompt = PROMPTS.demandSuggestion(itemName, recentOrders);
    return callOpenAI(prompt);
  },

  async getLowStockRecommendation(lowStockItems) {
    const prompt = PROMPTS.lowStockRecommendation(lowStockItems);
    return callOpenAI(prompt);
  },

  async getMenuRecommendation(topItems, slowItems) {
    const prompt = PROMPTS.menuRecommendation(topItems, slowItems);
    return callOpenAI(prompt);
  },

  isEnabled() {
    return config.ai.enabled && !!config.ai.openaiApiKey;
  },
};
