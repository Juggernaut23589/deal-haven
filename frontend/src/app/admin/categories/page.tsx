'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/store/uiStore';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  _count: { listings: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  iconUrl: string | null;
  _count: { listings: number };
  children: SubCategory[];
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [toggling, setToggling] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setIsLoading(true);
    adminApi.getCategories()
      .then((res) => setCategories(res.data as Category[]))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setIsLoading(false));
  }, [toast]);

  React.useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      await adminApi.updateCategory(id, { isActive: !current });
      toast.success(`Category ${!current ? 'activated' : 'deactivated'}`);
      load();
    } catch {
      toast.error('Failed to update category');
    } finally {
      setToggling(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Categories</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage marketplace categories and subcategories</p>
      </div>

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((cat) => {
              const isExpanded = expanded.has(cat.id);
              return (
                <React.Fragment key={cat.id}>
                  <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {cat.children.length > 0 ? (
                          <button onClick={() => toggleExpand(cat.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="w-4" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cat.name}</p>
                          <p className="text-xs text-slate-400">/{cat.slug} · {cat._count.listings} listings · {cat.children.length} subcategories</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium border',
                          cat.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-slate-100 text-slate-400 border-slate-200')}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button
                          size="sm"
                          variant={cat.isActive ? 'outline' : 'ghost'}
                          isLoading={toggling === cat.id}
                          onClick={() => void toggleActive(cat.id, cat.isActive)}
                        >
                          {cat.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {isExpanded && cat.children.map((sub) => (
                    <div key={sub.id} className="px-4 py-3 pl-12 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 dark:text-slate-200">{sub.name}</p>
                          <p className="text-xs text-slate-400">/{sub.slug} · {sub._count.listings} listings</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium border',
                            sub.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-slate-100 text-slate-400 border-slate-200')}>
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <Button
                            size="sm"
                            variant={sub.isActive ? 'outline' : 'ghost'}
                            isLoading={toggling === sub.id}
                            onClick={() => void toggleActive(sub.id, sub.isActive)}
                          >
                            {sub.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
