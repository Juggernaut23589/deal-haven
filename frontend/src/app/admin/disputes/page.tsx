'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatPrice } from '@/lib/formatters';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/store/uiStore';

interface AdminDispute {
  id: string; status: string; reason: string; description: string; createdAt: string;
  resolvedAt: string | null; adminNotes: string | null;
  order: {
    id: string; orderNumber: string; total: number;
    buyer: { id: string; username: string; email: string };
    seller: { id: string; username: string; email: string };
  };
}

const STATUS_COLOR: Record<string, string> = {
  OPENED: 'bg-error/10 text-error border-error/20',
  EVIDENCE_COLLECTION: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  UNDER_REVIEW: 'bg-primary/10 text-primary border-primary/20',
  RESOLVED_FULL_REFUND: 'bg-success/10 text-success border-success/20',
  RESOLVED_PARTIAL_REFUND: 'bg-success/10 text-success border-success/20',
  RESOLVED_NO_REFUND: 'bg-slate-100 text-slate-500 border-slate-200',
  RESOLVED_RETURN_FOR_REFUND: 'bg-success/10 text-success border-success/20',
  CLOSED: 'bg-slate-100 text-slate-400 border-slate-200',
};

const RESOLUTION_OPTIONS = [
  { value: 'full_refund', label: 'Full Refund to Buyer' },
  { value: 'partial_refund', label: 'Partial Refund' },
  { value: 'no_refund', label: 'No Refund — Favour Seller' },
  { value: 'return_for_refund', label: 'Return Item for Refund' },
];

export default function AdminDisputesPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [disputes, setDisputes] = React.useState<AdminDispute[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [status, setStatus] = React.useState(searchParams.get('status') ?? '');
  const [page, setPage] = React.useState(1);
  const [resolveDispute, setResolveDispute] = React.useState<AdminDispute | null>(null);
  const [resolution, setResolution] = React.useState('');
  const [adminNotes, setAdminNotes] = React.useState('');
  const [isResolving, setIsResolving] = React.useState(false);

  const load = React.useCallback(() => {
    setIsLoading(true);
    adminApi.getDisputes({ page, limit: 20, status: status || undefined })
      .then((res) => { setDisputes(res.data as AdminDispute[]); setTotal(res.meta.total); })
      .catch(() => toast.error('Failed to load disputes'))
      .finally(() => setIsLoading(false));
  }, [page, status, toast]);

  React.useEffect(() => { load(); }, [load]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveDispute || !resolution || !adminNotes) return;
    setIsResolving(true);
    try {
      await adminApi.resolveDispute(resolveDispute.id, resolution, adminNotes);
      toast.success('Dispute resolved successfully');
      setResolveDispute(null); setResolution(''); setAdminNotes(''); load();
    } catch {
      toast.error('Failed to resolve dispute');
    } finally {
      setIsResolving(false);
    }
  };

  const isOpen = (d: AdminDispute) => ['OPENED', 'EVIDENCE_COLLECTION', 'UNDER_REVIEW'].includes(d.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Disputes</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} disputes</p>
      </div>

      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <option value="">All Statuses</option>
        <option value="OPENED">Opened</option>
        <option value="EVIDENCE_COLLECTION">Evidence Collection</option>
        <option value="UNDER_REVIEW">Under Review</option>
        <option value="RESOLVED_FULL_REFUND">Resolved — Full Refund</option>
        <option value="RESOLVED_NO_REFUND">Resolved — No Refund</option>
        <option value="CLOSED">Closed</option>
      </select>

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
        ) : disputes.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No disputes found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {disputes.map((d) => (
              <div key={d.id} className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono font-semibold text-primary">{d.order.orderNumber}</span>
                      <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-medium', STATUS_COLOR[d.status] ?? STATUS_COLOR.OPENED)}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(d.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
                      {d.reason.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                      <span>Buyer: <strong className="text-slate-700 dark:text-slate-300">@{d.order.buyer.username}</strong></span>
                      <span>Seller: <strong className="text-slate-700 dark:text-slate-300">@{d.order.seller.username}</strong></span>
                      <span>Order value: <strong className="text-slate-700 dark:text-slate-300">{formatPrice(d.order.total)}</strong></span>
                    </div>
                    {d.adminNotes && (
                      <p className="mt-2 text-xs text-primary border-l-2 border-primary/30 pl-2 italic">
                        Admin note: {d.adminNotes}
                      </p>
                    )}
                  </div>
                  {isOpen(d) && (
                    <Button size="sm" onClick={() => setResolveDispute(d)} leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-slate-500">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Modal open={!!resolveDispute} onClose={() => { setResolveDispute(null); setResolution(''); setAdminNotes(''); }} title="Resolve Dispute">
        {resolveDispute && (
          <form onSubmit={(e) => void handleResolve(e)} className="space-y-4">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm space-y-1">
              <p><span className="text-slate-500">Order:</span> <strong>{resolveDispute.order.orderNumber}</strong></p>
              <p><span className="text-slate-500">Amount:</span> <strong>{formatPrice(resolveDispute.order.total)}</strong></p>
              <p><span className="text-slate-500">Reason:</span> {resolveDispute.reason.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Resolution *</label>
              <select value={resolution} onChange={(e) => setResolution(e.target.value)} required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="">Select resolution…</option>
                {RESOLUTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Admin notes *</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} required minLength={10}
                placeholder="Document your decision and reasoning…"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setResolveDispute(null)}>Cancel</Button>
              <Button type="submit" isLoading={isResolving} loadingText="Resolving…">Submit Resolution</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
