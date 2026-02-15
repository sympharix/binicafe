import { useState, useEffect } from 'react';
import { Package, ArrowDownToLine, ArrowUpFromLine, Minus, AlertTriangle, Wifi } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { inventoryApi } from '../lib/api';
import { toast } from 'sonner';

export default function Inventory() {
  const { branchId } = useAuth();
  const { on, off, connected } = useSocket();
  const [list, setList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movementModal, setMovementModal] = useState(null);
  const [movementType, setMovementType] = useState('IN');
  const [movementQty, setMovementQty] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!branchId) return;
    setLoading(true);
    Promise.all([
      inventoryApi.list(branchId),
      inventoryApi.getLowStock(branchId),
    ])
      .then(([listRes, lowRes]) => {
        setList(listRes.data ?? []);
        setLowStock(lowRes.data ?? []);
      })
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [branchId]);

  useEffect(() => {
    const h = () => load();
    on('inventory:movement', h);
    return () => off('inventory:movement', h);
  }, [on, off, branchId]);

  const handleAddMovement = async (e) => {
    e.preventDefault();
    if (!movementModal || !branchId) return;
    const qty = parseFloat(movementQty);
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    setSubmitting(true);
    try {
      await inventoryApi.addMovement(movementModal.id, branchId, {
        type: movementType,
        quantity: movementType === 'ADJUST' ? qty : Math.abs(qty),
        reason: movementReason || undefined,
      });
      toast.success('Movement recorded');
      setMovementModal(null);
      setMovementQty('');
      setMovementReason('');
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!branchId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="p-8 text-center text-amber-200 border-amber-500/30">
          No branch assigned. Contact admin.
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="p-6 border-red-500/30 bg-red-500/10 text-red-400">{error}</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {lowStock.length > 0 && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10 flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-amber-400 shrink-0" />
          <div>
            <p className="font-medium text-amber-200">Low stock alert</p>
            <p className="text-sm text-amber-200/80">
              {lowStock.length} item(s) below minimum. Review and restock.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setLowStock([])}>
            Dismiss
          </Button>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Stock</h2>
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rms-muted/20 text-rms-muted'}`}>
            <Wifi className="h-3.5 w-3.5" />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-rms-border bg-rms-panel/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rms-border bg-rms-dark/50">
                <th className="text-left py-4 px-6 text-sm font-medium text-rms-muted">Item</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-rms-muted">Unit</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-rms-muted">Quantity</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-rms-muted">Min</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-rms-muted w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-rms-muted">
                    No inventory items. Add items from the backend or create here.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id} className="border-t border-rms-border hover:bg-white/[0.02]">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-rms-muted" />
                        <span className="font-medium text-white">{item.name}</span>
                        {item.item && (
                          <span className="text-xs text-rms-muted">({item.item.name})</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-rms-muted">{item.unit ?? 'unit'}</td>
                    <td className="py-4 px-6 text-right font-medium text-white">{item.quantity}</td>
                    <td className="py-4 px-6 text-right text-rms-muted">{item.minQuantity}</td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setMovementModal(item);
                          setMovementType('IN');
                          setMovementQty('');
                          setMovementReason('');
                        }}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!movementModal}
        onClose={() => setMovementModal(null)}
        title={movementModal ? `Stock movement — ${movementModal.name}` : ''}
      >
        <form onSubmit={handleAddMovement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rms-muted mb-1.5">Type</label>
            <div className="flex gap-2">
              {[
                { value: 'IN', label: 'In', icon: ArrowDownToLine },
                { value: 'OUT', label: 'Out', icon: ArrowUpFromLine },
                { value: 'ADJUST', label: 'Set', icon: Minus },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMovementType(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    movementType === value
                      ? 'border-rms-amber bg-rms-amber/15 text-rms-amber'
                      : 'border-rms-border text-rms-muted hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Quantity"
            type="number"
            step="any"
            min="0"
            value={movementQty}
            onChange={(e) => setMovementQty(e.target.value)}
            required
            placeholder={movementType === 'ADJUST' ? 'New total' : 'Amount'}
          />
          <Input
            label="Reason (optional)"
            value={movementReason}
            onChange={(e) => setMovementReason(e.target.value)}
            placeholder="e.g. Restock, waste"
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setMovementModal(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
