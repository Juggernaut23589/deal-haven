'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { Search, Eye, CheckCircle2, XCircle, Pause, MoreHorizontal, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatPrice, formatDate } from '@/lib/formatters';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/store/uiStore';

interface AdminListing {
  id: string; title: string; price: number; status: string; createdAt: string;
  seller: { id: string; username: string; email: string };
  category: { name: string } | null;
  images: { thumbnailUrl: string | null }[];
  _count: { reports: number };
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  DRAFT: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800',
  PAUSED: 'bg-warning/10 text-warning border-warning/20',
  PENDING_REVIEW: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  REJECTED: 'bg-error/10 text-error border-error/20',
  SOLD: 'bg-primary/10 text-primary border-primary/20',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_OPTIONS = ['', 'ACTIVE', 'PENDING_REVIEW', 'PAUSED', 'REJECTED', 'SOLD', 'EXPIRED'];

function AdminListingsContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [listings, setListings] = React.useState<AdminListing[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState(searchParams.get('status') ?? '');
  const [page, setPage] = React.useState(1);
  const [actionListing, setActionListing] = React.useState<AdminListing | null>(null);
  const [newStatus, setNewStatus] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [isActing, setIsActing] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setIsLoading(true);
    adminApi.getListings({ page, limit: 30, search: search || undefined, status: status || undefined })
      .then((res) => { setListings(res.data as AdminListing[]); setTotal(res.meta.total); })
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setIsLoading(false));
  }, [page, search, status, toast]);

  React.useEffect(() => { load(); }, [load]);

  const handleAction = async () => {
    if (!actionListing || !newStatus) return;
    setIsActing(true);
    try {
      await adminApi.updateListingStatus(actionListing.id, newStatus, reason || undefined);
      toast.success(`Listing ${newStatus.toLowerCase()}`);
      setActionListing(null); setNewStatus(''); setReason(''); load();
    } catch {
      toast.error('Action failed');
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Listings</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} listings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No listings found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {listings.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {l.images[0]?.thumbnailUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={l.images[0].thumbnailUrl} alt={l.title} className="h-full w-full object-cover" />
                    : <Tag className="h-5 w-5 m-auto mt-3.5 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/listing/${l.id}` as Route} className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary truncate max-w-xs">
                      {l.title}
                    </Link>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', STATUS_COLOR[l.status] ?? STATUS_COLOR.DRAFT)}>
                      {l.status.replace('_', ' ')}
                    </span>
                    {l._count.reports > 0 && (
                      <span className="rounded-full bg-error/10 text-error border border-error/20 px-2 py-0.5 text-[11px] font-medium">
                        {l._count.reports} report{l._count.reports !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatPrice(l.price)} · {l.category?.name ?? 'Uncategorised'} · by @{l.seller.username} · {formatDate(l.createdAt)}
                  </p>
                </div>
                <div className="relative shrink-0">
                  <button onClick={() => setOpenMenu((p) => p === l.id ? null : l.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenu === l.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1">
                      <Link href={`/listing/${l.id}` as Route} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Eye className="h-3.5 w-3.5" /> View Listing
                      </Link>
                      {l.status === 'PENDING_REVIEW' && (
                        <button onClick={() => { setActionListing(l); setNewStatus('ACTIVE'); setOpenMenu(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-success hover:bg-success/5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      {l.status === 'ACTIVE' && (
                        <button onClick={() => { setActionListing(l); setNewStatus('PAUSED'); setOpenMenu(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/5">
                          <Pause className="h-3.5 w-3.5" /> Pause
                        </button>
                      )}
                      <button onClick={() => { setActionListing(l); setNewStatus('REJECTED'); setOpenMenu(null); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 30 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-slate-500">Page {page} of {Math.ceil(total / 30)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 30)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Modal open={!!actionListing} onClose={() => { setActionListing(null); setNewStatus(''); setReason(''); }} title={`${newStatus === 'ACTIVE' ? 'Approve' : newStatus === 'PAUSED' ? 'Pause' : 'Reject'} Listing`}>
        {actionListing && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Setting &ldquo;<strong>{actionListing.title}</strong>&rdquo; to <strong>{newStatus}</strong>.
            </p>
            {newStatus === 'REJECTED' && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Rejection reason *</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required placeholder="Explain why this listing is being rejected…"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setActionListing(null)}>Cancel</Button>
              <Button isLoading={isActing} onClick={() => void handleAction()} className={newStatus === 'REJECTED' ? 'bg-error hover:bg-error/90' : ''}>
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminListingsPage() {
  return (
    <React.Suspense>
      <AdminListingsContent />
    </React.Suspense>
  );
}
