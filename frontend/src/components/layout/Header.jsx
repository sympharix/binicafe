import { useState, useEffect, useRef, Fragment } from 'react';
import {
  Bell,
  User,
  LogOut,
  Check,
  CheckCheck,
  ChevronDown,
  Settings,
  Shield,
  Clock,
  Sparkles,
  BellOff,
  AlertTriangle,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationsApi } from '../../lib/api';
import { APP_CONFIG } from '../../config/constants';

/* ────────────────────────────────────
   Notification Icon Mapper
   ──────────────────────────────────── */
function NotificationIcon({ type }) {
  const map = {
    order_ready: {
      icon: ShoppingBag,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400',
    },
    low_stock: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
    },
  };

  const config = map[type] || {
    icon: Info,
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-400',
  };

  const Icon = config.icon;

  return (
    <div
      className={`
        flex h-9 w-9 shrink-0 items-center justify-center
        rounded-xl border ${config.bg} ${config.text}
      `}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

/* ────────────────────────────────────
   Time Ago Helper
   ──────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ────────────────────────────────────
   Role Badge
   ──────────────────────────────────── */
function RoleBadge({ role }) {
  const config = {
    ADMIN: { label: 'Admin', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    MANAGER: { label: 'Manager', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    STAFF: { label: 'Staff', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    KITCHEN: { label: 'Kitchen', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  };

  const c = config[role] || config.STAFF;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-md border
        px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
        ${c.color}
      `}
    >
      <Shield className="h-2.5 w-2.5" />
      {c.label}
    </span>
  );
}

/* ────────────────────────────────────
   Main Header
   ──────────────────────────────────── */
export default function Header({ title, subtitle }) {
  const { user, logout, branchId } = useAuth();
  const { on, off } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  /* ── Load notifications ── */
  useEffect(() => {
    if (!branchId) return;
    const load = () => {
      notificationsApi
        .list({ branchId })
        .then((res) => setNotifications(res.data ?? []))
        .catch(() => {});
    };
    load();

    const handler = () => {
      load();
      // Trigger bell animation on new notification
      setBellAnimating(true);
      setTimeout(() => setBellAnimating(false), 1000);
    };

    on('notification:new', handler);
    return () => off('notification:new', handler);
  }, [branchId, on, off]);

  /* ── Click outside ── */
  useEffect(() => {
    const handle = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markRead = (id) => {
    notificationsApi
      .markRead(id)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
      })
      .catch(() => {});
  };

  const markAllRead = () => {
    notificationsApi
      .markAllRead()
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
        );
      })
      .catch(() => {});
  };

  const getNotificationLabel = (n) => {
    if (n.type === 'order_ready')
      return `Order ready — Table ${n.meta?.tableNumber ?? n.meta?.orderId ?? ''}`;
    if (n.type === 'low_stock') return `Low stock: ${n.meta?.itemName ?? 'Item'}`;
    return n.message || n.type || 'Notification';
  };

  /* ── User initials ── */
  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-16 items-center justify-between
        border-b border-rms-border/50
        bg-rms-dark/70 backdrop-blur-2xl
        px-8
        transition-all duration-300
      "
    >
      {/* ── Background subtle gradient ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-40 w-96 rounded-full bg-rms-amber/[0.015] blur-3xl" />
      </div>

      {/* ── Title Section ── */}
      <div className="min-w-0 animate-slide-down" style={{ animationDuration: '400ms' }}>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight truncate">{title}</h1>
        </div>
        {subtitle && (
          <p className="mt-0.5 text-sm text-rms-muted/70 truncate">{subtitle}</p>
        )}
      </div>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-1.5">
        {APP_CONFIG.mockMode && (
          <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-400">
            Demo mode
          </span>
        )}
        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className={`
              group/bell relative flex h-10 w-10 items-center justify-center
              rounded-xl border border-transparent
              text-rms-muted transition-all duration-300
              hover:bg-white/[0.06] hover:text-white hover:border-rms-border/30
              ${notifOpen ? 'bg-white/[0.06] text-white border-rms-border/30' : ''}
            `}
            aria-label="Notifications"
          >
            <Bell
              className={`
                h-[18px] w-[18px] transition-transform duration-300
                group-hover/bell:scale-110
                ${bellAnimating ? 'animate-bell-ring' : ''}
              `}
            />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                <span className="absolute h-5 w-5 rounded-full bg-rms-amber/30 animate-ping" />
                <span
                  className="
                    relative flex h-5 w-5 items-center justify-center
                    rounded-full bg-gradient-to-br from-rms-amber to-orange-500
                    text-[10px] font-bold text-rms-dark
                    shadow-lg shadow-rms-amber/30
                  "
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* ── Notification Dropdown ── */}
          {notifOpen && (
            <div
              className="
                absolute right-0 top-full mt-2 w-96
                rounded-2xl border border-rms-border/60
                bg-rms-panel/95 backdrop-blur-2xl
                shadow-2xl shadow-black/30
                overflow-hidden z-50
                animate-dropdown
                origin-top-right
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-rms-border/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rms-amber/10 border border-rms-amber/20">
                    <Bell className="h-4 w-4 text-rms-amber" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <p className="text-[11px] text-rms-muted/60">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="
                      flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
                      text-[11px] font-medium text-rms-amber
                      border border-transparent
                      transition-all duration-200
                      hover:bg-rms-amber/10 hover:border-rms-amber/20
                    "
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rms-border/10">
                      <BellOff className="h-6 w-6 text-rms-muted/30" />
                    </div>
                    <p className="text-sm font-medium text-rms-muted/60">No notifications</p>
                    <p className="mt-1 text-xs text-rms-muted/30">
                      You'll see updates here in real time
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map((n, i) => (
                    <div
                      key={n.id}
                      className={`
                        group/notif relative flex items-start gap-3 px-5 py-4
                        border-b border-rms-border/20 last:border-0
                        transition-all duration-300
                        hover:bg-white/[0.02]
                        ${!n.readAt ? 'bg-rms-amber/[0.03]' : ''}
                      `}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      {/* Unread indicator line */}
                      {!n.readAt && (
                        <span className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-rms-amber" />
                      )}

                      <NotificationIcon type={n.type} />

                      <div className="flex-1 min-w-0">
                        <p
                          className={`
                            text-sm leading-snug
                            ${!n.readAt ? 'text-white font-medium' : 'text-rms-muted'}
                          `}
                        >
                          {getNotificationLabel(n)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="h-3 w-3 text-rms-muted/40" />
                          <span className="text-[11px] text-rms-muted/50 font-mono">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>

                      {!n.readAt && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="
                            shrink-0 flex h-8 w-8 items-center justify-center
                            rounded-lg border border-transparent
                            text-rms-muted/40
                            opacity-0 group-hover/notif:opacity-100
                            transition-all duration-200
                            hover:bg-rms-amber/10 hover:text-rms-amber hover:border-rms-amber/20
                          "
                          title="Mark read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-rms-border/30 px-5 py-3">
                  <span className="text-[10px] font-mono text-rms-muted/30 uppercase tracking-wider">
                    Showing latest {Math.min(notifications.length, 20)} notifications
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="mx-1.5 h-6 w-px bg-rms-border/30" />

        {/* ── Profile Menu ── */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className={`
              group/profile flex items-center gap-2.5
              rounded-xl px-2.5 py-1.5 border border-transparent
              transition-all duration-300
              hover:bg-white/[0.06] hover:border-rms-border/30
              ${profileOpen ? 'bg-white/[0.06] border-rms-border/30' : ''}
            `}
          >
            {/* Avatar */}
            <div className="relative">
              <div
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-lg bg-gradient-to-br from-rms-amber/25 to-orange-500/15
                  border border-rms-amber/20 text-rms-amber
                  text-xs font-bold
                  transition-all duration-300
                  group-hover/profile:scale-110 group-hover/profile:shadow-lg group-hover/profile:shadow-rms-amber/10
                "
              >
                {initials}
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-rms-dark" />
            </div>

            {/* Name + role (hidden on small screens) */}
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-sm font-medium text-white truncate max-w-[120px] leading-tight">
                {user?.name || user?.email || 'Staff'}
              </p>
              <RoleBadge role={user?.role} />
            </div>

            <ChevronDown
              className={`
                h-3.5 w-3.5 text-rms-muted/50 hidden sm:block
                transition-transform duration-300
                ${profileOpen ? 'rotate-180' : ''}
              `}
            />
          </button>

          {/* ── Profile Dropdown ── */}
          {profileOpen && (
            <div
              className="
                absolute right-0 top-full mt-2 w-72
                rounded-2xl border border-rms-border/60
                bg-rms-panel/95 backdrop-blur-2xl
                shadow-2xl shadow-black/30
                overflow-hidden z-50
                animate-dropdown
                origin-top-right
              "
            >
              {/* User info header */}
              <div className="px-5 py-5 border-b border-rms-border/30">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-12 w-12 items-center justify-center
                      rounded-xl bg-gradient-to-br from-rms-amber/25 to-orange-500/15
                      border border-rms-amber/20 text-rms-amber
                      text-lg font-bold
                    "
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-rms-muted/60 truncate mt-0.5">
                      {user?.email || '—'}
                    </p>
                    <div className="mt-1.5">
                      <RoleBadge role={user?.role} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <button
                  type="button"
                  className="
                    flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm text-rms-muted
                    transition-all duration-200
                    hover:bg-white/[0.04] hover:text-white
                  "
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  className="
                    flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm text-rms-muted
                    transition-all duration-200
                    hover:bg-white/[0.04] hover:text-white
                  "
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-rms-border/30 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="
                    group/logout flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-sm text-rms-muted
                    transition-all duration-200
                    hover:bg-red-500/[0.08] hover:text-red-400
                  "
                >
                  <LogOut className="h-4 w-4 transition-transform duration-300 group-hover/logout:-translate-x-0.5" />
                  Sign out
                </button>
              </div>

              {/* Footer meta */}
              <div className="border-t border-rms-border/20 px-5 py-2.5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-rms-muted/25 uppercase tracking-widest">
                  Session active
                </span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                  <span className="text-[9px] font-mono text-rms-muted/25">Online</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}