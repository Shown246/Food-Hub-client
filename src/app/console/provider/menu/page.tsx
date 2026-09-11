'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Category, ProviderMeal } from '@/types/meal.type';
import {
  getProviderMeals,
  restoreProviderMeal,
  updateMealAvailability,
} from '../_actions';
import { getCategories } from '@/components/_category.action';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateMealDialog } from './create-meal-dialog';
import { EditMealDialog } from './edit-meal-dialog';
import { DeleteMealDialog } from './delete-meal-dialog';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  Utensils,
  UtensilsCrossed,
  X,
} from 'lucide-react';

type AvailabilityFilter = 'all' | 'available' | 'unavailable' | 'archived';

const FILTER_OPTIONS: { label: string; value: AvailabilityFilter }[] = [
  { label: 'All Meals', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Unavailable', value: 'unavailable' },
  { label: 'Archived', value: 'archived' },
];

const formatPrice = (price: string | number) =>
  typeof price === 'number' ? price.toFixed(2) : parseFloat(price || '0').toFixed(2);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const extractMeals = (data: unknown): ProviderMeal[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { meals?: ProviderMeal[] }).meals)) {
    return (data as { meals: ProviderMeal[] }).meals;
  }
  return [];
};

const MenuPage = () => {
  const queryClient = useQueryClient();

  // Filters & Search
  const [selectedFilter, setSelectedFilter] = useState<AvailabilityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ProviderMeal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<ProviderMeal | null>(null);

  // Action loading states
  const [togglingMealId, setTogglingMealId] = useState<string | null>(null);
  const [restoringMealId, setRestoringMealId] = useState<string | null>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch meals
  const { data: mealsResponse, isLoading, error, isError, refetch, isRefetching } = useQuery({
    queryKey: ['provider-meals'],
    queryFn: () => getProviderMeals(),
  });

  // Fetch categories for filtering
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const categories: Category[] = categoriesResponse?.success && Array.isArray(categoriesResponse.data)
    ? categoriesResponse.data
    : [];

  const mealsList = mealsResponse?.success ? extractMeals(mealsResponse.data) : [];

  const stats = useMemo(() => {
    const available = mealsList.filter((meal) => meal.isAvailable && !meal.isArchived).length;
    const unavailable = mealsList.filter((meal) => !meal.isAvailable && !meal.isArchived).length;
    const archived = mealsList.filter((meal) => meal.isArchived).length;
    return { total: mealsList.length, available, unavailable, archived };
  }, [mealsList]);

  const filteredMeals = useMemo(() => {
    return mealsList.filter((meal) => {
      // Availability filter
      if (selectedFilter === 'available' && (!meal.isAvailable || meal.isArchived)) return false;
      if (selectedFilter === 'unavailable' && (meal.isAvailable || meal.isArchived)) return false;
      if (selectedFilter === 'archived' && !meal.isArchived) return false;

      // Category filter
      if (selectedCategoryId && meal.category?.id !== selectedCategoryId) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = meal.name.toLowerCase().includes(query);
        const matchesDesc = meal.description?.toLowerCase().includes(query);
        const matchesCategory = meal.category?.name?.toLowerCase().includes(query);
        const matchesDietary = meal.dietaryLabels?.some((l) => l.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesDietary) {
          return false;
        }
      }

      return true;
    });
  }, [mealsList, selectedFilter, selectedCategoryId, searchQuery]);

  const handleToggleAvailability = async (meal: ProviderMeal) => {
    if (meal.isArchived) return;
    setTogglingMealId(meal.id);
    setFeedback(null);
    try {
      const nextAvailability = !meal.isAvailable;
      const res = await updateMealAvailability(meal.id, nextAvailability);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['provider-meals'] });
        setFeedback({
          type: 'success',
          message: `"${meal.name}" is now marked as ${nextAvailability ? 'available' : 'unavailable'}.`,
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update meal availability.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Error updating availability.',
      });
    } finally {
      setTogglingMealId(null);
    }
  };

  const handleRestoreMeal = async (meal: ProviderMeal) => {
    setRestoringMealId(meal.id);
    setFeedback(null);
    try {
      const res = await restoreProviderMeal(meal.id);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['provider-meals'] });
        setFeedback({
          type: 'success',
          message: `"${meal.name}" has been restored. Toggle its availability when you are ready to accept orders.`,
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to restore meal.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Error restoring meal.',
      });
    } finally {
      setRestoringMealId(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const apiErrorMessage =
    mealsResponse && !mealsResponse.success ? mealsResponse.message : undefined;
  const showError = isError || Boolean(apiErrorMessage);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Menu Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Create, update meals, set availability, and manage your kitchen menu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 font-medium rounded-xl border-border/80"
          >
            <RefreshCw className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-95"
          >
            <Plus className="size-4" />
            <span>Add Meal</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl text-sm font-medium border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="size-5 shrink-0" />
            ) : (
              <AlertCircle className="size-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {!isLoading && !showError && mealsList.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div
            onClick={() => setSelectedFilter('all')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
              selectedFilter === 'all'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border/60 bg-card hover:border-border'
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground">Total meals</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{stats.total}</p>
          </div>
          <div
            onClick={() => setSelectedFilter('available')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
              selectedFilter === 'available'
                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                : 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
            }`}
          >
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Available</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{stats.available}</p>
          </div>
          <div
            onClick={() => setSelectedFilter('unavailable')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
              selectedFilter === 'unavailable'
                ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                : 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
            }`}
          >
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Unavailable</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{stats.unavailable}</p>
          </div>
          <div
            onClick={() => setSelectedFilter('archived')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
              selectedFilter === 'archived'
                ? 'border-foreground/40 bg-muted/60 ring-2 ring-muted'
                : 'border-border/60 bg-muted/30 hover:border-border'
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground">Archived</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{stats.archived}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
        {/* Availability Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = selectedFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedFilter(opt.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Search and Category Controls */}
        <div className="flex items-center gap-2.5">
          {/* Category Dropdown */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="h-9 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors max-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs rounded-xl border-border/70 focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {showError && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-4">
          <AlertCircle className="size-12 text-destructive" />
          <h3 className="text-lg font-semibold">Failed to load meals</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {apiErrorMessage || error?.message || 'Something went wrong while fetching your menu. Please try again.'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State - No meals added at all */}
      {!isLoading && !showError && mealsList.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <UtensilsCrossed className="size-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">No meals on your menu yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Start building your menu by adding your delicious offerings for customers.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-5"
          >
            <Plus className="size-4" />
            <span>Create Your First Meal</span>
          </Button>
        </div>
      )}

      {/* Empty State - No meals matching filter/search */}
      {!isLoading && !showError && mealsList.length > 0 && filteredMeals.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-3">
          <Utensils className="size-14 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">No meals match your criteria</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Try adjusting your search terms, category, or availability filter.
          </p>
          {(searchQuery || selectedCategoryId || selectedFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
                setSelectedCategoryId('');
              }}
              className="rounded-xl mt-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* Meals Grid */}
      {!isLoading && !showError && filteredMeals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMeals.map((meal: ProviderMeal) => {
            const isToggling = togglingMealId === meal.id;
            const isRestoring = restoringMealId === meal.id;

            return (
              <Card
                key={meal.id}
                className={`group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border border bg-card rounded-2xl shadow-xs ${
                  meal.isArchived ? 'opacity-80 border-dashed border-border/80' : 'border-border/60'
                }`}
              >
                {/* Meal Image / Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 flex items-center justify-center">
                  {meal.imageUrl ? (
                    <Image
                      src={meal.imageUrl}
                      alt={meal.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-primary/40">
                      <Utensils className="size-12 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
                    {meal.preparationTimeMinutes ? (
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2.5 py-1"
                      >
                        <Clock className="size-3.5 text-primary" />
                        <span>{meal.preparationTimeMinutes} min</span>
                      </Badge>
                    ) : <div />}

                    <div className="flex flex-col items-end gap-1.5">
                      {meal.isArchived ? (
                        <Badge
                          variant="secondary"
                          className="bg-background/90 backdrop-blur-md shadow-xs text-xs px-2.5 py-1 gap-1 text-muted-foreground border-border/80"
                        >
                          <Archive className="size-3" />
                          Archived
                        </Badge>
                      ) : (
                        <Badge
                          variant={meal.isAvailable ? 'success' : 'destructive'}
                          className="bg-background/90 backdrop-blur-md shadow-xs text-xs px-2.5 py-1"
                        >
                          <span
                            className={`size-1.5 rounded-full mr-1.5 ${
                              meal.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {meal.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    {meal.category?.name ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium truncate">
                        <Tag className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{meal.category.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}

                    {meal.dietaryLabels && meal.dietaryLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1 shrink-0 justify-end">
                        {meal.dietaryLabels.slice(0, 2).map((label) => (
                          <Badge
                            key={label}
                            variant="outline"
                            className="capitalize text-[10px] py-0 px-2 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          >
                            {label}
                          </Badge>
                        ))}
                        {meal.dietaryLabels.length > 2 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{meal.dietaryLabels.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <h2 className="font-semibold text-lg text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {meal.name}
                  </h2>

                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {meal.description || 'No description provided for this meal.'}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-medium mt-auto">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      Added {formatDate(meal.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Price & Management Actions */}
                <CardFooter className="p-4 pt-3 flex items-center justify-between gap-2 border-t border-border/40 bg-muted/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-semibold">
                      Price
                    </span>
                    <span className="text-lg font-bold text-primary">
                      ৳{formatPrice(meal.price)}
                    </span>
                  </div>

                  {/* Actions Group */}
                  <div className="flex items-center gap-1.5">
                    {/* Availability Toggle Button */}
                    {!meal.isArchived ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={meal.isAvailable ? 'outline' : 'secondary'}
                        onClick={() => handleToggleAvailability(meal)}
                        disabled={isToggling}
                        title={meal.isAvailable ? 'Click to make unavailable' : 'Click to make available'}
                        className={`h-8 px-2.5 text-xs font-semibold rounded-xl gap-1.5 transition-colors ${
                          meal.isAvailable
                            ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Power className="size-3.5" />
                        )}
                        <span>{meal.isAvailable ? 'Active' : 'Paused'}</span>
                      </Button>
                    ) : (
                      /* Restore Button for Archived meals */
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreMeal(meal)}
                        disabled={isRestoring}
                        className="h-8 px-2.5 text-xs font-semibold rounded-xl gap-1.5 border-border/80 text-foreground hover:bg-background"
                      >
                        {isRestoring ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5 text-primary" />
                        )}
                        <span>Restore</span>
                      </Button>
                    )}

                    {/* Edit Button */}
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setEditingMeal(meal)}
                      title="Edit meal information"
                      className="size-8 rounded-xl border-border/80 hover:bg-background hover:text-primary transition-colors"
                    >
                      <Edit className="size-3.5" />
                    </Button>

                    {/* Delete / Archive Button */}
                    {!meal.isArchived && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setDeletingMeal(meal)}
                        title="Delete (archive) meal"
                        className="size-8 rounded-xl border-border/80 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Meal Modal */}
      <CreateMealDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={(msg) => showNotification(msg, 'success')}
      />

      {/* Edit Meal Modal */}
      <EditMealDialog
        meal={editingMeal}
        open={Boolean(editingMeal)}
        onOpenChange={(open) => {
          if (!open) setEditingMeal(null);
        }}
        onSuccess={(msg) => showNotification(msg, 'success')}
      />

      {/* Delete Meal Modal */}
      <DeleteMealDialog
        meal={deletingMeal}
        open={Boolean(deletingMeal)}
        onOpenChange={(open) => {
          if (!open) setDeletingMeal(null);
        }}
        onSuccess={(msg) => showNotification(msg, 'success')}
      />
    </div>
  );
};

export default MenuPage;
