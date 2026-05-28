'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, CheckCircle2, XCircle, AlertCircle, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/formatters';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/store/uiStore';

interface AdminUser {
  id: string; email: string; username: string; status: string; roles: string[];
  emailVerified: boolean; createdAt: string; lastLoginAt: string | null;
  profile: { displayName: string | null; avatarUrl: string | null } | null;
  _count: { listings: number; buyerOrders: number };
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  SUSPENDED: 'bg-warning/10 text-warning border-warning/20',
  BANNED: 'bg-error/10 text-error border-error/20',
  PENDING_VERIFICATION: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800',
  DELETED: 'bg-slate-100 text-slate-400 border-slate-200',
};

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState(searchParams.get('status') ?? '');
  const [page, setPage] = React.useState(1);
  const [actionUser, setActionUser] = React.useState<AdminUser | null>(null);
  const [newStatus, setNewStatus] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [isActing, setIsActing] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setIsLoading(true);
    adminApi.getUsers({ page, limit: 30, search: search || undefined, status: status || undefined })
      .then((res) => { setUsers(res.data as AdminUser[]); setTotal(res.meta.total); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setIsLoading(false));
  }, [page, search, status, toast]);

  React.useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async () => {
    if (!actionUser || !newStatus) return;
    setIsActing(true);
    try {
      await adminApi.updateUserStatus(actionUser.id, newStatus, reason);
      toast.success(`User status updated to ${newStatus}`);
      setActionUser(null);
      setNewStatus('');
      setReason('');
      load();
    } catch {
      toast.error('Action failed');
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by email or username…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No users found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <Avatar src={u.profile?.avatarUrl} name={u.profile?.displayName ?? u.username} size="sm" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{u.profile?.displayName ?? u.username}</p>
                    {u.emailVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-label="Email verified" />}
                    <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', STATUS_COLOR[u.status] ?? STATUS_COLOR.ACTIVE)}>
                      {u.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Joined {formatDate(u.createdAt)} · {u._count.listings} listings · {u._count.buyerOrders} orders
                  </p>
                </div>
                <div className="relative shrink-0">
                  <button onClick={() => setOpenMenu((p) => p === u.id ? null : u.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenu === u.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1">
                      {u.status !== 'ACTIVE' && (
                        <button onClick={() => { setActionUser(u); setNewStatus('ACTIVE'); setOpenMenu(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-success hover:bg-success/5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                        </button>
                      )}
                      {u.status !== 'SUSPENDED' && (
                        <button onClick={() => { setActionUser(u); setNewStatus('SUSPENDED'); setOpenMenu(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/5">
                          <AlertCircle className="h-3.5 w-3.5" /> Suspend
                        </button>
                      )}
                      {u.status !== 'BANNED' && (
                        <button onClick={() => { setActionUser(u); setNewStatus('BANNED'); setOpenMenu(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5">
                          <XCircle className="h-3.5 w-3.5" /> Ban
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 30 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-slate-500">Page {page} of {Math.ceil(total / 30)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 30)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* Action modal */}
      <Modal open={!!actionUser} onClose={() => { setActionUser(null); setNewStatus(''); setReason(''); }} title={`${newStatus?.charAt(0) + newStatus?.slice(1).toLowerCase()} User`}>
        {actionUser && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You are about to set <strong>{actionUser.profile?.displayName ?? actionUser.username}</strong>&apos;s status to <strong>{newStatus}</strong>.
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Reason (optional)</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Internal note…"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setActionUser(null)}>Cancel</Button>
              <Button isLoading={isActing} onClick={() => void handleStatusUpdate()}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
