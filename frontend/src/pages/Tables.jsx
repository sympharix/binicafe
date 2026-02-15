import { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Pencil, Trash2, Wifi } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { branchesApi } from '../lib/api';
import { TABLE_STATUS } from '../config/constants';
import { toast } from 'sonner';

const STATUS_MAP = { EMPTY: 'empty', OCCUPIED: 'occupied', RESERVED: 'reserved' };
const STATUS_OPTIONS = ['EMPTY', 'OCCUPIED', 'RESERVED'];

export default function Tables() {
  const { branchId } = useAuth();
  const { on, off, connected } = useSocket();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tableModal, setTableModal] = useState(null);
  const [tableForm, setTableForm] = useState({ number: '', capacity: 2, status: 'EMPTY' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!branchId) return;
    setLoading(true);
    branchesApi.getTables(branchId).then((res) => setTables(res.data ?? [])).catch((e) => setError(e.message || 'Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [branchId]);

  useEffect(() => {
    const h = () => load();
    on('table:status', h);
    return () => off('table:status', h);
  }, [on, off, branchId]);

  const openTableModal = (table = null) => {
    setTableModal(table || {});
    setTableForm({
      number: table?.number ?? '',
      capacity: table?.capacity ?? 2,
      status: table?.status ?? 'EMPTY',
    });
  };

  const saveTable = async (e) => {
    e.preventDefault();
    if (!tableForm.number.trim() || !branchId) return;
    const capacity = parseInt(tableForm.capacity, 10) || 2;
    setSubmitting(true);
    try {
      if (tableModal?.id) {
        await branchesApi.updateTable(branchId, tableModal.id, { number: tableForm.number.trim(), capacity, status: tableForm.status });
        toast.success('Table updated');
      } else {
        await branchesApi.createTable(branchId, { number: tableForm.number.trim(), capacity, status: tableForm.status });
        toast.success('Table added');
      }
      setTableModal(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (tableId, status) => {
    try {
      await branchesApi.updateTableStatus(branchId, tableId, status);
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  };

  const deleteTable = async () => {
    if (!deleteTarget || !branchId) return;
    setSubmitting(true);
    try {
      await branchesApi.deleteTable(branchId, deleteTarget.id);
      toast.success('Table removed');
      setDeleteTarget(null);
      setTableModal(null);
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
        <Card className="p-8 text-center text-amber-200 border-amber-500/30">No branch assigned.</Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
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

  const statusCounts = { empty: 0, occupied: 0, reserved: 0 };
  tables.forEach((t) => {
    const k = STATUS_MAP[t.status] ?? t.status?.toLowerCase() ?? 'empty';
    if (statusCounts[k] !== undefined) statusCounts[k]++;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rms-muted/20 text-rms-muted'}`}>
            <Wifi className="h-3.5 w-3.5" />
            {connected ? 'Live' : 'Offline'}
          </div>
          <div className="flex flex-wrap gap-2">
          {Object.entries(TABLE_STATUS).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-2 rounded-lg bg-rms-panel/50 px-3 py-1.5">
              <Badge color={color}>{label}</Badge>
            <span className="text-sm text-rms-muted">{statusCounts[key] ?? 0}</span>
          </div>
        ))}
          </div>
        </div>
        <Button size="md" className="gap-2" onClick={() => openTableModal()}>
          <Plus className="h-4 w-4" />
          Add table
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tables.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-rms-muted/50 mb-4" />
            <p className="text-rms-muted">No tables</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => openTableModal()}>
              Add first table
            </Button>
          </div>
        ) : (
          tables.map((table) => {
            const statusKey = STATUS_MAP[table.status] ?? table.status?.toLowerCase() ?? 'empty';
            const status = TABLE_STATUS[statusKey] ?? TABLE_STATUS.empty;
            return (
              <Card key={table.id} hover className="p-5 transition-all hover:shadow-glow-amber/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rms-dark border border-rms-border">
                      <LayoutGrid className="h-5 w-5 text-rms-muted" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{table.number}</p>
                      <p className="text-sm text-rms-muted">{table.capacity} seats</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <select
                      value={table.status}
                      onChange={(e) => updateStatus(table.id, e.target.value)}
                      className="rounded-lg border border-rms-border bg-rms-dark px-2 py-1 text-xs text-white focus:border-rms-amber/50 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{TABLE_STATUS[STATUS_MAP[s]]?.label ?? s}</option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openTableModal(table)}
                        className="rounded-lg p-1.5 text-rms-muted hover:bg-white/5 hover:text-white"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(table)}
                        className="rounded-lg p-1.5 text-rms-muted hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal open={tableModal !== null} onClose={() => setTableModal(null)} title={tableModal?.id ? 'Edit table' : 'New table'}>
        <form onSubmit={saveTable} className="space-y-4">
          <Input
            label="Table number"
            value={tableForm.number}
            onChange={(e) => setTableForm((p) => ({ ...p, number: e.target.value }))}
            required
            placeholder="e.g. T1"
          />
          <Input
            label="Capacity (seats)"
            type="number"
            min="1"
            value={tableForm.capacity}
            onChange={(e) => setTableForm((p) => ({ ...p, capacity: e.target.value }))}
          />
          {tableModal?.id && (
            <div>
              <label className="block text-sm font-medium text-rms-muted mb-1.5">Status</label>
              <select
                value={tableForm.status}
                onChange={(e) => setTableForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full rounded-xl border border-rms-border bg-rms-dark py-2.5 px-4 text-white focus:border-rms-amber/50 focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{TABLE_STATUS[STATUS_MAP[s]]?.label ?? s}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            {tableModal?.id && (
              <Button type="button" variant="danger" onClick={() => setDeleteTarget(tableModal)}>Delete</Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="ghost" onClick={() => setTableModal(null)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove table?"
        message={deleteTarget ? `Remove table ${deleteTarget.number}?` : ''}
        confirmLabel="Remove"
        onConfirm={deleteTable}
        loading={submitting}
      />
    </div>
  );
}
