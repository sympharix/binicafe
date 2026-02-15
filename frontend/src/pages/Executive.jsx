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
  Cell,
} from 'recharts';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Crown,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Trophy,
  Medal,
  MapPin,
  ShoppingBag,
  ChevronRight,
  BarChart3,
  Shield,
  Info,
  Hash,
  Star,
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
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-500/[0.03] blur-3xl animate-float" />
      <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-rms-amber/[0.02] blur-3xl animate-float-delayed" />
      <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-emerald-500/[0.02] blur-3xl animate-float-slow" />
    </div>
  );
}

/* ────────────────────────────────────
   Animated Counter
   ──────────────────────────────────── */
function useAnimatedValue(target, duration = 900) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
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
   Custom Tooltip
   ──────────────────────────────────── */
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-rms-border/60 bg-rms-panel/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/30">
      <p className="text-[10px] font-semibold text-rms-muted/60 mb-1.5 uppercase tracking-wider">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-white font-semibold">
            {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
          </span>
          <span className="text-[11px] text-rms-muted/50">{entry.name}</span>
        </div>
      ))}
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
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rms-muted/40 pointer-events-none" />
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="
            rounded-xl border border-rms-border/50 bg-rms-dark/60 backdrop-blur
            pl-9 pr-3 py-2 text-sm text-white
            focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/10
            transition-all duration-200
          "
        />
      </div>
      <span className="text-rms-muted/40 text-xs font-medium">→</span>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rms-muted/40 pointer-events-none" />
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="
            rounded-xl border border-rms-border/50 bg-rms-dark/60 backdrop-blur
            pl-9 pr-3 py-2 text-sm text-white
            focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/10
            transition-all duration-200
          "
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────
   Rank Medal
   ──────────────────────────────────── */
function RankMedal({ rank }) {
  if (rank === 1) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-500/30">
        <Trophy className="h-4 w-4 text-yellow-400" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-300/15 to-slate-400/10 border border-slate-400/20">
        <Medal className="h-4 w-4 text-slate-300" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400/15 to-orange-500/10 border border-orange-500/20">
        <Medal className="h-4 w-4 text-orange-400" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rms-border/10 border border-rms-border/20">
      <span className="text-xs font-bold text-rms-muted/50 tabular-nums">#{rank}</span>
    </div>
  );
}

/* ────────────────────────────────────
   Revenue Bar for Rankings
   ──────────────────────────────────── */
function RevenueBar({ value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-32 hidden lg:block">
      <div className="h-2 rounded-full bg-rms-border/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/80 transition-all duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────
   Chart Empty / Loading
   ──────────────────────────────────── */
function ChartEmpty({ message, icon: Icon = BarChart3 }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-violet-500/5 blur-xl" />
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
      <div className="h-8 w-8 rounded-full border-2 border-rms-border/30 border-t-violet-400 animate-spin mb-3" />
      <span className="text-sm text-rms-muted/50">{label}</span>
    </div>
  );
}

/* ────────────────────────────────────
   Bar Colors for Top Items
   ──────────────────────────────────── */
const BAR_COLORS = [
  '#f59e0b', '#fb923c', '#f97316', '#ef4444',
  '#ec4899', '#a855f7', '#8b5cf6', '#6366f1',
  '#3b82f6', '#06b6d4',
];

/* ────────────────────────────────────
   Main Executive Page
   ──────────────────────────────────── */
export default function Executive() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setLoading(true);
    analyticsApi
      .executive(from, to)
      .then((res) => setData(res.data ?? res))
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [from, to]);

  /* ── Access Denied ── */
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <FloatingOrbs />
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-xl" />
          <div className="relative rounded-2xl border border-violet-500/30 bg-rms-panel/90 backdrop-blur-xl px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <Shield className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Admin Access Required</h3>
            <p className="text-sm text-rms-muted leading-relaxed">
              The executive dashboard is available only to administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading && !data) {
    return (
      <div className="space-y-8 animate-fade-in">
        <FloatingOrbs />
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-rms-border/50 animate-pulse" />
          <div className="h-4 w-80 rounded-md bg-rms-border/30 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <div className="h-80 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse" style={{ animationDelay: '400ms' }} />
        <div className="h-96 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse" style={{ animationDelay: '500ms' }} />
      </div>
    );
  }

  /* ── Error ── */
  if (error && !data) {
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

  const d = data ?? {};
  const branches = d.branchRanking ?? [];
  const maxRevenue = Math.max(...branches.map((b) => b.revenue ?? 0), 1);

  const statCards = [
    {
      label: 'Total Revenue',
      value: d.totalRevenue ?? 0,
      prefix: '$',
      decimals: 2,
      icon: DollarSign,
      color: 'blue',
      gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
      change: '+24%',
      changeUp: true,
    },
    {
      label: 'Total Orders',
      value: d.totalOrders ?? 0,
      prefix: '',
      decimals: 0,
      icon: ShoppingBag,
      color: 'amber',
      gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
      change: '+18%',
      changeUp: true,
    },
    {
      label: 'Active Branches',
      value: branches.length,
      prefix: '',
      decimals: 0,
      icon: Building2,
      color: 'emerald',
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      change: 'All operational',
      changeUp: true,
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
              <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse shadow-lg shadow-violet-500/50" />
              <span className="text-xs font-medium uppercase tracking-widest text-violet-400/80">
                Executive Overview
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Executive Dashboard
              <Crown className="h-7 w-7 text-amber-400/80" />
            </h1>
            <p className="mt-1 text-sm text-rms-muted">
              Multi-branch performance overview and business intelligence.
            </p>
          </div>

          <DateRange from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    p-6 transition-all duration-500
                    hover:border-${stat.color}-500/30
                    hover:shadow-2xl hover:shadow-${stat.color}-500/5
                    hover:-translate-y-0.5
                  `}
                >
                  <div className={`absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl ${stat.gradient} rounded-bl-full opacity-40`} />

                  <div className="relative flex items-start justify-between">
                    <div className="space-y-1.5">
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
                        rounded-xl p-3
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

        {/* ── Branch Ranking ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '280ms', animationFillMode: 'both' }}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl transition-all duration-500 hover:border-rms-border">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rms-border/40 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Branch Ranking</h2>
                  <p className="text-xs text-rms-muted/60">Performance leaderboard by revenue</p>
                </div>
              </div>
              <Badge color="amber" className="gap-1">
                <Star className="h-3 w-3" />
                {branches.length} branches
              </Badge>
            </div>

            {/* Ranking list */}
            {branches.length > 0 ? (
              <div className="divide-y divide-rms-border/20">
                {branches.map((b, i) => (
                  <div
                    key={b.branchId}
                    className="
                      group/row flex items-center gap-4 px-6 py-4
                      transition-all duration-300
                      hover:bg-gradient-to-r hover:from-white/[0.02] hover:to-transparent
                    "
                    style={{ animationDelay: `${(i + 4) * 60}ms` }}
                  >
                    <RankMedal rank={i + 1} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">{b.branchName}</h3>
                        {i === 0 && (
                          <Badge color="amber" className="text-[10px]">Top performer</Badge>
                        )}
                      </div>
                      {b.address && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-rms-muted/30" />
                          <span className="text-xs text-rms-muted/50 truncate">{b.address}</span>
                        </div>
                      )}
                    </div>

                    <RevenueBar value={b.revenue ?? 0} max={maxRevenue} />

                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-sm font-bold text-emerald-400 tabular-nums">
                        ${Number(b.revenue ?? 0).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        <ShoppingBag className="h-3 w-3 text-rms-muted/30" />
                        <span className="text-[11px] text-rms-muted/50 tabular-nums font-mono">
                          {b.orders} orders
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-rms-muted/20 transition-all group-hover/row:text-rms-muted/50 group-hover/row:translate-x-0.5" />
                  </div>
                ))}
              </div>
            ) : (
              <ChartEmpty
                icon={Building2}
                message="No branch data for this period. Adjust the date range."
              />
            )}

            {/* Footer summary */}
            {branches.length > 0 && (
              <div className="border-t border-rms-border/30 px-6 py-3 flex items-center justify-between">
                <span className="text-[10px] font-mono text-rms-muted/30 uppercase tracking-wider">
                  Ranked by total revenue
                </span>
                <div className="flex items-center gap-4 text-xs text-rms-muted/40">
                  <span className="tabular-nums">
                    Avg: ${(branches.reduce((s, b) => s + (b.revenue ?? 0), 0) / branches.length).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Top Items Chart ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl p-6 transition-all duration-500 hover:border-rms-border">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <BarChart3 className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Top Items</h2>
                  <p className="text-xs text-rms-muted/60">Highest revenue items across all branches</p>
                </div>
              </div>

              <Badge color="violet" className="gap-1">
                <Sparkles className="h-3 w-3" />
                All branches
              </Badge>
            </div>

            {(d.topItems ?? []).length > 0 ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(d.topItems ?? []).map((i) => ({
                        name: (i.name || '').slice(0, 16),
                        revenue: i.revenue ?? 0,
                      }))}
                      margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        {BAR_COLORS.map((color, i) => (
                          <linearGradient key={i} id={`execBar${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="name"
                        stroke="rgb(100 116 139 / 0.5)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        angle={-20}
                        textAnchor="end"
                        height={60}
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
                            formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                          />
                        }
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]} name="Revenue">
                        {(d.topItems ?? []).map((_, i) => (
                          <Cell key={i} fill={`url(#execBar${i % BAR_COLORS.length})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top 3 quick summary */}
                <div className="mt-6 pt-4 border-t border-rms-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-3.5 w-3.5 text-amber-400/60" />
                    <span className="text-xs font-semibold text-rms-muted/50 uppercase tracking-wider">
                      Top 3 performers
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(d.topItems ?? []).slice(0, 3).map((item, i) => {
                      const colors = [
                        'border-yellow-500/20 bg-yellow-500/[0.04]',
                        'border-slate-400/15 bg-slate-400/[0.03]',
                        'border-orange-500/15 bg-orange-500/[0.03]',
                      ];
                      const textColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
                      return (
                        <div
                          key={i}
                          className={`
                            flex items-center gap-3 rounded-xl border p-3
                            ${colors[i]}
                            transition-all duration-300 hover:-translate-y-0.5
                          `}
                        >
                          <RankMedal rank={i + 1} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">
                              {item.name}
                            </p>
                            <p className={`text-xs font-bold tabular-nums ${textColors[i]}`}>
                              ${Number(item.revenue ?? 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <ChartEmpty
                icon={BarChart3}
                message="No item data for this period. Adjust the date range."
              />
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-center py-2 animate-fade-in"
          style={{ animationDelay: '600ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-3 text-[10px] font-mono text-rms-muted/25 uppercase tracking-widest">
            <Crown className="h-3 w-3" />
            <span>Executive Dashboard • Admin Only</span>
          </div>
        </div>
      </div>
    </>
  );
}