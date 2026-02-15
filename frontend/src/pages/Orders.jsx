import { useState, useEffect } from 'react';
import { Plus, Receipt, Wifi } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ordersApi, branchesApi } from '../lib/api';
import { ORDER_STATUS } from '../config/constants';
import { toast } from 'sonner';

const NEXT_STATUS = { PENDING: 'SENT', SENT: 'PREPARING', PREPARING: 'READY', READY: 'SERVED' };

export default function Orders() {
  const { branchId } = useAuth();
  const { on, off, connected } = useSocket();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrderTable, setNewOrderTable] = useState('');
  const [newOrderItems, setNewOrderItems] = useState([{ itemId: '', quantity: 1, notes: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    if (!branchId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [ordersRes, tablesRes, itemsRes] = await Promise.all([
          ordersApi.list(branchId),
          branchesApi.getTables(branchId),
          branchesApi.getItems(branchId),
        ]);
        if (cancelled) return;
        setOrders(ordersRes.data ?? ordersRes ?? []);
        setTables(tablesRes.data ?? tablesRes ?? []);
        setItems(itemsRes.data ?? itemsRes ?? []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId]);

  const loadOrders = () => {
    if (!branchId) return;
    ordersApi.list(branchId).then((res) => setOrders(res.data ?? res ?? [])).catch(() => {});
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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setOrderError('');
    setSubmitting(true);
    try {
      const body = {
        tableId: newOrderTable,
        items: newOrderItems.filter((r) => r.itemId && r.quantity > 0).map((r) => ({
          itemId: r.itemId,
          quantity: Number(r.quantity),
          notes: r.notes || undefined,
        })),
      };
      if (!body.items.length) throw new Error('Add at least one item');
      await ordersApi.create(body, branchId);
      toast.success('Order created');
      setShowNewOrder(false);
      setNewOrderTable('');
      setNewOrderItems([{ itemId: '', quantity: 1, notes: '' }]);
      loadOrders();
    } catch (e) {
      setOrderError(e.message || 'Failed to create order');
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await ordersApi.updateStatus(orderId, status, branchId);
      toast.success('Order updated');
      loadOrders();
      setDetailOrder((prev) => (prev?.id === orderId ? { ...prev, status } : prev));
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget || !branchId) return;
    setSubmitting(true);
    try {
      await ordersApi.cancel(cancelTarget.id, branchId);
      toast.success('Order cancelled');
      setCancelTarget(null);
      setDetailOrder(null);
      loadOrders();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!branchId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-amber-200">
          No branch assigned.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-6 animate-fade-in text-rms-muted animate-pulse">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Active orders</h2>
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rms-muted/20 text-rms-muted'}`}>
            <Wifi className="h-3.5 w-3.5" />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
        <Button size="md" className="gap-2" onClick={() => setShowNewOrder(true)}>
          <Plus className="h-4 w-4" />
          New order
        </Button>
      </div>

      <Modal open={showNewOrder} onClose={() => setShowNewOrder(false)} title="New order" size="md">
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {orderError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">{orderError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-rms-muted mb-1.5">Table</label>
                <select
                  value={newOrderTable}
                  onChange={(e) => setNewOrderTable(e.target.value)}
                  required
                  className="w-full rounded-xl border border-rms-border bg-rms-dark py-2.5 px-4 text-white focus:border-rms-amber/50 focus:outline-none"
                >
                  <option value="">Select table</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>{t.number} ({t.capacity} seats)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-rms-muted mb-1.5">Items</label>
                {newOrderItems.map((row, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select
                      value={row.itemId}
                      onChange={(e) => {
                        const next = [...newOrderItems];
                        next[i] = { ...next[i], itemId: e.target.value };
                        setNewOrderItems(next);
                      }}
                      className="flex-1 rounded-xl border border-rms-border bg-rms-dark py-2 px-3 text-white text-sm"
                    >
                      <option value="">Select item</option>
                      {items.filter((it) => it.available !== false).map((it) => (
                        <option key={it.id} value={it.id}>{it.name} (${Number(it.price).toFixed(2)})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => {
                        const next = [...newOrderItems];
                        next[i] = { ...next[i], quantity: parseInt(e.target.value, 10) || 1 };
                        setNewOrderItems(next);
                      }}
                      className="w-16 rounded-xl border border-rms-border bg-rms-dark py-2 px-3 text-white text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewOrderItems(newOrderItems.filter((_, j) => j !== i))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewOrderItems([...newOrderItems, { itemId: '', quantity: 1, notes: '' }])}
                >
                  + Add item
                </Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Creating...' : 'Create order'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowNewOrder(false)}>
                  Cancel
                </Button>
              </div>
            </form>
      </Modal>

      {detailOrder && (
        <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Order #${detailOrder.id?.slice(-6)}`} size="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-rms-muted">Table {detailOrder.table?.number ?? '-'}</p>
              <Badge color={ORDER_STATUS[detailOrder.status]?.color || 'slate'}>
                {ORDER_STATUS[detailOrder.status]?.label || detailOrder.status}
              </Badge>
            </div>
            {detailOrder.notes && (
              <p className="text-sm text-amber-200/90">Note: {detailOrder.notes}</p>
            )}
            <ul className="border-t border-rms-border pt-4 space-y-2">
              {(detailOrder.orderItems ?? []).map((oi) => (
                <li key={oi.id} className="flex justify-between text-sm">
                  <span className="text-white">{oi.quantity}× {oi.item?.name ?? '-'}</span>
                  <span className="text-rms-muted">${((oi.price ?? 0) * (oi.quantity ?? 0)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="text-right font-semibold text-white">
              Total: ${(detailOrder.orderItems ?? []).reduce((s, oi) => s + (oi.price ?? 0) * (oi.quantity ?? 0), 0).toFixed(2)}
            </p>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-rms-border">
              {NEXT_STATUS[detailOrder.status] && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(detailOrder.id, NEXT_STATUS[detailOrder.status])}
                >
                  {detailOrder.status === 'PENDING' && 'Send to kitchen'}
                  {detailOrder.status === 'SENT' && 'Start preparing'}
                  {detailOrder.status === 'PREPARING' && 'Mark ready'}
                  {detailOrder.status === 'READY' && 'Mark served'}
                </Button>
              )}
              {detailOrder.status === 'PENDING' && (
                <Button variant="danger" size="sm" onClick={() => setCancelTarget(detailOrder)}>
                  Cancel order
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setDetailOrder(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel order?"
        message={cancelTarget ? `This will cancel order #${cancelTarget.id?.slice(-6)}. This cannot be undone.` : ''}
        confirmLabel="Cancel order"
        onConfirm={handleCancelOrder}
        loading={submitting}
      />

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="p-8 text-center text-rms-muted">No orders yet</Card>
        ) : (
          orders.map((order) => {
          const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING;
          const total = order.orderItems?.reduce((s, oi) => s + (oi.price ?? 0) * (oi.quantity ?? 0), 0) ?? 0;
          return (
            <Card key={order.id} hover className="p-5 cursor-pointer" onClick={() => setDetailOrder(order)}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rms-dark border border-rms-border">
                    <Receipt className="h-5 w-5 text-rms-amber" />
                  </div>
                  <div>
                    <p className="font-mono font-semibold text-white">#{order.id?.slice(-6)}</p>
                    <p className="text-sm text-rms-muted">Table {order.table?.number ?? '-'} · {order.orderItems?.length ?? 0} items</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-semibold text-white">${total.toFixed(2)}</span>
                  <Badge color={status?.color || 'slate'}>{status?.label || order.status}</Badge>
                  {order.status === 'PENDING' && (
                    <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'SENT'); }}>
                      Send to kitchen
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        }))}
      </div>
    </div>
  );
}
