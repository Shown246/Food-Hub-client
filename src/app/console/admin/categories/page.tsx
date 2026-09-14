'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../_actions';
import {
  AdminCategory,
  CreateAdminCategoryPayload,
  UpdateAdminCategoryPayload,
} from '@/types/admin.type';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  AlertTriangle,
  Loader2,
  Utensils,
  EyeOff,
  Eye,
  Hash,
  FileText,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<AdminCategory | null>(null);
  const [categoryInUseConflict, setCategoryInUseConflict] = useState<AdminCategory | null>(null);

  // Form states for Add Category
  const [addName, setAddName] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addDisplayOrder, setAddDisplayOrder] = useState('0');
  const [addIsActive, setAddIsActive] = useState(true);
  const [addErrorMessage, setAddErrorMessage] = useState<string | null>(null);

  // Form states for Edit Category
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState('0');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch categories
  const {
    data: categoriesRes,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getAdminCategories(),
  });

  const categories: AdminCategory[] =
    categoriesRes && categoriesRes.success && Array.isArray(categoriesRes.data)
      ? categoriesRes.data
      : [];

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && c.isActive) ||
        (statusFilter === 'INACTIVE' && !c.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // Open Edit modal with pre-filled fields
  const handleOpenEdit = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || '');
    setEditDisplayOrder(String(cat.displayOrder ?? 0));
    setEditIsActive(cat.isActive);
    setEditErrorMessage(null);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminCategoryPayload) => createAdminCategory(payload),
    onSuccess: (res) => {
      if (res.success) {
        setIsAddOpen(false);
        setAddName('');
        setAddDescription('');
        setAddDisplayOrder('0');
        setAddIsActive(true);
        setAddErrorMessage(null);
        setFeedback({ type: 'success', message: 'Category created successfully!' });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setAddErrorMessage(res.message || 'Failed to create category.');
      }
    },
    onError: (err: any) => {
      setAddErrorMessage(err?.message || 'An unexpected error occurred while creating category.');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminCategoryPayload }) =>
      updateAdminCategory(id, payload),
    onSuccess: (res) => {
      if (res.success) {
        setEditingCategory(null);
        setEditErrorMessage(null);
        setFeedback({ type: 'success', message: 'Category updated successfully!' });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setEditErrorMessage(res.message || 'Failed to update category.');
      }
    },
    onError: (err: any) => {
      setEditErrorMessage(err?.message || 'An unexpected error occurred while updating category.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: (res, deletedId) => {
      if (res.success) {
        setDeletingCategory(null);
        setFeedback({ type: 'success', message: 'Category deleted successfully!' });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        // Check for 409 CATEGORY_IN_USE conflict
        if (res.code === 'CATEGORY_IN_USE') {
          const cat = deletingCategory || categories.find((c) => c.id === deletedId);
          setDeletingCategory(null);
          if (cat) {
            setCategoryInUseConflict(cat);
          } else {
            setFeedback({ type: 'error', message: res.message || 'Category is currently in use.' });
          }
        } else {
          setDeletingCategory(null);
          setFeedback({ type: 'error', message: res.message || 'Failed to delete category.' });
        }
      }
    },
    onError: (err: any) => {
      setDeletingCategory(null);
      setFeedback({
        type: 'error',
        message: err?.message || 'An error occurred while deleting category.',
      });
    },
  });

  // Deactivate instead mutation (resolution for 409)
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => updateAdminCategory(id, { isActive: false }),
    onSuccess: (res) => {
      if (res.success) {
        setCategoryInUseConflict(null);
        setFeedback({
          type: 'success',
          message: 'Category has been safely deactivated and hidden from menus.',
        });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to deactivate category.',
        });
      }
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrorMessage(null);
    const trimmed = addName.trim();
    if (!trimmed) {
      setAddErrorMessage('Category name is required.');
      return;
    }
    const orderNum = parseInt(addDisplayOrder, 10);

    createMutation.mutate({
      name: trimmed,
      description: addDescription.trim() || null,
      displayOrder: isNaN(orderNum) ? 0 : orderNum,
      isActive: addIsActive,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setEditErrorMessage(null);
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditErrorMessage('Category name is required.');
      return;
    }
    const orderNum = parseInt(editDisplayOrder, 10);

    updateMutation.mutate({
      id: editingCategory.id,
      payload: {
        name: trimmed,
        slug: editSlug.trim() || undefined,
        description: editDescription.trim() || null,
        displayOrder: isNaN(orderNum) ? 0 : orderNum,
        isActive: editIsActive,
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="size-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Category Management
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Organize platform meal catalogs, manage slugs, display order, and category visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="gap-2 font-medium rounded-xl border-border/80"
          >
            <RefreshCw className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setAddErrorMessage(null);
              setIsAddOpen(true);
            }}
            className="gap-1.5 font-semibold rounded-xl"
          >
            <Plus className="size-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl text-sm font-medium border transition-all animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="size-5 shrink-0" />
            ) : (
              <AlertCircle className="size-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Toolbar: Search & Status Filter */}
      <Card className="rounded-2xl border-border/60 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search categories by name, slug, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 rounded-xl text-xs h-10 border-border/80"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(
                [
                  { label: 'All', value: 'ALL' },
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Inactive', value: 'INACTIVE' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === opt.value
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-muted/20 space-y-3">
          <AlertCircle className="size-10 text-destructive mx-auto" />
          <h3 className="text-base font-semibold">Unable to fetch categories</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            An error occurred while loading platform categories. Please retry.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl">
            Retry Request
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredCategories.length === 0 && (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-muted/20 space-y-3">
          <Layers className="size-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No categories found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'No categories match your filter criteria.'
              : 'No categories have been created yet. Click "Add Category" to create the first one.'}
          </p>
        </div>
      )}

      {/* Categories Table */}
      {!isLoading && !isError && filteredCategories.length > 0 && (
        <Card className="rounded-3xl border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-20">Order</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Slug</TableHead>
                  <TableHead className="text-xs">Meal Count</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="text-xs">
                    {/* Order Badge */}
                    <TableCell className="py-3.5 font-bold">
                      <Badge variant="outline" className="font-mono text-xs rounded-lg px-2">
                        #{cat.displayOrder}
                      </Badge>
                    </TableCell>

                    {/* Category Name & Description */}
                    <TableCell className="py-3.5 max-w-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground text-sm block">
                          {cat.name}
                        </span>
                        {cat.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {cat.description}
                          </p>
                        ) : (
                          <span className="text-[11px] italic text-muted-foreground/60">
                            No description
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Slug */}
                    <TableCell className="py-3.5">
                      <code className="text-xs bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md font-mono">
                        {cat.slug}
                      </code>
                    </TableCell>

                    {/* Meal Count */}
                    <TableCell className="py-3.5">
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold gap-1 bg-muted/60 text-foreground"
                      >
                        <Utensils className="size-3 text-muted-foreground" />
                        <span>{cat.mealCount} {cat.mealCount === 1 ? 'meal' : 'meals'}</span>
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5">
                      {cat.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1 py-0.5 px-2">
                          <Eye className="size-3" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground text-xs font-semibold gap-1 py-0.5 px-2">
                          <EyeOff className="size-3" /> Inactive
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-8 px-2.5 rounded-xl gap-1 text-xs font-medium"
                        >
                          <Pencil className="size-3.5" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingCategory(cat)}
                          className="h-8 px-2.5 rounded-xl gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ADD CATEGORY MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Plus className="size-5" />
              </span>
              <DialogTitle className="text-lg font-bold text-foreground">
                Add New Category
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a new category for meals and provider menus.
            </DialogDescription>
          </DialogHeader>

          {addErrorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{addErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name" className="text-xs font-semibold">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-name"
                placeholder="e.g. Desserts, Fast Food, Traditional"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                maxLength={100}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-description" className="text-xs font-semibold">
                Description (optional)
              </Label>
              <textarea
                id="add-description"
                rows={3}
                placeholder="Short description of items in this category..."
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                maxLength={1000}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-order" className="text-xs font-semibold">
                  Display Order
                </Label>
                <Input
                  id="add-order"
                  type="number"
                  min="0"
                  max="1000000"
                  value={addDisplayOrder}
                  onChange={(e) => setAddDisplayOrder(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={addIsActive}
                    onChange={(e) => setAddIsActive(e.target.checked)}
                    className="size-4 rounded-md accent-primary"
                  />
                  <span className="text-xs font-semibold text-foreground">Is Active</span>
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                disabled={createMutation.isPending}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="rounded-xl text-xs font-semibold gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Category</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CATEGORY MODAL */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-lg p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Pencil className="size-5" />
              </span>
              <DialogTitle className="text-lg font-bold text-foreground">
                Edit Category
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify category details, custom slug, or visibility.
            </DialogDescription>
          </DialogHeader>

          {editErrorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{editErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={100}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-slug" className="text-xs font-semibold flex items-center justify-between">
                <span>Slug (URL key)</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Auto-formatted alphanumeric
                </span>
              </Label>
              <Input
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                maxLength={120}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-xs font-semibold">
                Description (optional)
              </Label>
              <textarea
                id="edit-description"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={1000}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-order" className="text-xs font-semibold">
                  Display Order
                </Label>
                <Input
                  id="edit-order"
                  type="number"
                  min="0"
                  max="1000000"
                  value={editDisplayOrder}
                  onChange={(e) => setEditDisplayOrder(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="size-4 rounded-md accent-primary"
                  />
                  <span className="text-xs font-semibold text-foreground">Is Active</span>
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingCategory(null)}
                disabled={updateMutation.isPending}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="rounded-xl text-xs font-semibold gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent className="max-w-md p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Delete Category
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {deletingCategory?.name} ({deletingCategory?.slug})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed py-2">
            Are you sure you want to permanently delete the category{' '}
            <strong className="text-foreground">"{deletingCategory?.name}"</strong>?
            This operation cannot be undone if deleted.
          </p>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingCategory(null)}
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
              className="rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Yes, Delete</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GRACEFUL 409 CATEGORY_IN_USE MODAL */}
      <Dialog
        open={!!categoryInUseConflict}
        onOpenChange={(open) => !open && setCategoryInUseConflict(null)}
      >
        <DialogContent className="max-w-md p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Category Is In Use
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {categoryInUseConflict?.name} ({categoryInUseConflict?.slug})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <p>
              This category cannot be deleted because it is currently assigned to{' '}
              <strong className="text-foreground">
                {categoryInUseConflict?.mealCount ?? 'one or more'} meal(s)
              </strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="size-4 shrink-0" /> Recommended Action:
              </p>
              <p className="text-[11px] leading-normal opacity-90">
                Deactivate this category instead. Deactivating immediately hides the category from
                public discovery and navigation menus without breaking existing meals or order records.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryInUseConflict(null)}
              disabled={deactivateMutation.isPending}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deactivateMutation.isPending}
              onClick={() =>
                categoryInUseConflict && deactivateMutation.mutate(categoryInUseConflict.id)
              }
              className="rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              {deactivateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <EyeOff className="size-3.5" />
                  <span>Deactivate Category Instead</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
