import { useState, useEffect, useRef } from 'react';
import {
  ChefHat,
  Clock,
  Wifi,
  WifiOff,
  Flame,
  CheckCircle2,
  Send,
  UtensilsCrossed,
  Timer,
  AlertCircle,
  Sparkles,
  Activity,
  ArrowRight,
  StickyNote,
  Package,
  Zap,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ordersApi } from '../lib/api';

const KITCHEN_STATUSES = ['SENT', 'PREPARING', 'READY'];

/* ────────────────────────────────────
   Floating Orbs
   ──────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-500/[0.03] blur-3xl animate-float" />
      <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-amber-500/[0.02] blur-3xl animate-float-delayed" />
      <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-emerald-500/[0.02] blur-3xl animate-float-slow" />
    </div>
  );
}

/* ────────────────────────────────────
   Live Timer Hook
   ──────────────────────────────────── */
function useLiveTimer(date) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!date) return;

    const update = () => {
      const d = new Date(date);
      const now = new Date();
      const mins = Math.floor((now - d) / 60000);
      if (mins < 1) setElapsed('Just now');
      else if (mins < 60) setElapsed(`${mins}m`);
      else setElapsed(`${Math.floor(mins / 60)}h ${mins % 60}m`);
    };

    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [date]);

  return elapsed;
}

/* ────────────────────────────────────
   Timer Badge (color shifts by urgency)
   ──────────────────────────────────── */
function TimerBadge({ date }) {
  const elapsed = useLiveTimer(date);

  const mins = date ? Math.floor((Date.now() - new Date(date).getTime()) / 60000) : 0;

  let colorClass = 'text-rms-muted/60 bg-rms-border/10 border-rms-border/20';
  if (mins >= 15) colorClass = 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse-subtle';
  else if (mins >= 8) colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-lg border px-2 py-1
        text-[11px] font-mono font-medium tabular-nums
        ${colorClass}
      `}
    >
      <Timer className="h-3 w-3" />
      {elapsed || '—'}
    </span>
  );
}

/* ────────────────────────────────────
   Status Config
   ──────────────────────────────────── */
const STATUS_CONFIG = {
  SENT: {
    label: 'In Queue',
    color: 'blue',
    icon: Send,
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/5',
    gradient: 'from-blue-500/10 to-transparent',
  },
  PREPARING: {
    label: 'Preparing',
    color: 'amber',
    icon: Flame,
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/5',
    gradient: 'from-amber-500/10 to-transparent',
  },
  READY: {
    label: 'Ready',
    color: 'emerald',
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
    gradient: 'from-emerald-500/10 to-transparent',
  },
};

/* ────────────────────────────────────
   Order Item Pill
   ──────────────────────────────────── */
function OrderItemPill({ item }) {
  return (
    <div
      className="
        inline-flex items-center gap-1.5 rounded-lg
        border border-rms-border/30 bg-rms-dark/40
        px-2.5 py-1.5 text-sm
        transition-all duration-200 hover:bg-rms-dark/60
      "
    >
      <span className="text-rms-amber font-bold tabular-nums text-xs">
        {item.quantity || 0}×
      </span>
      <span className="text-white font-medium">
        {item.item?.name || 'Item'}
      </span>
    </div>
  );
}

/* ────────────────────────────────────
   Animated Counter
   ──────────────────────────────────── */
function AnimatedCount({ value, className = '' }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = prevRef.current;
    const dur = 400;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    prevRef.current = value;
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={`tabular-nums ${className}`}>{display}</span>;
}

/* ────────────────────────────────────
   Kitchen Order Card
   ──────────────────────────────────── */
function KitchenOrderCard({ order, onStatusUpdate }) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.SENT;
  const StatusIcon = config.icon;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl
        border border-rms-border/50 bg-rms-panel/80 backdrop-blur-xl
        transition-all duration-500
        hover:border-${config.color}-500/30
        hover:shadow-2xl ${config.glow}
        hover:-translate-y-0.5
        ${order.status === 'READY' ? 'ring-1 ring-emerald-500/30' : ''}
        animate-scale-in
      `}
    >
      {/* Top accent gradient */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${config.gradient} via-transparent`} />

      {/* Corner gradient */}
      <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl ${config.gradient} rounded-bl-full opacity-40`} />

      {/* Pulsing glow for READY orders */}
      {order.status === 'READY' && (
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/[0.03] animate-pulse-subtle pointer-events-none" />
      )}

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Order badge */}
            <div
              className={`
                relative flex h-11 w-11 items-center justify-center
                rounded-xl border ${config.bg}
                transition-all duration-300 group-hover:scale-110
              `}
            >
              <StatusIcon className={`h-5 w-5 ${config.text}`} />
              {order.status === 'PREPARING' && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  #{order.id?.slice(-6)}
                </span>
                <Badge color={config.color}>
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm text-rms-muted flex items-center gap-1">
                  <UtensilsCrossed className="h-3 w-3" />
                  Table {order.table?.number ?? '—'}
                </span>
                <TimerBadge date={order.createdAt} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {order.status === 'SENT' && (
              <button
                onClick={() => onStatusUpdate(order.id, 'PREPARING')}
                className="
                  group/btn flex items-center gap-2 rounded-xl
                  bg-gradient-to-r from-amber-500/20 to-orange-500/15
                  border border-amber-500/30
                  px-4 py-2.5 text-sm font-semibold text-amber-300
                  transition-all duration-300
                  hover:from-amber-500/30 hover:to-orange-500/25
                  hover:shadow-lg hover:shadow-amber-500/10
                  hover:scale-[1.02] active:scale-[0.98]
                "
              >
                <Flame className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                Start Prep
              </button>
            )}
            {order.status === 'PREPARING' && (
              <button
                onClick={() => onStatusUpdate(order.id, 'READY')}
                className="
                  group/btn flex items-center gap-2 rounded-xl
                  bg-gradient-to-r from-emerald-500/20 to-teal-500/15
                  border border-emerald-500/30
                  px-4 py-2.5 text-sm font-semibold text-emerald-300
                  transition-all duration-300
                  hover:from-emerald-500/30 hover:to-teal-500/25
                  hover:shadow-lg hover:shadow-emerald-500/10
                  hover:scale-[1.02] active:scale-[0.98]
                "
              >
                <CheckCircle2 className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                Mark Ready
              </button>
            )}
            {order.status === 'READY' && (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Awaiting pickup
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="flex flex-wrap gap-2 mb-2">
          {(order.orderItems ?? []).map((oi, idx) => (
            <OrderItemPill key={idx} item={oi} />
          ))}
          {(!order.orderItems || order.orderItems.length === 0) && (
            <span className="text-sm text-rms-muted/50 italic">No items</span>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div
            className="
              mt-3 flex items-start gap-2 rounded-xl
              border border-amber-500/15 bg-amber-500/[0.04]
              px-3 py-2.5
            "
          >
            <StickyNote className="h-4 w-4 text-amber-400/60 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300/80 italic leading-snug">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────
   Prep Summary Card
   ──────────────────────────────────── */
function PrepSummaryCard({ counts, total }) {
  const items = [
    {
      label: 'In Queue',
      value: counts.sent,
      icon: Send,
      color: 'blue',
      gradient: 'from-blue-500/15',
    },
    {
      label: 'Preparing',
      value: counts.preparing,
      icon: Flame,
      color: 'amber',
      gradient: 'from-amber-500/15',
    },
    {
      label: 'Ready',
      value: counts.ready,
      icon: CheckCircle2,
      color: 'emerald',
      gradient: 'from-emerald-500/15',
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = item.icon;
        const pct = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div
            key={item.label}
            className={`
              group relative overflow-hidden rounded-xl
              border border-rms-border/40 bg-rms-dark/40
              p-4 transition-all duration-300
              hover:border-${item.color}-500/20 hover:-translate-y-0.5
            `}
          >
            <div className={`absolute top-0 right-0 h-14 w-14 bg-gradient-to-bl ${item.gradient} to-transparent rounded-bl-full opacity-50`} />

            <div className="relative flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-lg
                    bg-${item.color}-500/10 border border-${item.color}-500/20
                    text-${item.color}-400
                    transition-transform duration-300 group-hover:scale-110
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-rms-muted">{item.label}</span>
              </div>
              <span className={`text-2xl font-extrabold text-${item.color}-400 tabular-nums`}>
                <AnimatedCount value={item.value} />
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-rms-border/15 overflow-hidden">
              <div
                className={`h-full rounded-full bg-${item.color}-400/60 transition-all duration-1000 ease-out`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────
   Connection Banner
   ──────────────────────────────────── */
function ConnectionBanner({ connected }) {
  return (
    <div
      className={`
        flex items-center gap-3 rounded-2xl
        border backdrop-blur-xl
        px-5 py-4 transition-all duration-500
        ${
          connected
            ? 'border-rms-amber/20 bg-gradient-to-r from-rms-amber/[0.06] to-orange-500/[0.03]'
            : 'border-red-500/20 bg-gradient-to-r from-red-500/[0.06] to-rose-500/[0.03]'
        }
      `}
    >
      <div
        className={`
          flex h-11 w-11 items-center justify-center rounded-xl border
          ${
            connected
              ? 'bg-rms-amber/10 border-rms-amber/20 text-rms-amber'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }
        `}
      >
        <ChefHat className="h-6 w-6" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-white">Kitchen Display System</p>
        <p className="text-xs text-rms-muted/60 mt-0.5">
          Update order status as you prep. Ready orders notify the floor instantly.
        </p>
      </div>

      <div
        className={`
          flex items-center gap-2 rounded-xl border px-3 py-2
          text-xs font-semibold
          ${
            connected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }
        `}
      >
        <div className="relative">
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected && (
            <>
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
            </>
          )}
        </div>
        {connected ? 'Live' : 'Offline'}
      </div>
    </div>
  );
}

/* ────────────────────────────────────
   Main Kitchen Page
   ──────────────────────────────────── */
export default function Kitchen() {
  const { branchId } = useAuth();
  const { on, off, connected } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = () => {
    if (!branchId) return;
    ordersApi
      .list(branchId)
      .then((res) => {
        const list = res.data ?? res ?? [];
        setOrders(
          Array.isArray(list) ? list.filter((o) => KITCHEN_STATUSES.includes(o.status)) : []
        );
      })
      .catch(() => {});
  };

  useEffect(() => {
    const h = () => loadOrders();
    on('order:created', h);
    on('order:status', h);
    on('order:cancelled', h);
    return () => {
      off('order:created', h);
      off('order:status', h);
      off('order:cancelled', h);
    };
  }, [on, off, branchId]);

  useEffect(() => {
    if (!branchId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await ordersApi.list(branchId);
        const list = res.data ?? res ?? [];
        const queue = Array.isArray(list)
          ? list.filter((o) => KITCHEN_STATUSES.includes(o.status))
          : [];
        if (cancelled) return;
        setOrders(queue);
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

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await ordersApi.updateStatus(orderId, status, branchId);
      loadOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const counts = { sent: 0, preparing: 0, ready: 0 };
  orders.forEach((o) => {
    if (o.status === 'SENT') counts.sent++;
    else if (o.status === 'PREPARING') counts.preparing++;
    else if (o.status === 'READY') counts.ready++;
  });
  const total = orders.length;

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
            <p className="text-sm text-rms-muted">Contact your administrator to access the kitchen display.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <FloatingOrbs />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-rms-border/50 animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-rms-border/30 animate-pulse" />
        </div>
        <div className="h-20 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-rms-border/30 bg-rms-panel/40 animate-pulse"
                style={{ animationDelay: `${(i + 3) * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <FloatingOrbs />
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 blur-xl" />
          <div className="relative rounded-2xl border border-red-500/30 bg-rms-panel/90 backdrop-blur-xl px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Kitchen View ── */
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
              <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse shadow-lg shadow-orange-500/50" />
              <span className="text-xs font-medium uppercase tracking-widest text-orange-400/80">
                Kitchen Display
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Kitchen
              <span className="text-2xl">🔥</span>
            </h1>
            <p className="mt-1 text-sm text-rms-muted">
              {total} active orders in the queue
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-rms-muted">
            <Clock className="h-4 w-4 text-rms-amber/60" />
            <span className="font-mono tabular-nums">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* ── Connection Banner ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '80ms', animationFillMode: 'both' }}
        >
          <ConnectionBanner connected={connected} />
        </div>

        {/* ── Status Pipeline ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '160ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { key: 'sent', label: 'In Queue', count: counts.sent, config: STATUS_CONFIG.SENT },
              { key: 'preparing', label: 'Preparing', count: counts.preparing, config: STATUS_CONFIG.PREPARING },
              { key: 'ready', label: 'Ready', count: counts.ready, config: STATUS_CONFIG.READY },
            ].map((stage, idx) => {
              const Icon = stage.config.icon;
              return (
                <div key={stage.key} className="flex items-center gap-2">
                  <div
                    className={`
                      flex items-center gap-2.5 rounded-xl border
                      ${stage.config.bg} px-4 py-2.5
                      transition-all duration-300 hover:scale-[1.02]
                    `}
                  >
                    <Icon className={`h-4 w-4 ${stage.config.text}`} />
                    <span className={`text-sm font-medium ${stage.config.text}`}>
                      {stage.label}
                    </span>
                    <span
                      className={`
                        flex h-6 w-6 items-center justify-center
                        rounded-md ${stage.config.bg} border
                        text-xs font-bold ${stage.config.text} tabular-nums
                      `}
                    >
                      <AnimatedCount value={stage.count} />
                    </span>
                  </div>
                  {idx < 2 && (
                    <ArrowRight className="h-4 w-4 text-rms-muted/20 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Queue */}
          <div
            className="lg:col-span-2 animate-slide-up"
            style={{ animationDelay: '240ms', animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-rms-amber/60" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-rms-muted/60">
                Order Queue
              </h2>
              <span className="text-xs text-rms-muted/30 font-mono tabular-nums">
                ({total})
              </span>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 blur-2xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-rms-panel border border-rms-border/40">
                      <ChefHat className="h-9 w-9 text-rms-muted/25" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">All clear! 🎉</h3>
                  <p className="text-sm text-rms-muted/50 max-w-xs">
                    No orders in the kitchen queue. New orders will appear here in real time.
                  </p>
                </div>
              ) : (
                orders.map((order, idx) => (
                  <div
                    key={order.id}
                    style={{ animationDelay: `${(idx + 4) * 60}ms`, animationFillMode: 'both' }}
                  >
                    <KitchenOrderCard
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prep Summary Sidebar */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: '350ms', animationFillMode: 'both' }}
          >
            <div className="sticky top-24 space-y-6">
              {/* Summary card */}
              <div className="overflow-hidden rounded-2xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl">
                <div className="border-b border-rms-border/40 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <Activity className="h-4.5 w-4.5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Prep Summary</h2>
                      <p className="text-[11px] text-rms-muted/50">Real-time breakdown</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <PrepSummaryCard counts={counts} total={total} />
                </div>

                {/* Total footer */}
                <div className="border-t border-rms-border/30 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-rms-muted/40">Total active</span>
                  <span className="text-lg font-extrabold text-white tabular-nums">
                    <AnimatedCount value={total} />
                  </span>
                </div>
              </div>

              {/* Quick tip card */}
              <div
                className="
                  rounded-2xl border border-rms-border/30
                  bg-gradient-to-br from-rms-amber/[0.04] to-transparent
                  backdrop-blur-xl p-5
                "
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rms-amber/10 border border-rms-amber/20 shrink-0">
                    <Sparkles className="h-4 w-4 text-rms-amber" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white mb-1">Kitchen Tips</h3>
                    <ul className="space-y-1.5 text-[11px] text-rms-muted/50 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="text-rms-amber mt-0.5">•</span>
                        Tap <strong className="text-white/70">Start Prep</strong> when you begin cooking
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        Tap <strong className="text-white/70">Mark Ready</strong> to notify the floor
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">•</span>
                        Red timers mean the order has been waiting 15+ minutes
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-center py-2 animate-fade-in"
          style={{ animationDelay: '600ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-3 text-[10px] font-mono text-rms-muted/20 uppercase tracking-widest">
            <ChefHat className="h-3 w-3" />
            <span>Kitchen Display System • Real-time Updates</span>
          </div>
        </div>
      </div>
    </>
  );
}