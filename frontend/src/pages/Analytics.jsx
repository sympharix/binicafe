import { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  LineChart as LineChartIcon,
  AlertTriangle,
  BarChart3,
  Clock,
  Package,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Flame,
  Skull,
  Timer,
  ChevronRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../lib/api';

/* ────────────────────────────────────
   Floating Orbs
   ──────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-rms-amber/[0.03] blur-3xl animate-float" />
      <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-blue-500/[0.02] blur-3xl animate-float-delayed" />
      <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-emerald-500/[0.02] blur-3xl animate-float-slow" />
    </div>
  );
}

/* ────────────────────────────────────
   Animated Counter
   ──────────────────────────────────── */
function useAnimatedValue(target, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return value;
}

function AnimatedNumber({ value, prefix = '', decimals = 0 }) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  const animated = useAnimatedValue(num);
  return (
    <span className="tabular-nums">
      {prefix}
      {animated.toFixed(decimals)}
    </span>
  );
}

/* ────────────────────────────────────
   Custom Recharts Tooltip
   ──────────────────────────────────── */
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="
        rounded-xl border border-rms-border/60 bg-rms-panel/95 backdrop-blur-xl
        px-4 py-3 shadow-2xl shadow-black/30
      "
    >
      <p className="text-xs font-semibold text-rms-muted/70 mb-1.5 uppercase tracking-wider">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-white font-medium">
            {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
          </span>
          <span className="text-xs text-rms-muted/50">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────
   Section Header
   ──────────────────────────────────── */
function SectionHeader({ icon: Icon, iconColor, title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-10 w-10 items-center justify-center rounded-xl border
            ${iconColor}
            transition-transform duration-300 hover:scale-110
          `}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-rms-muted/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ────────────────────────────────────
   Date Range Picker
   ──────────────────────────────────── */
function DateRange({ from, to, onFromChange, onToChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rms-muted/40" />
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="
            rounded-xl border border-rms-border/50 bg-rms-dark/60 backdrop-blur
            pl-9 pr-3 py-2 text-sm text-white
            focus:border-rms-amber/40 focus:outline-none focus:ring-2 focus:ring-rms-amber/10
            transition-all duration-200
          "
        />
      </div>
      <span className="text-rms-muted/40 text-xs font-medium">→</span>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rms-muted/40" />
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="
            rounded-xl border border-rms-border/50 bg-rms-dark/60 backdrop-blur
            pl-9 pr-3 py-2 text-sm text-white
            focus:border-rms-amber/40 focus:outline-none focus:ring-2 focus:ring-rms-amber/10
            transition-all duration-200
          "
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────
   Empty / Loading States
   ──────────────────────────────────── */
function ChartEmpty({ message, icon: Icon = BarChart3 }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-rms-amber/5 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-rms-panel border border-rms-border/30">
          <Icon className="h-7 w-7 text-rms-muted/25" />
        </div>
      </div>
      <p className="text-sm text-rms-muted/50 max-w-xs">{message}</p>
    </div>
  );
}

function ChartLoading({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-8 w-8 rounded-full border-2 border-rms-border/30 border-t-rms-amber animate-spin mb-3" />
      <span className="text-sm text-rms-muted/50">{label}</span>
    </div>
  );
}

/* ────────────────────────────────────
   Heatmap Cell
   ──────────────────────────────────── */
function HeatCell({ value, max }) {
  const pct = max > 0 ? value / max : 0;
  return (
    <td className="text-center p-1">
      <span
        className="
          inline-flex items-center justify-center
          rounded-lg min-w-[2.2rem] px-1.5 py-1
          text-xs font-medium tabular-nums
          transition-all duration-300 hover:scale-110
        "
        style={{
          backgroundColor: value > 0
            ? `rgba(16, 185, 129, ${0.1 + pct * 0.7})`
            : 'rgba(255,255,255,0.02)',
          color: value > 0 ? '#fff' : 'rgb(100 116 139 / 0.4)',
          boxShadow: pct > 0.7 ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
        }}
        title={`${value} orders`}
      >
        {value || '—'}
      </span>
    </td>
  );
}

/* ────────────────────────────────────
   Main Analytics Page
   ──────────────────────────────────── */
export default function Analytics() {
  const { branchId } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState(null);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [waste, setWaste] = useState(null);
  const [wasteLoading, setWasteLoading] = useState(false);
  const [wasteFrom, setWasteFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [wasteTo, setWasteTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!branchId) { setLoading(false); return; }
    analyticsApi.dashboard(branchId)
      .then((res) => setDashboard(res.data ?? res))
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [branchId]);

  useEffect(() => {
    if (!branchId) return;
    setSalesLoading(true);
    analyticsApi.sales(branchId, from, to)
      .then((res) => {
        const d = res.data ?? res;
        const chartData = (d.topItems ?? []).slice(0, 10).map((item) => ({
          name: item.name?.slice(0, 14) || 'Item',
          revenue: item.revenue ?? 0,
        }));
        setSales({ ...d, chartData });
      })
      .catch(() => setSales(null))
      .finally(() => setSalesLoading(false));
  }, [branchId, from, to]);

  useEffect(() => {
    if (!branchId) return;
    setForecastLoading(true);
    analyticsApi.forecast(branchId, '7d')
      .then((res) => setForecast(res.data ?? res))
      .catch(() => setForecast(null))
      .finally(() => setForecastLoading(false));
  }, [branchId]);

  useEffect(() => {
    if (!branchId) return;
    setWasteLoading(true);
    analyticsApi.waste(branchId, wasteFrom, wasteTo)
      .then((res) => setWaste(res.data ?? res))
      .catch(() => setWaste(null))
      .finally(() => setWasteLoading(false));
  }, [branchId, wasteFrom, wasteTo]);

  /* ── No Branch ── */
  if (!branchId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <FloatingOrbs />
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl" />
          <div className="relative rounded-2xl border border-amber-500/30 bg-rms-panel/90 backdrop-blur-xl px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Branch Assigned</h3>
            <p className="text-sm text-rms-muted">Contact your administrator to view analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading && !dashboard) {
    return (
      <div className="space-y-8 animate-fade-in">
        <FloatingOrbs />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-rms-border/50 animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-rms-border/30 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <div className="h-96 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse" />
      </div>
    );
  }

  /* ── Error ── */
  if (error && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <FloatingOrbs />
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 blur-xl" />
          <div className="relative rounded-2xl border border-red-500/30 bg-rms-panel/90 backdrop-blur-xl px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <Activity className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load</h3>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const d = dashboard ?? {};

  const statCards = [
    {
      label: 'Orders Today',
      value: d.ordersToday ?? 0,
      prefix: '',
      decimals: 0,
      icon: TrendingUp,
      color: 'amber',
      gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
      change: '+12%',
      changeUp: true,
    },
    {
      label: 'Served Today',
      value: d.servedToday ?? 0,
      prefix: '',
      decimals: 0,
      icon: Activity,
      color: 'emerald',
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      change: '+8%',
      changeUp: true,
    },
    {
      label: 'Revenue Today',
      value: d.revenueToday ?? 0,
      prefix: '$',
      decimals: 2,
      icon: DollarSign,
      color: 'blue',
      gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
      change: '+18%',
      changeUp: true,
    },
    {
      label: 'Low Stock Alerts',
      value: d.lowStockAlerts ?? 0,
      prefix: '',
      decimals: 0,
      icon: AlertTriangle,
      color: 'red',
      gradient: 'from-red-500/20 via-red-500/5 to-transparent',
      change: d.lowStockAlerts > 0 ? 'Needs attention' : 'All stocked',
      changeUp: d.lowStockAlerts === 0,
    },
  ];

  return (
    <>
      <FloatingOrbs />

      <div className="space-y-8">
        {/* ── Header ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-slide-down"
          style={{ animationDuration: '600ms' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-500/50" />
              <span className="text-xs font-medium uppercase tracking-widest text-blue-400/80">
                Analytics & Insights
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Analytics
              <span className="inline-block ml-2 text-2xl">📊</span>
            </h1>
            <p className="mt-1 text-sm text-rms-muted">
              Real-time business intelligence for your restaurant.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-rms-muted">
            <Clock className="h-4 w-4 text-rms-amber/60" />
            <span className="font-mono tabular-nums">
              {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
              >
                <div
                  className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}
                />
                <div
                  className={`
                    relative overflow-hidden rounded-2xl
                    border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl
                    p-5 transition-all duration-500
                    hover:border-${stat.color}-500/30
                    hover:shadow-2xl hover:shadow-${stat.color}-500/5
                    hover:-translate-y-0.5
                  `}
                >
                  <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl ${stat.gradient} rounded-bl-full opacity-50`} />

                  <div className="relative flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-rms-muted/70">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-extrabold text-white tracking-tight">
                        <AnimatedNumber
                          value={stat.value}
                          prefix={stat.prefix}
                          decimals={stat.decimals}
                        />
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {stat.changeUp ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            stat.changeUp ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`
                        rounded-xl p-2.5
                        bg-${stat.color}-500/10 border border-${stat.color}-500/20
                        text-${stat.color}-400
                        transition-all duration-300
                        group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-${stat.color}-500/10
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Sales Chart ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '350ms', animationFillMode: 'both' }}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl p-6 transition-all duration-500 hover:border-rms-border">
            <SectionHeader
              icon={BarChart3}
              iconColor="bg-amber-500/10 border-amber-500/20 text-amber-400"
              title="Sales by Item"
              subtitle="Top performing items by revenue"
            >
              <DateRange from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
            </SectionHeader>

            {salesLoading ? (
              <ChartLoading label="Loading sales data..." />
            ) : sales?.chartData?.length > 0 ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sales.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" stroke="rgb(100 116 139 / 0.5)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgb(100 116 139 / 0.5)" fontSize={11} tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        content={<CustomTooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']} />}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {sales.totalRevenue != null && (
                  <div className="mt-4 flex items-center gap-6 pt-4 border-t border-rms-border/30">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-rms-amber/60" />
                      <span className="text-sm text-rms-muted">Total revenue:</span>
                      <span className="text-sm font-bold text-white tabular-nums">
                        ${Number(sales.totalRevenue).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-rms-muted/40" />
                      <span className="text-sm text-rms-muted">{sales.totalOrders ?? 0} orders</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <ChartEmpty message="No sales data for this period. Try adjusting the date range." />
            )}
          </div>
        </div>

        {/* ── Forecast Section ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '450ms', animationFillMode: 'both' }}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl p-6 transition-all duration-500 hover:border-rms-border">
            <SectionHeader
              icon={LineChartIcon}
              iconColor="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              title="Demand Forecast"
              subtitle="Next 7 days • Based on 60-day rolling averages"
            >
              <Badge color="emerald" className="gap-1">
                <Activity className="h-3 w-3" />
                AI Powered
              </Badge>
            </SectionHeader>

            {forecastLoading ? (
              <ChartLoading label="Generating forecast..." />
            ) : forecast ? (
              <div className="space-y-10">
                {/* Predicted orders */}
                {(forecast.ordersPerDay ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-1 rounded-full bg-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Predicted Orders Per Day</h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast.ordersPerDay} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                          <defs>
                            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="day" stroke="rgb(100 116 139 / 0.5)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgb(100 116 139 / 0.5)" fontSize={11} tickLine={false} axisLine={false} />
                          <RechartsTooltip
                            content={<CustomTooltip formatter={(v) => [v, 'Predicted Orders']} />}
                            cursor={{ stroke: 'rgba(16, 185, 129, 0.2)' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="predicted"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#forecastGradient)"
                            name="Orders"
                            dot={{ r: 4, fill: '#10b981', stroke: '#0d1117', strokeWidth: 2 }}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#0d1117' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Top items demand */}
                {(forecast.topItemsDemand ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-1 rounded-full bg-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Top Items Demand</h3>
                      <span className="text-xs text-rms-muted/40">(avg per day)</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(forecast.topItemsDemand ?? []).map((i) => ({
                            name: (i.name || '').slice(0, 14),
                            qty: i.predictedPerDay ?? 0,
                          }))}
                          layout="vertical"
                          margin={{ top: 10, right: 20, left: 70, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="demandGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.9} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis type="number" stroke="rgb(100 116 139 / 0.5)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" stroke="rgb(100 116 139 / 0.5)" fontSize={11} width={65} tickLine={false} axisLine={false} />
                          <RechartsTooltip
                            content={<CustomTooltip formatter={(v) => [v, 'Qty/day']} />}
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          />
                          <Bar dataKey="qty" fill="url(#demandGradient)" radius={[0, 6, 6, 0]} name="Qty/day" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Peak hours heatmap */}
                {(forecast.peakHours ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-1 rounded-full bg-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Peak Hours Heatmap</h3>
                      <span className="text-xs text-rms-muted/40">(orders by hour × day)</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-rms-border/30 bg-rms-dark/30">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-rms-border/20">
                            <th className="text-left py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-rms-muted/50">
                              <Clock className="h-3.5 w-3.5 inline mr-1" />
                              Hour
                            </th>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <th
                                key={day}
                                className="text-center py-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-rms-muted/50 min-w-[2.8rem]"
                              >
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(forecast.peakHours ?? []).map((row) => {
                            const vals = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                              (d) => row[d] ?? 0
                            );
                            const maxVal = Math.max(...vals);
                            return (
                              <tr key={row.hour} className="border-b border-rms-border/10 last:border-0">
                                <td className="py-2 px-4 text-xs text-rms-muted/60 font-mono">
                                  {row.label}
                                </td>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                  <HeatCell key={day} value={row[day] ?? 0} max={maxVal} />
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 mt-3 justify-end">
                      <span className="text-[10px] text-rms-muted/30">Less</span>
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                        <div
                          key={opacity}
                          className="h-3 w-5 rounded-sm"
                          style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                        />
                      ))}
                      <span className="text-[10px] text-rms-muted/30">More</span>
                    </div>
                  </div>
                )}

                {!forecast.ordersPerDay?.length &&
                  !forecast.topItemsDemand?.length &&
                  !forecast.peakHours?.length && (
                    <ChartEmpty
                      icon={LineChartIcon}
                      message="No historical data yet. Forecasts will appear after orders are served."
                    />
                  )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-rms-border/30 bg-rms-dark/30 p-4">
                <Info className="h-5 w-5 text-rms-muted/40 shrink-0" />
                <p className="text-sm text-rms-muted/60">
                  Forecast unavailable. Requires ADMIN or MANAGER role.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Waste Intelligence ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '550ms', animationFillMode: 'both' }}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl p-6 transition-all duration-500 hover:border-rms-border">
            <SectionHeader
              icon={AlertTriangle}
              iconColor="bg-red-500/10 border-red-500/20 text-red-400"
              title="Waste Intelligence"
              subtitle="Track waste, expiry & dead stock"
            >
              <DateRange
                from={wasteFrom}
                to={wasteTo}
                onFromChange={setWasteFrom}
                onToChange={setWasteTo}
              />
            </SectionHeader>

            {wasteLoading ? (
              <ChartLoading label="Loading waste report..." />
            ) : waste ? (
              <div className="space-y-8">
                {/* Waste stat cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: 'Wasted Value',
                      value: `$${Number(waste.totalWastedValue ?? 0).toFixed(2)}`,
                      icon: Flame,
                      color: 'red',
                      gradient: 'from-red-500/15',
                    },
                    {
                      label: 'Expiry Alerts',
                      value: (waste.expiryAlerts ?? []).length,
                      icon: Timer,
                      color: 'amber',
                      gradient: 'from-amber-500/15',
                    },
                    {
                      label: 'Dead Stock',
                      value: (waste.deadStock ?? []).length,
                      icon: Skull,
                      color: 'slate',
                      gradient: 'from-slate-500/15',
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className={`
                          group/waste relative overflow-hidden rounded-xl
                          border border-rms-border/40 bg-rms-dark/40
                          p-4 transition-all duration-300
                          hover:border-${stat.color}-500/20 hover:-translate-y-0.5
                        `}
                      >
                        <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl ${stat.gradient} to-transparent rounded-bl-full opacity-40`} />
                        <div className="relative flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-rms-muted/60">
                              {stat.label}
                            </p>
                            <p className={`text-2xl font-extrabold text-${stat.color}-400 mt-1 tabular-nums`}>
                              {stat.value}
                            </p>
                          </div>
                          <div
                            className={`
                              flex h-10 w-10 items-center justify-center rounded-xl
                              bg-${stat.color}-500/10 border border-${stat.color}-500/20
                              text-${stat.color}-400
                              transition-transform duration-300 group-hover/waste:scale-110
                            `}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expiry alerts list */}
                {(waste.expiryAlerts ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1 w-1 rounded-full bg-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Items Nearing Expiry</h3>
                    </div>
                    <div className="space-y-2">
                      {(waste.expiryAlerts ?? []).slice(0, 10).map((a) => {
                        const overdue = a.daysOverdue != null;
                        return (
                          <div
                            key={a.id}
                            className={`
                              group/alert flex items-center justify-between
                              rounded-xl border bg-rms-dark/30
                              px-4 py-3 text-sm
                              transition-all duration-300
                              hover:bg-white/[0.02]
                              ${
                                overdue
                                  ? 'border-red-500/20 hover:border-red-500/30'
                                  : 'border-amber-500/15 hover:border-amber-500/25'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  flex h-8 w-8 items-center justify-center rounded-lg border
                                  ${
                                    overdue
                                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                  }
                                `}
                              >
                                <Timer className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-white">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-rms-muted tabular-nums">
                                {a.quantity} {a.unit}
                              </span>
                              <Badge color={overdue ? 'red' : 'amber'}>
                                {overdue ? `${a.daysOverdue}d overdue` : `${a.daysLeft}d left`}
                              </Badge>
                              {a.cost != null && (
                                <span className="text-rms-muted/50 tabular-nums font-mono">
                                  ${Number(a.cost).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dead stock list */}
                {(waste.deadStock ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1 w-1 rounded-full bg-slate-400" />
                      <h3 className="text-sm font-semibold text-white">Dead Inventory</h3>
                      <span className="text-xs text-rms-muted/40">(no movement in 30+ days)</span>
                    </div>
                    <div className="space-y-2">
                      {(waste.deadStock ?? []).slice(0, 10).map((s) => (
                        <div
                          key={s.id}
                          className="
                            flex items-center justify-between
                            rounded-xl border border-rms-border/20 bg-rms-dark/30
                            px-4 py-3 text-sm
                            transition-all duration-300 hover:bg-white/[0.02]
                          "
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10 border border-slate-500/15 text-slate-400">
                              <Package className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-white">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-rms-muted tabular-nums">
                              {s.quantity} {s.unit}
                            </span>
                            {s.daysInactive != null && (
                              <Badge color="slate">{s.daysInactive}d inactive</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waste trend chart */}
                {(waste.wasteTrend ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-1 rounded-full bg-red-400" />
                      <h3 className="text-sm font-semibold text-white">Waste Trend</h3>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={waste.wasteTrend} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                          <defs>
                            <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis
                            dataKey="date"
                            stroke="rgb(100 116 139 / 0.5)"
                            fontSize={11}
                            tickFormatter={(v) => v?.slice(5) || v}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="rgb(100 116 139 / 0.5)"
                            fontSize={11}
                            tickFormatter={(v) => `$${v}`}
                            tickLine={false}
                            axisLine={false}
                          />
                          <RechartsTooltip
                            content={
                              <CustomTooltip
                                formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Waste Cost']}
                              />
                            }
                            cursor={{ stroke: 'rgba(239, 68, 68, 0.2)' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="cost"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill="url(#wasteGradient)"
                            name="Cost"
                            dot={{ r: 3, fill: '#ef4444', stroke: '#0d1117', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {!waste.expiryAlerts?.length &&
                  !waste.deadStock?.length &&
                  !waste.wasteTrend?.length &&
                  !waste.totalWastedValue && (
                    <ChartEmpty
                      icon={AlertTriangle}
                      message="No waste data for this period. Add expiry dates and costs to inventory for insights."
                    />
                  )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-rms-border/30 bg-rms-dark/30 p-4">
                <Info className="h-5 w-5 text-rms-muted/40 shrink-0" />
                <p className="text-sm text-rms-muted/60">
                  Waste report unavailable. Requires ADMIN or MANAGER role.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}