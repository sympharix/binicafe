import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  LayoutGrid,
  Receipt,
  ChefHat,
  Package,
  BarChart3,
  Building2,
  ChevronLeft,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG, NAV_ITEMS } from '../../config/constants';

const iconMap = {
  LayoutDashboard,
  UtensilsCrossed,
  LayoutGrid,
  Receipt,
  ChefHat,
  Package,
  BarChart3,
  Building2,
};

/* ────────────────────────────────────
   Nav Item Tooltip (collapsed mode)
   ──────────────────────────────────── */
function NavTooltip({ children, label, show }) {
  if (!show) return children;
  return (
    <div className="group/tip relative">
      {children}
      <div
        className="
          pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
          rounded-lg bg-rms-dark border border-rms-border/60 px-3 py-1.5
          text-xs font-medium text-white whitespace-nowrap
          opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100
          transition-all duration-200 origin-left
          shadow-xl shadow-black/30
        "
      >
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-rms-dark" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────
   Active Indicator Blob
   ──────────────────────────────────── */
function ActiveIndicator() {
  return (
    <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
      <span className="block h-6 w-1 rounded-full bg-rms-amber shadow-lg shadow-rms-amber/40" />
    </span>
  );
}

/* ────────────────────────────────────
   Connection Pulse
   ──────────────────────────────────── */
function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div
      className={`
        flex items-center gap-2.5 rounded-xl px-3 py-2.5
        border transition-all duration-500
        ${
          online
            ? 'bg-emerald-500/[0.06] border-emerald-500/15 text-emerald-400/80'
            : 'bg-red-500/[0.06] border-red-500/15 text-red-400/80'
        }
      `}
    >
      <div className="relative flex items-center justify-center">
        {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        <span
          className={`
            absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full
            ${online ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}
          `}
        />
        <span
          className={`
            absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full
            ${online ? 'bg-emerald-400' : 'bg-red-400'}
          `}
        />
      </div>
      <span className="text-[11px] font-medium">
        {online ? 'Connected' : 'Offline'}
      </span>
    </div>
  );
}

/* ────────────────────────────────────
   Main Sidebar
   ──────────────────────────────────── */
export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const [collapsed, setCollapsed] = useState(false);

  /* Group nav items by section */
  const mainNav = navItems.filter((item) =>
    ['/', '/menu', '/tables', '/orders'].includes(item.path)
  );
  const operationsNav = navItems.filter((item) =>
    ['/kitchen', '/inventory'].includes(item.path)
  );
  const insightsNav = navItems.filter((item) =>
    ['/analytics', '/branches', '/executive'].includes(item.path)
  );

  const renderSection = (label, items) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        {!collapsed && (
          <p
            className="
              px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em]
              text-rms-muted/40 select-none
            "
          >
            {label}
          </p>
        )}
        {collapsed && <div className="mx-auto my-3 h-px w-6 bg-rms-border/40 rounded-full" />}

        {items.map((item, idx) => {
          const Icon = iconMap[item.icon];
          return (
            <NavTooltip key={item.path} label={item.label} show={collapsed}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `
                    group/nav relative flex items-center gap-3
                    rounded-xl text-sm font-medium
                    transition-all duration-300 ease-out
                    ${collapsed ? 'justify-center px-3 py-3' : 'px-3 py-2.5'}
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-rms-amber/15 to-rms-amber/5 text-rms-amber border border-rms-amber/20 shadow-lg shadow-rms-amber/5'
                        : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
                    }
                  `
                }
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <ActiveIndicator />}

                    {Icon && (
                      <div
                        className={`
                          relative shrink-0 transition-all duration-300
                          ${isActive ? 'scale-110' : 'group-hover/nav:scale-110'}
                        `}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        {/* Icon glow on active */}
                        {isActive && (
                          <div className="absolute inset-0 blur-md bg-rms-amber/30 rounded-full -z-10" />
                        )}
                      </div>
                    )}

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Active chevron indicator */}
                    {isActive && !collapsed && (
                      <div className="ml-auto">
                        <div className="h-1.5 w-1.5 rounded-full bg-rms-amber animate-pulse" />
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            </NavTooltip>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen
        border-r border-rms-border/60
        bg-rms-panel/90 backdrop-blur-2xl
        transition-all duration-500 ease-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Background texture */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-rms-amber/[0.02] blur-3xl" />
        <div className="absolute bottom-0 -right-10 h-40 w-40 rounded-full bg-violet-500/[0.02] blur-3xl" />
      </div>

      <div className="flex h-full flex-col">
        {/* ── Logo ── */}
        <div
          className={`
            relative flex items-center border-b border-rms-border/50
            ${collapsed ? 'h-16 justify-center px-3' : 'h-16 gap-3 px-5'}
            transition-all duration-500
          `}
        >
          <div
            className="
              group/logo relative flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl bg-gradient-to-br from-rms-amber/20 to-orange-500/10
              border border-rms-amber/20 text-rms-amber
              transition-all duration-300
              hover:scale-110 hover:shadow-lg hover:shadow-rms-amber/10
              cursor-pointer
            "
          >
            <UtensilsCrossed className="h-5 w-5 transition-transform duration-500 group-hover/logo:rotate-12" />
            {/* Sparkle accent */}
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-rms-amber/60 animate-pulse" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden transition-all duration-500">
              <span className="block font-display text-lg font-bold tracking-tight text-white leading-tight">
                {APP_CONFIG.name}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-rms-muted/50">
                {APP_CONFIG.tagline}
              </span>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5 scrollbar-hide">
          {renderSection('Main', mainNav)}
          {renderSection('Operations', operationsNav)}
          {renderSection('Insights', insightsNav)}
        </nav>

        {/* ── Footer ── */}
        <div className="border-t border-rms-border/40 p-3 space-y-2">
          {/* Connection status */}
          {collapsed ? (
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-400/40 animate-ping" />
              </div>
            </div>
          ) : (
            <ConnectionStatus />
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`
              group/collapse flex w-full items-center gap-2
              rounded-xl px-3 py-2.5 text-xs font-medium
              text-rms-muted/50 border border-transparent
              transition-all duration-300
              hover:bg-white/[0.04] hover:text-rms-muted hover:border-rms-border/30
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <ChevronLeft
              className={`
                h-4 w-4 transition-transform duration-500
                ${collapsed ? 'rotate-180' : ''}
                group-hover/collapse:text-rms-amber
              `}
            />
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* Version */}
          {!collapsed && (
            <div className="text-center">
              <span className="text-[9px] font-mono text-rms-muted/20 uppercase tracking-widest">
                v2.4.1
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}