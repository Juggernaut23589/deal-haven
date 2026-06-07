'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Layers, Plus, X } from 'lucide-react';
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

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface CreateFormProps {
  parentId?: string;
  parentName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateCategoryForm({ parentId, parentName, onSuccess, onCancel }: CreateFormProps) {
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugTouched) setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setIsSubmitting(true);
    try {
      await adminApi.createCategory({ name: name.trim(), slug: slug.trim(), parentId });
      toast.success(`${parentId ? 'Subcategory' : 'Category'} "${name}" created`);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to create category';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="border border-primary/30 rounded-lg p-4 bg-primary/5 dark:bg-primary/10 space-y-3">
      {parentName && (
        <p className="text-xs text-slate-500">Adding subcategory under <span className="font-semibold text-slate-700 dark:text-slate-300">{parentName}</span></p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Electronics"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
          <input
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            placeholder="e.g. electronics"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!name.trim() || !slug.trim()}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Create
        </Button>
      </div>
    </form>
  );
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [showCreateTop, setShowCreateTop] = React.useState(false);
  const [showCreateSub, setShowCreateSub] = React.useState<string | null>(null); // parentId

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage marketplace categories and subcategories</p>
        </div>
        {!showCreateTop && (
          <Button size="sm" onClick={() => setShowCreateTop(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> New Category
          </Button>
        )}
      </div>

      {showCreateTop && (
        <CreateCategoryForm
          onSuccess={() => { setShowCreateTop(false); load(); }}
          onCancel={() => setShowCreateTop(false)}
        />
      )}

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : categories.length === 0 && !showCreateTop ? (
          <div className="py-16 text-center">
            <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">No categories yet</p>
            <Button size="sm" onClick={() => setShowCreateTop(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Create First Category
            </Button>
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
                        <button onClick={() => toggleExpand(cat.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cat.name}</p>
                          <p className="text-xs text-slate-400">/{cat.slug} · {cat._count.listings} listings · {cat.children.length} subcategories</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setShowCreateSub(cat.id); setExpanded((p) => new Set(p).add(cat.id)); }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Subcategory
                        </Button>
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

                  {isExpanded && (
                    <>
                      {cat.children.map((sub) => (
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

                      {showCreateSub === cat.id && (
                        <div className="px-4 py-3 pl-12 bg-slate-50/50 dark:bg-slate-800/20">
                          <CreateCategoryForm
                            parentId={cat.id}
                            parentName={cat.name}
                            onSuccess={() => { setShowCreateSub(null); load(); }}
                            onCancel={() => setShowCreateSub(null)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
