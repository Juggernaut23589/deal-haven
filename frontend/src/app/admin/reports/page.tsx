'use client';

import * as React from 'react';
import { Flag, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/formatters';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/store/uiStore';

interface AdminReport {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; username: string; email: string };
  listing: { id: string; title: string } | null;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  UNDER_REVIEW: 'bg-primary/10 text-primary border-primary/20',
  RESOLVED_REMOVED: 'bg-success/10 text-success border-success/20',
  RESOLVED_NO_ACTION: 'bg-slate-100 text-slate-500 border-slate-200',
  DISMISSED: 'bg-slate-100 text-slate-400 border-slate-200',
};

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = React.useState<AdminReport[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [page, setPage] = React.useState(1);

  const load = React.useCallback(() => {
    setIsLoading(true);
    adminApi.getReports({ page, limit: 30, status: status || undefined })
      .then((res) => { setReports(res.data as AdminReport[]); setTotal(res.meta.total); })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setIsLoading(false));
  }, [page, status, toast]);

  React.useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminApi.updateReportStatus(id, newStatus);
      toast.success('Report updated');
      load();
    } catch {
      toast.error('Failed to update report');
    }
  };

  const isActionable = (s: string) => s === 'PENDING' || s === 'UNDER_REVIEW';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} total reports</p>
      </div>

      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="UNDER_REVIEW">Under Review</option>
        <option value="RESOLVED_REMOVED">Resolved (Removed)</option>
        <option value="RESOLVED_NO_ACTION">Resolved (No Action)</option>
        <option value="DISMISSED">Dismissed</option>
      </select>

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No reports found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((r) => (
              <div key={r.id} className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Flag className="h-3.5 w-3.5 text-error" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
                        {r.reason.replace(/_/g, ' ').toLowerCase()}
                      </span>
                      <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-medium', STATUS_COLOR[r.status] ?? STATUS_COLOR.PENDING)}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                      <span>Reporter: <strong className="text-slate-700 dark:text-slate-300">@{r.reporter.username}</strong></span>
                      {r.listing && (
                        <span>Listing: <strong className="text-slate-700 dark:text-slate-300">{r.listing.title}</strong></span>
                      )}
                    </div>
                  </div>
                  {isActionable(r.status) && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => void handleStatusChange(r.id, 'DISMISSED')}>
                        Dismiss
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void handleStatusChange(r.id, 'RESOLVED_NO_ACTION')}>
                        No Action
                      </Button>
                      <Button size="sm" leftIcon={<AlertTriangle className="h-3.5 w-3.5" />} onClick={() => void handleStatusChange(r.id, 'RESOLVED_REMOVED')}>
                        Remove Content
                      </Button>
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
    </div>
  );
}
