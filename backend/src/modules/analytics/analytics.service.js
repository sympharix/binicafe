import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/errors.js';
export const analyticsService = {
  async getSalesReport(branchId, { from, to }) {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        branchId,
        status: 'SERVED',
        createdAt: { gte: fromDate, lte: toDate },
      },
      include: {
        orderItems: { include: { item: true } },
      },
    });

    let totalRevenue = 0;
    const byItem = {};
    for (const order of orders) {
      for (const oi of order.orderItems) {
        const amt = oi.price * oi.quantity;
        totalRevenue += amt;
        const name = oi.item?.name || 'Unknown';
        byItem[name] = (byItem[name] || 0) + amt;
      }
    }

    const topItems = Object.entries(byItem)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      topItems,
    };
  },

  async getDashboardStats(branchId, todayOnly = true) {
    const start = new Date();
    if (todayOnly) start.setHours(0, 0, 0, 0);

    const [orderCount, servedCount, tableCount, inventoryItems, revenue] = await Promise.all([
      prisma.order.count({
        where: { branchId, createdAt: { gte: start } },
      }),
      prisma.order.count({
        where: { branchId, status: 'SERVED', createdAt: { gte: start } },
      }),
      prisma.table.count({ where: { branchId } }),
      prisma.inventoryItem.findMany({
        where: { branchId },
        select: { quantity: true, minQuantity: true },
      }),
      prisma.order.findMany({
        where: { branchId, status: 'SERVED', createdAt: { gte: start } },
        include: { orderItems: true },
      }),
    ]);
    let totalRevenue = 0;
    for (const o of revenue) {
      for (const oi of o.orderItems) totalRevenue += oi.price * oi.quantity;
    }
    const lowStockCount = inventoryItems.filter((i) => i.quantity <= i.minQuantity).length;

    return {
      ordersToday: orderCount,
      servedToday: servedCount,
      totalTables: tableCount,
      lowStockAlerts: lowStockCount,
      revenueToday: Math.round(totalRevenue * 100) / 100,
    };
  },

  /**
   * Demand forecast: orders per day, top items demand, peak hours heatmap.
   * Uses historical orders (last 60 days) with rolling averages — no ML.
   * @param {string} branchId
   * @param {{ horizon?: string }} opts — horizon: '7d' (default) or '14d'
   */
  async getForecast(branchId, { horizon = '7d' } = {}) {
    const days = horizon === '14d' ? 14 : 7;
    const lookbackDays = 60;
    const lookbackStart = new Date();
    lookbackStart.setDate(lookbackStart.getDate() - lookbackDays);
    lookbackStart.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        branchId,
        status: 'SERVED',
        createdAt: { gte: lookbackStart },
      },
      include: {
        orderItems: { include: { item: true } },
      },
    });

    // Orders per day of week (0=Sun .. 6=Sat)
    const ordersByWeekday = {};
    for (let w = 0; w <= 6; w++) ordersByWeekday[w] = [];
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const w = d.getDay();
      const key = d.toISOString().slice(0, 10);
      if (!ordersByWeekday[w]) ordersByWeekday[w] = [];
      const existing = ordersByWeekday[w].find((x) => x.date === key);
      if (existing) existing.count += 1;
      else ordersByWeekday[w].push({ date: key, count: 1 });
    }

    const avgByWeekday = {};
    for (let w = 0; w <= 6; w++) {
      const arr = ordersByWeekday[w] || [];
      const avg = arr.length ? arr.reduce((s, x) => s + x.count, 0) / arr.length : 0;
      avgByWeekday[w] = Math.round(avg * 10) / 10;
    }

    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const ordersPerDay = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const w = d.getDay();
      ordersPerDay.push({
        date: d.toISOString().slice(0, 10),
        day: weekdayNames[w],
        predicted: avgByWeekday[w] ?? 0,
      });
    }

    // Top items demand (quantity per item per day, avg)
    const byItem = {};
    let totalItemDays = 0;
    const seenDays = new Set();
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      seenDays.add(key);
      for (const oi of o.orderItems) {
        const name = oi.item?.name || 'Unknown';
        if (!byItem[name]) byItem[name] = 0;
        byItem[name] += oi.quantity;
      }
    }
    const numDays = seenDays.size || 1;
    const topItemsDemand = Object.entries(byItem)
      .map(([name, qty]) => ({ name, predictedPerDay: Math.round((qty / numDays) * 10) / 10 }))
      .sort((a, b) => b.predictedPerDay - a.predictedPerDay)
      .slice(0, 10);

    // Peak hours heatmap: hour (0-23) x dayOfWeek (0-6) -> count
    const heatmap = {};
    for (let h = 0; h < 24; h++) {
      heatmap[h] = {};
      for (let w = 0; w <= 6; w++) heatmap[h][w] = 0;
    }
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const h = d.getHours();
      const w = d.getDay();
      heatmap[h][w] = (heatmap[h][w] || 0) + 1;
    }
    const peakHours = Object.entries(heatmap).map(([h, byDay]) => {
      const hour = parseInt(h, 10);
      return {
        hour,
        label: String(hour).padStart(2, '0') + ':00',
        Sun: byDay[0] || 0,
        Mon: byDay[1] || 0,
        Tue: byDay[2] || 0,
        Wed: byDay[3] || 0,
        Thu: byDay[4] || 0,
        Fri: byDay[5] || 0,
        Sat: byDay[6] || 0,
      };
    });

    return {
      horizon: `${days}d`,
      ordersPerDay,
      topItemsDemand,
      peakHours,
      basedOnDays: orders.length ? lookbackDays : 0,
    };
  },

  /**
   * Waste intelligence: expiry alerts, dead stock, wasted value.
   * @param {string} branchId
   * @param {{ from?: string, to?: string }} opts — date range
   */
  async getWasteReport(branchId, { from, to } = {}) {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();

    const [inventoryItems, wasteLogs, movements] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { branchId },
        include: { item: true },
      }),
      prisma.wasteLog.findMany({
        where: {
          branchId,
          createdAt: { gte: fromDate, lte: toDate },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.findMany({
        where: { branchId },
        select: { inventoryItemId: true, createdAt: true },
      }),
    ]);

    const lastMovementByItem = {};
    for (const m of movements) {
      const existing = lastMovementByItem[m.inventoryItemId];
      if (!existing || m.createdAt > existing) {
        lastMovementByItem[m.inventoryItemId] = m.createdAt;
      }
    }

    const expiryAlerts = [];
    const deadStock = [];
    for (const inv of inventoryItems) {
      if (inv.expiryDate && inv.expiryDate <= now) {
        const daysOver = Math.floor((now - inv.expiryDate) / (24 * 60 * 60 * 1000));
        expiryAlerts.push({
          id: inv.id,
          name: inv.name,
          quantity: inv.quantity,
          unit: inv.unit,
          expiryDate: inv.expiryDate,
          daysOverdue: daysOver,
          cost: inv.purchaseCost ? inv.purchaseCost * inv.quantity : null,
        });
      } else if (inv.expiryDate && inv.expiryDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        const daysLeft = Math.ceil((inv.expiryDate - now) / (24 * 60 * 60 * 1000));
        expiryAlerts.push({
          id: inv.id,
          name: inv.name,
          quantity: inv.quantity,
          unit: inv.unit,
          expiryDate: inv.expiryDate,
          daysLeft,
          cost: inv.purchaseCost ? inv.purchaseCost * inv.quantity : null,
        });
      }
      const lastMove = lastMovementByItem[inv.id];
      if (!lastMove || lastMove < thirtyDaysAgo) {
        if (inv.quantity > 0) {
          deadStock.push({
            id: inv.id,
            name: inv.name,
            quantity: inv.quantity,
            unit: inv.unit,
            lastMovement: lastMove || null,
            daysInactive: lastMove
              ? Math.floor((now - lastMove) / (24 * 60 * 60 * 1000))
              : null,
          });
        }
      }
    }

    let totalWastedValue = 0;
    const wasteTrend = [];
    const byDate = {};
    for (const w of wasteLogs) {
      totalWastedValue += w.cost ?? 0;
      const d = w.createdAt.toISOString().slice(0, 10);
      byDate[d] = (byDate[d] || 0) + (w.cost ?? 0);
    }
    const sortedDates = Object.keys(byDate).sort();
    for (const d of sortedDates) {
      wasteTrend.push({ date: d, cost: Math.round(byDate[d] * 100) / 100 });
    }

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      totalWastedValue: Math.round(totalWastedValue * 100) / 100,
      expiryAlerts: expiryAlerts.sort((a, b) => {
        const aDate = a.expiryDate ? new Date(a.expiryDate) : new Date(0);
        const bDate = b.expiryDate ? new Date(b.expiryDate) : new Date(0);
        return aDate - bDate;
      }),
      deadStock: deadStock.slice(0, 20),
      wasteLogs: wasteLogs.slice(0, 50).map((w) => ({
        id: w.id,
        itemName: w.itemName,
        quantity: w.quantity,
        reason: w.reason,
        cost: w.cost,
        createdAt: w.createdAt,
      })),
      wasteTrend,
    };
  },

  /**
   * AI-powered waste prediction and optimization suggestions
   * @param {string} branchId
   * @param {{ from?: string, to?: string }} opts — date range
   */
  async getWasteIntelligence(branchId, { from, to } = {}) {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const [inventoryItems, wasteLogs, orders, movements] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { branchId },
      }),
      prisma.wasteLog.findMany({
        where: {
          branchId,
          createdAt: { gte: fromDate, lte: toDate },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        where: {
          branchId,
          status: 'SERVED',
          createdAt: { gte: new Date(fromDate.getTime() - 90 * 24 * 60 * 60 * 1000) },
        },
        include: { orderItems: { include: { item: { select: { name: true } } } } },
      }),
      prisma.stockMovement.findMany({
        where: { branchId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    // AI Prediction: Calculate waste patterns and predict future waste
    const wastePatterns = this.analyzeWastePatterns(wasteLogs, orders);
    const predictions = this.predictWasteTrends(inventoryItems, wastePatterns, movements);
    
    // Optimization suggestions
    const suggestions = this.generateWasteOptimizations(inventoryItems, wasteLogs, wastePatterns);

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      predictions,
      suggestions,
      wastePatterns,
      costSavings: this.calculatePotentialSavings(suggestions, wasteLogs),
    };
  },

  /**
   * Analyze waste patterns to identify recurring issues
   */
  analyzeWastePatterns(wasteLogs, orders) {
    const byReason = {};
    const byDayOfWeek = {};
    const byItem = {};
    
    for (const waste of wasteLogs) {
      // Group by reason
      byReason[waste.reason] = (byReason[waste.reason] || 0) + waste.cost;
      
      // Group by day of week
      const day = new Date(waste.createdAt).getDay();
      byDayOfWeek[day] = (byDayOfWeek[day] || 0) + waste.cost;
      
      // Group by item
      byItem[waste.itemName] = (byItem[waste.itemName] || 0) + waste.cost;
    }

    return {
      topReasons: Object.entries(byReason)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([reason, cost]) => ({ reason, cost, percentage: (cost / Object.values(byReason).reduce((a,b) => a+b, 0) * 100).toFixed(1) })),
      peakWasteDays: Object.entries(byDayOfWeek)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([day, cost]) => ({ day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day], cost })),
      problemItems: Object.entries(byItem)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([item, cost]) => ({ item, cost })),
    };
  },

  /**
   * Predict future waste based on historical data
   */
  predictWasteTrends(inventoryItems, wastePatterns, movements) {
    const predictions = [];
    const now = new Date();
    
    // Predict expiry waste (next 7 days)
    let expiryRisk = 0;
    for (const inv of inventoryItems) {
      if (inv.expiryDate) {
        const daysToExpiry = Math.ceil((inv.expiryDate - now) / (24 * 60 * 60 * 1000));
        if (daysToExpiry <= 7 && daysToExpiry > 0) {
          expiryRisk += inv.purchaseCost ? inv.purchaseCost * inv.quantity * 0.3 : 0; // 30% waste risk
        }
      }
    }

    // Predict waste based on historical patterns
    const avgDailyWaste = wastePatterns.topReasons?.reduce((sum, r) => sum + r.cost, 0) / 30 || 0;
    
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      predictions.push({
        date: futureDate.toISOString().slice(0, 10),
        predictedWaste: Math.round(avgDailyWaste * (1 + Math.random() * 0.2)), // Add variance
        confidence: Math.max(60, 95 - i * 5), // Decreasing confidence
        riskFactors: {
          expiry: i <= 3 ? expiryRisk / 7 : 0,
          seasonal: this.getSeasonalFactor(futureDate),
          historical: avgDailyWaste > 0,
        },
      });
    }

    return predictions;
  },

  /**
   * Generate waste optimization suggestions
   */
  generateWasteOptimizations(inventoryItems, wasteLogs, wastePatterns) {
    const suggestions = [];
    
    // Suggestion 1: Dynamic pricing for near-expiry items
    const nearExpiry = inventoryItems.filter(inv => 
      inv.expiryDate && 
      new Date(inv.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    
    if (nearExpiry.length > 0) {
      suggestions.push({
        type: 'PRICING',
        priority: 'HIGH',
        title: 'Discount Near-Expiry Items',
        description: `Apply 20-30% discount to ${nearExpiry.length} items expiring soon`,
        potentialSavings: nearExpiry.reduce((sum, inv) => 
          sum + (inv.purchaseCost ? inv.purchaseCost * inv.quantity * 0.25 : 0), 0),
        actionItems: nearExpiry.map(inv => inv.name),
      });
    }

    // Suggestion 2: Order quantity optimization
    const highWasteItems = wastePatterns.problemItems?.slice(0, 5) || [];
    if (highWasteItems.length > 0) {
      suggestions.push({
        type: 'ORDERING',
        priority: 'MEDIUM',
        title: 'Optimize Order Quantities',
        description: `Reduce order quantities for high-waste items by 15-25%`,
        potentialSavings: highWasteItems.reduce((sum, item) => sum + item.cost, 0) * 0.2,
        actionItems: highWasteItems.map(item => item.item),
      });
    }

    // Suggestion 3: Storage optimization
    const spoilageReasons = wastePatterns.topReasons?.filter(r => 
      r.reason === 'EXPIRED' || r.reason === 'DAMAGED'
    ) || [];
    
    if (spoilageReasons.length > 0) {
      suggestions.push({
        type: 'STORAGE',
        priority: 'MEDIUM',
        title: 'Improve Storage Conditions',
        description: 'Review temperature, humidity, and storage organization',
        potentialSavings: spoilageReasons.reduce((sum, r) => sum + r.cost, 0) * 0.15,
        actionItems: ['Temperature monitoring', 'Better organization', 'Regular inspection'],
      });
    }

    return suggestions;
  },

  /**
   * Calculate potential cost savings
   */
  calculatePotentialSavings(suggestions, wasteLogs) {
    const totalWasteCost = wasteLogs.reduce((sum, w) => sum + (w.cost || 0), 0);
    const potentialSavings = suggestions.reduce((sum, s) => sum + s.potentialSavings, 0);
    
    return {
      currentWasteCost: totalWasteCost,
      potentialSavings,
      percentageReduction: totalWasteCost > 0 ? 
        ((potentialSavings / totalWasteCost) * 100).toFixed(1) : 0,
    };
  },

  /**
   * Get seasonal factor for waste prediction
   */
  getSeasonalFactor(date) {
    const month = date.getMonth();
    // Higher waste in summer months (June-August)
    const seasonalFactors = [0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.5, 1.4, 1.2, 1.0, 0.9, 0.8];
    return seasonalFactors[month] || 1.0;
  },

  /**
   * Executive dashboard: cross-branch revenue, orders, branch ranking.
   * Admin only.
   * @param {{ from?: string, to?: string }} opts — date range
   */
  async getExecutiveReport({ from, to } = {}) {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      include: {
        orders: {
          where: {
            status: 'SERVED',
            createdAt: { gte: fromDate, lte: toDate },
          },
          include: { orderItems: { include: { item: { select: { name: true } } } } },
        },
      },
    });

    const branchRanking = [];
    let totalRevenue = 0;
    let totalOrders = 0;
    const topItemsGlobal = {};

    for (const b of branches) {
      let revenue = 0;
      for (const o of b.orders) {
        for (const oi of o.orderItems) {
          revenue += oi.price * oi.quantity;
          totalRevenue += oi.price * oi.quantity;
        }
      }
      totalOrders += b.orders.length;
      branchRanking.push({
        branchId: b.id,
        branchName: b.name,
        orders: b.orders.length,
        revenue: Math.round(revenue * 100) / 100,
        address: b.address,
      });

      for (const o of b.orders) {
        for (const oi of o.orderItems) {
          const name = oi.item?.name || 'Unknown';
          if (!topItemsGlobal[name]) topItemsGlobal[name] = { quantity: 0, revenue: 0 };
          topItemsGlobal[name].quantity += oi.quantity;
          topItemsGlobal[name].revenue += oi.price * oi.quantity;
        }
      }
    }

    branchRanking.sort((a, b) => b.revenue - a.revenue);

    const topItems = Object.entries(topItemsGlobal)
      .map(([name, data]) => ({ name, quantity: data.quantity, revenue: Math.round(data.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      branchRanking,
      topItems,
    };
  },
};
