import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  UtensilsCrossed,
  Pencil,
  Trash2,
  Layers,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  Filter,
  Package,
  DollarSign,
  Tag,
  AlertCircle,
  X,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { branchesApi } from '../lib/api';
import { toast } from 'sonner';

/* Menu page — no analytics/waste dependency */

/* ────────────────────────────────────
   Floating Orb Background
   ──────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-rms-amber/[0.03] blur-3xl animate-float" />
      <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-violet-500/[0.02] blur-3xl animate-float-delayed" />
      <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-emerald-500/[0.02] blur-3xl animate-float-slow" />
    </div>
  );
}

/* ────────────────────────────────────
   Animated Counter
   ──────────────────────────────────── */
function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = display;
    const dur = 400;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span>{display}</span>;
}

/* ────────────────────────────────────
   Menu Item Card Component
   ──────────────────────────────────── */
function MenuItemCard({ item, canEdit, onToggle, onEdit, onDelete }) {
  const colorMap = {
    available: {
      icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/5',
      border: 'group-hover:border-emerald-500/20',
    },
    soldOut: {
      icon: 'bg-red-500/10 border-red-500/20 text-red-400',
      glow: 'group-hover:shadow-red-500/5',
      border: 'group-hover:border-red-500/20',
    },
  };

  const style = item.available ? colorMap.available : colorMap.soldOut;

  return (
    <div className={`group relative animate-scale-in`}>
      {/* Hover glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-rms-amber/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div
        className={`
          relative overflow-hidden rounded-2xl
          border border-rms-border/60 bg-rms-panel/80 backdrop-blur-xl
          p-5 transition-all duration-500
          ${style.border} ${style.glow}
          hover:shadow-2xl hover:-translate-y-0.5
        `}
      >
        {/* Subtle corner gradient */}
        <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-rms-amber/5 to-transparent rounded-bl-full" />

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div
            className={`
              flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
              border transition-all duration-300
              ${style.icon}
              group-hover:scale-110
            `}
          >
            <UtensilsCrossed className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{item.name}</h3>
              {!item.available && (
                <Badge color="red" className="animate-pulse-subtle">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Sold out
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-rms-muted">
                <Tag className="h-3 w-3" />
                {item.category?.name ?? 'Uncategorized'}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-white tabular-nums tracking-tight">
              <span className="text-sm font-medium text-rms-muted/60 mr-0.5">$</span>
              {Number(item.price ?? 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action bar — slides up on hover */}
        {canEdit && (
          <div
            className="
              mt-4 pt-3 border-t border-rms-border/30
              flex items-center justify-end gap-1
              opacity-0 max-h-0 overflow-hidden
              group-hover:opacity-100 group-hover:max-h-20
              transition-all duration-300 ease-out
            "
          >
            <button
              type="button"
              onClick={() => onToggle(item)}
              className={`
                inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
                text-xs font-medium transition-all duration-200
                ${
                  item.available
                    ? 'text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20'
                    : 'text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20'
                }
              `}
              title={item.available ? 'Mark sold out' : 'Mark available'}
            >
              {item.available ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {item.available ? 'Sold out' : 'Available'}
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              className="
                inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
                text-xs font-medium text-rms-muted
                border border-transparent
                transition-all duration-200
                hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20
              "
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              className="
                inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
                text-xs font-medium text-rms-muted
                border border-transparent
                transition-all duration-200
                hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20
              "
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────
   Main Menu Page
   ──────────────────────────────────── */
export default function Menu() {
  const { user, branchId: authBranchId } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const branchId = authBranchId || selectedBranchId;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryModal, setCategoryModal] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [itemModal, setItemModal] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', categoryId: '', price: '', available: true });
  const [waste, setWaste] = useState(null);
  const [wasteLoading, setWasteLoading] = useState(false);
  const [wasteFrom, setWasteFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [wasteTo, setWasteTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  /* Delay showing skeleton so fast loads don't flash */
  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }
    const timer = setTimeout(() => setShowSkeleton(true), 150);
    return () => clearTimeout(timer);
  }, [loading]);

  const load = () => {
    if (!branchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([
      branchesApi.getCategories(branchId),
      branchesApi.getItems(branchId),
    ])
      .then(([catRes, itemRes]) => {
        const catList = catRes?.data ?? catRes ?? [];
        const itemList = itemRes?.data ?? itemRes ?? [];
        setCategories(Array.isArray(catList) ? catList : []);
        setItems(Array.isArray(itemList) ? itemList : []);
      })
      .catch((e) => setError(e?.message || 'Failed to load menu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authBranchId && canEdit) {
      branchesApi
        .list()
        .then((res) => {
          const list = res.data ?? res ?? [];
          setBranches(list);
          if (list.length > 0 && !selectedBranchId) setSelectedBranchId(list[0].id);
        })
        .catch(() => setBranches([]));
    }
  }, [authBranchId, user?.role]);

  useEffect(() => {
    load();
  }, [branchId]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedCategory !== 'all') list = list.filter((i) => i.categoryId === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name?.toLowerCase().includes(q));
    }
    return list;
  }, [items, selectedCategory, search]);

  /* ── Stats ── */
  const totalItems = items.length;
  const availableItems = items.filter((i) => i.available).length;
  const soldOutItems = totalItems - availableItems;

  const openCategoryModal = (cat = null) => {
    setCategoryModal(cat || {});
    setCategoryName(cat?.name ?? '');
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim() || !branchId) return;
    setSubmitting(true);
    try {
      if (categoryModal?.id) {
        await branchesApi.updateCategory(branchId, categoryModal.id, { name: categoryName.trim() });
        toast.success('Category updated');
      } else {
        await branchesApi.createCategory(branchId, { name: categoryName.trim() });
        toast.success('Category created');
      }
      setCategoryModal(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openItemModal = (item = null) => {
    if (!item && categories.length === 0) {
      toast.error('Create a category first before adding items.');
      return;
    }
    // Set to empty object for new item, or to item object for editing
    setItemModal(item || {});
    setItemForm({
      name: item?.name ?? '',
      categoryId: item?.categoryId ?? (categories[0]?.id ?? ''),
      price: item?.price != null ? String(item.price) : '',
      available: item?.available !== false,
    });
  };

  const saveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.categoryId || !branchId) return;
    const price = parseFloat(itemForm.price);
    if (isNaN(price) || price < 0) {
      toast.error('Enter a valid price');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: itemForm.name.trim(),
        categoryId: itemForm.categoryId,
        price,
        available: itemForm.available,
      };
      if (itemModal?.id) {
        await branchesApi.updateItem(branchId, itemModal.id, payload);
        toast.success('Item updated');
      } else {
        await branchesApi.createItem(branchId, payload);
        toast.success('Item added');
      }
      setItemModal(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailable = async (item) => {
    try {
      await branchesApi.toggleItemAvailable(branchId, item.id);
      toast.success(item.available ? 'Marked sold out' : 'Marked available');
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget || !branchId) return;
    setSubmitting(true);
    try {
      await branchesApi.deleteItem(branchId, deleteTarget.id);
      toast.success('Item deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async () => {
    if (!deleteTarget || !branchId) return;
    setSubmitting(true);
    try {
      await branchesApi.deleteCategory(branchId, deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      setCategoryModal(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isDeleteCategory = deleteTarget?.isCategory === true;
  const handleConfirmDelete = () => (isDeleteCategory ? deleteCategory() : deleteItem());

  /* ── No Branch: Admin/Manager Picker ── */
  if (!branchId) {
    if (canEdit) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
          <FloatingOrbs />
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl" />
            <div className="relative rounded-2xl border border-rms-border/60 bg-rms-panel/90 backdrop-blur-xl px-8 py-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Building2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Select Branch</h3>
                  <p className="text-sm text-rms-muted">Choose a branch to manage its menu</p>
                </div>
              </div>
              {branches.length === 0 ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <AlertCircle className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm text-amber-300">No branches found. Create a branch first.</p>
                </div>
              ) : (
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="
                    w-full rounded-xl border border-rms-border/60 bg-rms-dark/80
                    py-3 px-4 text-white
                    focus:border-rms-amber/50 focus:outline-none focus:ring-2 focus:ring-rms-amber/20
                    transition-all duration-200
                  "
                >
                  <option value="">Select branch...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      );
    }

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
            <p className="text-sm text-rms-muted leading-relaxed">
              Contact your administrator to assign a branch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading State: only full-page skeleton when no data yet, and after short delay (avoids flash) ── */
  const isInitialLoad = items.length === 0 && categories.length === 0;
  if (loading && isInitialLoad && showSkeleton) {
    return (
      <div className="space-y-8 animate-fade-in">
        <FloatingOrbs />
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 rounded-lg bg-rms-border/50 animate-pulse" />
            <div className="h-4 w-56 rounded-md bg-rms-border/30 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 rounded-xl bg-rms-border/30 animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-rms-border/30 animate-pulse" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid gap-3 grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-xl bg-rms-border/30 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-rms-border/30 bg-rms-panel/40 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error State ── */
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
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load</h3>
            <p className="text-sm text-red-300/80 leading-relaxed">{error}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={load}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Page ── */
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
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-500/50" />
              <span className="text-xs font-medium uppercase tracking-widest text-amber-400/80">
                Menu Management
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Menu
              <span className="inline-block ml-2 text-2xl">🍽️</span>
            </h1>
            <p className="mt-1 text-sm text-rms-muted">
              {totalItems} items across {categories.length} categories
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Branch selector for admins */}
            {canEdit && !authBranchId && branches.length > 1 && (
              <div className="flex items-center gap-2 mr-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rms-border/10 border border-rms-border/30">
                  <Building2 className="h-4 w-4 text-rms-muted" />
                </div>
                <select
                  value={branchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="
                    rounded-xl border border-rms-border/60 bg-rms-panel/80 backdrop-blur
                    py-2 px-3 text-sm text-white
                    focus:border-rms-amber/50 focus:outline-none
                    transition-all duration-200
                  "
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canEdit && (
              <>
                <Button
                  size="md"
                  variant="secondary"
                  className="gap-2 group/btn"
                  onClick={() => {
                    console.log('Category button clicked!');
                    openCategoryModal();
                  }}
                >
                  <Layers className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                  Category
                </Button>
                <Button
                  size="md"
                  className="gap-2 group/btn"
                  onClick={() => openItemModal()}
                  disabled={categories.length === 0}
                >
                  <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90 duration-300" />
                  Add Item
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div
          className="grid gap-3 grid-cols-3 animate-slide-up"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          {[
            {
              label: 'Total Items',
              value: totalItems,
              icon: Package,
              color: 'amber',
              gradient: 'from-amber-500/10',
            },
            {
              label: 'Available',
              value: availableItems,
              icon: Eye,
              color: 'emerald',
              gradient: 'from-emerald-500/10',
            },
            {
              label: 'Sold Out',
              value: soldOutItems,
              icon: EyeOff,
              color: 'red',
              gradient: 'from-red-500/10',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`
                  group relative overflow-hidden rounded-2xl
                  border border-rms-border/40 bg-rms-panel/60 backdrop-blur-xl
                  px-5 py-4 transition-all duration-500
                  hover:border-${stat.color}-500/20 hover:-translate-y-0.5
                `}
              >
                <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl ${stat.gradient} to-transparent rounded-bl-full opacity-50`} />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-rms-muted/70">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-extrabold text-white tabular-nums mt-0.5">
                      <AnimatedCount value={stat.value} />
                    </p>
                  </div>
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-xl
                      bg-${stat.color}-500/10 border border-${stat.color}-500/20 text-${stat.color}-400
                      transition-transform duration-300 group-hover:scale-110
                    `}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Search + Filters ── */}
        <div
          className="space-y-4 animate-slide-up"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rms-muted/60" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full rounded-2xl border border-rms-border/60 bg-rms-panel/60 backdrop-blur-xl
                py-3 pl-11 pr-10 text-white placeholder-rms-muted/50
                focus:border-rms-amber/40 focus:outline-none focus:ring-2 focus:ring-rms-amber/10
                transition-all duration-300
              "
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-rms-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium
                transition-all duration-300
                ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-rms-amber/20 to-orange-500/10 text-rms-amber border border-rms-amber/30 shadow-lg shadow-rms-amber/5'
                    : 'border border-rms-border/40 text-rms-muted/70 hover:bg-white/5 hover:text-white hover:border-rms-border'
                }
              `}
            >
              <span className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                All
                <span
                  className={`
                    ml-1 text-[11px] font-bold tabular-nums
                    ${selectedCategory === 'all' ? 'text-rms-amber/60' : 'text-rms-muted/40'}
                  `}
                >
                  {totalItems}
                </span>
              </span>
            </button>

            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium
                    transition-all duration-300 group/pill
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-rms-amber/20 to-orange-500/10 text-rms-amber border border-rms-amber/30 shadow-lg shadow-rms-amber/5'
                        : 'border border-rms-border/40 text-rms-muted/70 hover:bg-white/5 hover:text-white hover:border-rms-border'
                    }
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    {cat.name}
                    <span
                      className={`
                        text-[11px] font-bold tabular-nums
                        ${isActive ? 'text-rms-amber/60' : 'text-rms-muted/40'}
                      `}
                    >
                      {count}
                    </span>
                    {/* Edit icon for admin on hover */}
                    {canEdit && (
                      <Pencil
                        className="h-3 w-3 opacity-0 group-hover/pill:opacity-50 hover:!opacity-100 transition-opacity ml-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCategoryModal(cat);
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Item Grid ── */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '300ms', animationFillMode: 'both' }}
        >
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-3xl bg-rms-amber/10 blur-2xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-rms-panel border border-rms-border/40">
                  <UtensilsCrossed className="h-9 w-9 text-rms-muted/30" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">No items found</h3>
              <p className="text-sm text-rms-muted/60 max-w-xs">
                {search
                  ? `No results for "${search}". Try a different search.`
                  : 'Get started by adding your first menu item.'}
              </p>
              {canEdit && !search && (
                <Button
                  size="md"
                  className="mt-6 gap-2"
                  onClick={() => openItemModal()}
                  disabled={categories.length === 0}
                >
                  <Plus className="h-4 w-4" />
                  {categories.length === 0 ? 'Create a category first' : 'Add first item'}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  className="animate-scale-in"
                >
                  <MenuItemCard
                    item={item}
                    canEdit={canEdit}
                    onToggle={toggleAvailable}
                    onEdit={openItemModal}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Results footer ── */}
        {filteredItems.length > 0 && (
          <div
            className="flex items-center justify-center py-2 animate-fade-in"
            style={{ animationDelay: '500ms', animationFillMode: 'both' }}
          >
            <span className="text-xs text-rms-muted/40 font-mono">
              Showing {filteredItems.length} of {totalItems} items
            </span>
          </div>
        )}
      </div>

      {/* ── Category Modal ── */}
      <Modal
        open={categoryModal !== null}
        onClose={() => setCategoryModal(null)}
        title={categoryModal?.id ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={saveCategory} className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rms-amber/5 border border-rms-amber/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Layers className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-sm text-rms-muted">
              Categories help organize your menu into logical sections.
            </div>
          </div>

          <Input
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            placeholder="e.g. Mains, Desserts, Drinks"
          />

          <div className="flex gap-3 pt-2">
            {categoryModal?.id && (
              <Button
                type="button"
                variant="danger"
                className="gap-2"
                onClick={() => setDeleteTarget({ ...categoryModal, isCategory: true })}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="ghost" onClick={() => setCategoryModal(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Item Modal ── */}
      <Modal
        open={itemModal !== null}
        onClose={() => setItemModal(null)}
        title={itemModal?.id ? 'Edit Item' : 'New Item'}
      >
        <form onSubmit={saveItem} className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <UtensilsCrossed className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-sm text-rms-muted">
              {itemModal?.id ? 'Update the details for this menu item.' : 'Add a new dish to your menu.'}
            </div>
          </div>

          <Input
            label="Item Name"
            value={itemForm.name}
            onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
            required
            placeholder="e.g. Grilled Salmon"
          />

          <div>
            <label className="block text-sm font-medium text-rms-muted mb-2">Category</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rms-muted/40" />
              <select
                value={itemForm.categoryId}
                onChange={(e) => setItemForm((p) => ({ ...p, categoryId: e.target.value }))}
                required
                className="
                  w-full rounded-xl border border-rms-border/60 bg-rms-dark/80
                  py-3 pl-10 pr-4 text-white appearance-none
                  focus:border-rms-amber/50 focus:outline-none focus:ring-2 focus:ring-rms-amber/10
                  transition-all duration-200
                "
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rms-muted/40 rotate-90" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-rms-muted mb-2">Price</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rms-muted/40" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={itemForm.price}
                onChange={(e) => setItemForm((p) => ({ ...p, price: e.target.value }))}
                required
                placeholder="0.00"
                className="
                  w-full rounded-xl border border-rms-border/60 bg-rms-dark/80
                  py-3 pl-10 pr-4 text-white placeholder-rms-muted/40
                  focus:border-rms-amber/50 focus:outline-none focus:ring-2 focus:ring-rms-amber/10
                  transition-all duration-200 tabular-nums
                "
              />
            </div>
          </div>

          {itemModal?.id && (
            <label
              className="
                flex items-center gap-3 p-3 rounded-xl
                border border-rms-border/30 bg-rms-dark/30
                cursor-pointer transition-all duration-200
                hover:bg-rms-dark/50 hover:border-rms-border/50
              "
            >
              <input
                type="checkbox"
                checked={itemForm.available}
                onChange={(e) => setItemForm((p) => ({ ...p, available: e.target.checked }))}
                className="rounded border-rms-border bg-rms-dark text-rms-amber focus:ring-rms-amber h-4 w-4"
              />
              <div>
                <span className="text-sm font-medium text-white">Available</span>
                <p className="text-xs text-rms-muted">Uncheck to mark as sold out</p>
              </div>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setItemModal(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1 gap-2">
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : itemModal?.id ? (
                'Update Item'
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={isDeleteCategory ? 'Delete Category?' : 'Delete Item?'}
        message={
          deleteTarget
            ? `Remove "${deleteTarget.name}"?${isDeleteCategory ? ' Items in this category will need reassignment.' : ''}`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        loading={submitting}
      />
    </>
  );
}