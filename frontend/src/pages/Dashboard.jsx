import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  UtensilsCrossed,
  LayoutGrid,
  TrendingUp,
  BarChart3,
  Clock,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, ordersApi } from '../lib/api';
import { ORDER_STATUS } from '../config/constants';

/* ────────────────────────────────────
   Mini Sparkline SVG Component
   ──────────────────────────────────── */
function Sparkline({ data = [3, 7, 5, 9, 6, 8, 4, 7, 10, 6], color = '#f59e0b' }) {
  const width = 80;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────
   Animated Counter Hook
   ──────────────────────────────────── */
function useAnimatedValue(target, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

function AnimatedNumber({ value, prefix = '', decimals = 0 }) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  const animated = useAnimatedValue(num);
  return (
    <span>
      {prefix}
      {animated.toFixed(decimals)}
    </span>
  );
}

/* ────────────────────────────────────
   Live Clock Component
   ──────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-rms-muted">
      <Clock className="h-4 w-4 text-rms-amber/60" />
      <span className="font-mono tabular-nums">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="hidden sm:inline text-rms-muted/60">
        {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

/* ────────────────────────────────────
   Floating Orb Background
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
   Main Dashboard
   ──────────────────────────────────── */
export default function Dashboard() {
  const { branchId } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!branchId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          analyticsApi.dashboard(branchId),
          ordersApi.list(branchId),
        ]);
        if (cancelled) return;
        const d = dashRes.data ?? dashRes;
        setStats({
          ordersToday: d.ordersToday ?? 0,
          servedToday: d.servedToday ?? 0,
          totalTables: d.totalTables ?? 0,
          lowStockAlerts: d.lowStockAlerts ?? 0,
          revenueToday: d.revenueToday ?? 0,
        });
        const orders = ordersRes.data ?? ordersRes ?? [];
        setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const sparkData = {
    orders: [2, 5, 3, 8, 6, 9, 7, 10, 8, 12],
    served: [1, 4, 3, 7, 5, 8, 6, 9, 7, 11],
    tables: [4, 4, 5, 5, 6, 5, 6, 6, 7, 6],
    revenue: [40, 65, 50, 90, 75, 110, 85, 120, 95, 130],
  };

  const statCards = stats
    ? [
        {
          label: "Today's Orders",
          value: stats.ordersToday,
          prefix: '',
          decimals: 0,
          change: '+12%',
          changeUp: true,
          icon: Receipt,
          color: 'amber',
          gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
          borderGlow: 'hover:shadow-amber-500/10',
          sparkData: sparkData.orders,
          sparkColor: '#f59e0b',
        },
        {
          label: 'Served Today',
          value: stats.servedToday,
          prefix: '',
          decimals: 0,
          change: '+8%',
          changeUp: true,
          icon: UtensilsCrossed,
          color: 'emerald',
          gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
          borderGlow: 'hover:shadow-emerald-500/10',
          sparkData: sparkData.served,
          sparkColor: '#34d399',
        },
        {
          label: 'Active Tables',
          value: stats.totalTables,
          prefix: '',
          decimals: 0,
          change: stats.lowStockAlerts ? `${stats.lowStockAlerts} low stock` : 'All stocked',
          changeUp: !stats.lowStockAlerts,
          icon: LayoutGrid,
          color: 'blue',
          gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
          borderGlow: 'hover:shadow-blue-500/10',
          sparkData: sparkData.tables,
          sparkColor: '#60a5fa',
        },
        {
          label: 'Revenue Today',
          value: stats.revenueToday ?? 0,
          prefix: '$',
          decimals: 2,
          change: '+18%',
          changeUp: true,
          icon: TrendingUp,
          color: 'violet',
          gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
          borderGlow: 'hover:shadow-violet-500/10',
          sparkData: sparkData.revenue,
          sparkColor: '#a78bfa',
        },
      ]
    : [];

  /* ── No Branch ── */
  if (!branchId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl" />
          <div className="relative rounded-2xl border border-amber-500/30 bg-rms-panel/90 backdrop-blur-xl px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Branch Assigned</h3>
            <p className="text-sm text-rms-muted leading-relaxed">
              Contact your administrator to assign a branch to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-lg bg-rms-border/50 animate-pulse" />
            <div className="h-4 w-32 rounded-md bg-rms-border/30 animate-pulse" />
          </div>
          <div className="h-8 w-44 rounded-lg bg-rms-border/30 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-rms-border/50 bg-rms-panel/50 backdrop-blur p-6 h-36 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-rms-border/50 bg-rms-panel/50 h-80 animate-pulse" />
          <div className="rounded-2xl border border-rms-border/50 bg-rms-panel/50 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 blur-xl" />
          <div className="relative rounded-2xl border border-red-500/30 bg-rms-panel/90 backdrop-blur-xl px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <Activity className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-red-300/80 leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Dashboard ── */
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
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-xs font-medium uppercase tracking-widest text-emerald-400/80">
                Live Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Good{' '}
              {new Date().getHours() < 12
                ? 'morning'
                : new Date().getHours() < 17
                  ? 'afternoon'
                  : 'evening'}
              <span className="inline-block ml-2 animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="mt-1 text-sm text-rms-muted">Here's what's happening at your restaurant today.</p>
          </div>
          <LiveClock />
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
                {/* Glow effect on hover */}
                <div
                  className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}
                />

                <div
                  className={`
                    relative overflow-hidden rounded-2xl
                    border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl
                    p-5 transition-all duration-500
                    hover:border-${stat.color}-500/30
                    ${stat.borderGlow} hover:shadow-2xl
                    hover:-translate-y-0.5
                  `}
                >
                  {/* Background gradient accent */}
                  <div
                    className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl ${stat.gradient} rounded-bl-full opacity-50`}
                  />

                  <div className="relative flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-rms-muted/80">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                        <AnimatedNumber value={stat.value} prefix={stat.prefix} decimals={stat.decimals} />
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {stat.changeUp ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Activity className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            stat.changeUp ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div
                        className={`
                          rounded-xl p-2.5 
                          bg-${stat.color}-500/10 border border-${stat.color}-500/20
                          text-${stat.color}-400
                          transition-all duration-300
                          group-hover:scale-110 group-hover:bg-${stat.color}-500/20
                          group-hover:shadow-lg group-hover:shadow-${stat.color}-500/10
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <Sparkline data={stat.sparkData} color={stat.sparkColor} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Recent Orders ── */}
          <div
            className="lg:col-span-2 animate-slide-up"
            style={{ animationDelay: '350ms', animationFillMode: 'both' }}
          >
            <div className="group relative overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl transition-all duration-500 hover:border-rms-border">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-rms-border/60 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Receipt className="h-4.5 w-4.5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Recent Orders</h2>
                    <p className="text-xs text-rms-muted">Real-time order activity</p>
                  </div>
                </div>
                <Link
                  to="/orders"
                  className="
                    flex items-center gap-1.5 rounded-lg px-3 py-1.5
                    text-xs font-medium text-rms-muted
                    border border-transparent
                    transition-all duration-300
                    hover:text-rms-amber hover:border-rms-amber/20 hover:bg-rms-amber/5
                  "
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Order List */}
              <ul className="divide-y divide-rms-border/40">
                {recentOrders.length === 0 ? (
                  <li className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rms-border/10">
                      <Receipt className="h-6 w-6 text-rms-muted/40" />
                    </div>
                    <p className="text-sm font-medium text-rms-muted">No orders yet</p>
                    <p className="mt-1 text-xs text-rms-muted/60">Orders will appear here in real time</p>
                  </li>
                ) : (
                  recentOrders.map((order, i) => {
                    const s = ORDER_STATUS[order.status?.toLowerCase()];
                    return (
                      <li
                        key={order.id}
                        className="
                          group/item flex items-center justify-between px-6 py-4
                          transition-all duration-300
                          hover:bg-gradient-to-r hover:from-white/[0.02] hover:to-transparent
                        "
                        style={{ animationDelay: `${(i + 5) * 60}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Order number with pulse dot */}
                          <div className="relative">
                            <span
                              className="
                                inline-flex items-center justify-center
                                h-10 w-10 rounded-xl
                                bg-rms-border/10 border border-rms-border/30
                                font-mono text-xs font-bold text-white
                                transition-all duration-300
                                group-hover/item:border-rms-amber/20 group-hover/item:bg-rms-amber/5
                              "
                            >
                              #{order.id?.slice(-4)}
                            </span>
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-rms-panel animate-pulse" />
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              Table {order.table?.number ?? '—'}
                            </span>
                            <span className="text-xs text-rms-muted">
                              {order.orderItems?.length ?? 0} items
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge color={s?.color || 'slate'}>{s?.label || order.status}</Badge>
                          <ChevronRight className="h-4 w-4 text-rms-muted/30 transition-all group-hover/item:text-rms-muted group-hover/item:translate-x-0.5" />
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: '450ms', animationFillMode: 'both' }}
          >
            <div className="overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl h-full">
              <div className="border-b border-rms-border/60 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Zap className="h-4.5 w-4.5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Quick Actions</h2>
                    <p className="text-xs text-rms-muted">Common tasks</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {[
                  {
                    to: '/tables',
                    label: 'View Tables',
                    desc: 'Manage seating',
                    icon: LayoutGrid,
                    color: 'amber',
                    gradient: 'from-amber-500/10 to-orange-500/10',
                  },
                  {
                    to: '/orders',
                    label: 'New Order',
                    desc: 'Create an order',
                    icon: Receipt,
                    color: 'emerald',
                    gradient: 'from-emerald-500/10 to-teal-500/10',
                  },
                  {
                    to: '/analytics',
                    label: 'Analytics',
                    desc: 'View reports',
                    icon: BarChart3,
                    color: 'blue',
                    gradient: 'from-blue-500/10 to-indigo-500/10',
                  },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={`
                        group/action relative flex items-center gap-4 rounded-xl
                        border border-rms-border/40 bg-rms-dark/30
                        p-4 transition-all duration-300
                        hover:border-${action.color}-500/30
                        hover:bg-gradient-to-r hover:${action.gradient}
                        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-${action.color}-500/5
                      `}
                      style={{ animationDelay: `${(i + 7) * 60}ms` }}
                    >
                      <div
                        className={`
                          flex h-11 w-11 items-center justify-center rounded-xl
                          bg-${action.color}-500/10 border border-${action.color}-500/20
                          text-${action.color}-400
                          transition-all duration-300
                          group-hover/action:scale-110 group-hover/action:bg-${action.color}-500/20
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-white">{action.label}</span>
                        <p className="text-xs text-rms-muted">{action.desc}</p>
                      </div>
                      <ChevronRight
                        className={`
                          h-4 w-4 text-rms-muted/30
                          transition-all duration-300
                          group-hover/action:text-${action.color}-400
                          group-hover/action:translate-x-1
                        `}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* ── Status Footer ── */}
              <div className="mt-auto border-t border-rms-border/40 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-rms-muted">All systems operational</span>
                  </div>
                  <span className="text-[10px] font-mono text-rms-muted/40 uppercase tracking-wider">
                    v2.4.1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}