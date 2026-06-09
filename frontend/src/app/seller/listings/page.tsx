'use client';

import { SellerMobileNav, SellerSidebar } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useSearchParams } from 'next/navigation';
import {
  Plus, Search, MoreHorizontal, Eye, Edit, Pause, Play,
  Trash2, RefreshCw, ChevronRight, Package, AlertCircle,
  CheckCircle2, Clock, XCircle, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatPostedAgo } from '@/lib/formatters';
import { listingsApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { ListingCard } from '@/types/listing';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', icon: CheckCircle2, color: 'bg-success/10 text-success border-success/20' },
  DRAFT: { label: 'Draft', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
  PAUSED: { label: 'Paused', icon: Pause, color: 'bg-warning/10 text-warning border-warning/20' },
  SOLD: { label: 'Sold', icon: Tag, color: 'bg-primary/10 text-primary border-primary/20' },
  EXPIRED: { label: 'Expired', icon: XCircle, color: 'bg-error/10 text-error border-error/20' },
  PENDING_REVIEW: { label: 'In Review', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'bg-error/10 text-error border-error/20' },
  RESERVED: { label: 'Reserved', icon: Clock, color: 'bg-primary/10 text-primary border-primary/20' },
  DELETED: { label: 'Deleted', icon: Trash2, color: 'bg-slate-100 text-slate-500 border-slate-200' },
} as const;

const TABS = [
  { key: '', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'PAUSED', label: 'Paused' },
  { key: 'SOLD', label: 'Sold' },
  { key: 'EXPIRED', label: 'Expired' },
];

export default function SellerListingsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [listings, setListings] = React.useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  // Initialise tab from URL query param (set by Manage Listings sub-menu links)
  const [activeTab, setActiveTab] = React.useState(() => searchParams.get('status') ?? '');
  const [search, setSearch] = React.useState('');
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Sync tab when URL param changes (e.g. back/forward navigation)
  React.useEffect(() => {
    const s = searchParams.get('status') ?? '';
    setActiveTab(s);
  }, [searchParams]);

  const load = React.useCallback((status?: string) => {
    setIsLoading(true);
    listingsApi.getMyListings(status || undefined, 1, 50)
      .then((res) => setListings(res.data ?? []))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setIsLoading(false));
  }, [toast]);

  React.useEffect(() => { load(activeTab); }, [activeTab, load]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return listings;
    const q = search.toLowerCase();
    return listings.filter((l) => l.title.toLowerCase().includes(q));
  }, [listings, search]);

  const [confirmDelete, setConfirmDelete] = React.useState<{ id: string; title: string } | null>(null);

  // Close action menu on outside click
  React.useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-listing-menu]')) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const handleAction = async (id: string, action: 'publish' | 'unpublish' | 'delete' | 'renew', title?: string) => {
    if (action === 'delete') {
      setConfirmDelete({ id, title: title ?? 'this listing' });
      setOpenMenu(null);
      return;
    }
    setActionLoading(id);
    setOpenMenu(null);
    try {
      if (action === 'publish') await listingsApi.publish(id);
      else if (action === 'unpublish') await listingsApi.unpublish(id);
      else if (action === 'renew') await listingsApi.renew(id);
      toast.success(`Listing ${action + 'd'} successfully`);
      load(activeTab);
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeleteListing = async () => {
    if (!confirmDelete) return;
    setActionLoading(confirmDelete.id);
    setConfirmDelete(null);
    try {
      await listingsApi.delete(confirmDelete.id);
      toast.success('Listing deleted successfully');
      load(activeTab);
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) return null;

  return (
    <>
      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 id="confirm-delete-title" className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">Delete listing?</h3>
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-medium text-slate-700 dark:text-slate-300">&ldquo;{confirmDelete.title}&rdquo;</span> will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button size="sm" className="flex-1 bg-error hover:bg-error/90 text-white border-0" onClick={() => void confirmDeleteListing()}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8 items-start">
            <SellerSidebar activePage="Manage Listings" />
            <main className="flex-1 min-w-0">
      <SellerMobileNav />
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/seller" className="text-slate-500 hover:text-primary transition-colors">Seller Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Manage Listings</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Manage Listings</h1>
          <Link href={'/listing/create' as Route}>
            <Button leftIcon={<Plus className="h-4 w-4" />}>New Listing</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your listings…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-card">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Package className="h-10 w-10" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No listings found</p>
              <Link href={'/listing/create' as Route}>
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Create your first listing</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((listing) => {
                const statusKey = listing.status as keyof typeof STATUS_CONFIG;
                const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.DRAFT;
                const StatusIcon = statusCfg.icon;
                const isActioning = actionLoading === listing.id;

                return (
                  <div key={listing.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Image */}
                    <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {listing.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={typeof listing.coverImage === "string" ? listing.coverImage : listing.coverImage?.url ?? ""} alt={listing.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Tag className="h-5 w-5 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/listing/${listing.id}` as Route} className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors line-clamp-1">
                        {listing.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sm font-bold text-primary tabular-nums">{formatPrice(listing.price)}</span>
                        <span className="text-xs text-slate-400">{formatPostedAgo(listing.createdAt)}</span>
                        <span className="text-xs text-slate-400">{listing.viewCount ?? 0} views</span>
                      </div>
                    </div>

                    {/* Status */}
                    <span className={cn('hidden sm:flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', statusCfg.color)}>
                      <StatusIcon className="h-3 w-3" aria-hidden="true" />
                      {statusCfg.label}
                    </span>

                    {/* Actions */}
                    <div className="relative shrink-0" data-listing-menu>
                      <button
                        disabled={isActioning}
                        onClick={() => setOpenMenu((prev) => prev === listing.id ? null : listing.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        aria-label="Listing actions"
                      >
                        {isActioning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </button>
                      {openMenu === listing.id && (
                        <div className="absolute right-0 top-full mt-1 z-[200] w-44 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1">
                          <Link href={`/listing/${listing.id}` as Route} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          <Link href={`/listing/${listing.id}/edit` as Route} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Link>
                          {['ACTIVE', 'active'].includes(listing.status) && (
                            <button onClick={() => void handleAction(listing.id, 'unpublish')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <Pause className="h-3.5 w-3.5" /> Pause
                            </button>
                          )}
                          {(['PAUSED', 'paused', 'DRAFT', 'draft'] as string[]).includes(listing.status) && (
                            <button onClick={() => void handleAction(listing.id, 'publish')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <Play className="h-3.5 w-3.5" /> Publish
                            </button>
                          )}
                          {['EXPIRED', 'expired'].includes(listing.status) && (
                            <button onClick={() => void handleAction(listing.id, 'renew')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <RefreshCw className="h-3.5 w-3.5" /> Renew
                            </button>
                          )}
                          <hr className="my-1 border-slate-100 dark:border-slate-800" />
                          <button onClick={() => void handleAction(listing.id, 'delete', listing.title)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
