'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMeals } from './_action';
import { getCategories } from '@/components/_category.action';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  Store,
  ShoppingBag,
  Utensils,
  AlertCircle,
  ShieldAlert,
  ChefHat,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Star,
  Check,
  Tag,
  Filter,
} from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Category, Meal } from '@/types/meal.type';
import { currentUserQueryOptions } from '@/queries/current-user.query';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Category icon/emoji mapping
const CATEGORY_ICONS: Record<string, string> = {
  bangladeshi: '🍲',
  indian: '🍛',
  chinese: '🥢',
  pizza: '🍕',
  burgers: '🍔',
  breakfast: '🍳',
  desserts: '🍰',
  beverages: '🥤',
};

// Dietary tags options
const DIETARY_OPTIONS = [
  { value: 'halal', label: 'Halal', icon: '🌙' },
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { value: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
  { value: 'spicy', label: 'Spicy', icon: '🌶️' },
];

// Price preset ranges
const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ৳150', min: '', max: '150' },
  { label: '৳150 - ৳350', min: '150', max: '350' },
  { label: 'Over ৳350', min: '350', max: '' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Added' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Top Rated' },
];

// Limit per page options
const LIMIT_OPTIONS = [
  { value: '8', label: '8 per page' },
  { value: '12', label: '12 per page' },
  { value: '24', label: '24 per page' },
];

const MealCard = ({
  meal,
  onAddToOrder,
  cartQuantity,
}: {
  meal: Meal;
  onAddToOrder: (meal: Meal) => void;
  cartQuantity?: number;
}) => {
  const formattedPrice =
    typeof meal.price === 'number'
      ? meal.price.toFixed(2)
      : parseFloat(meal.price || '0').toFixed(2);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/60 bg-card rounded-2xl">
      {/* Top Banner / Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 flex items-center justify-center">
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-primary/40 group-hover:scale-110 transition-transform duration-500">
            <Utensils className="size-14 stroke-[1.5]" />
            <span className="text-xs font-medium mt-1 text-muted-foreground/60">
              {meal.name}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Prep Time or Rating */}
          <div className="flex items-center gap-1.5">
            {meal.preparationTimeMinutes ? (
              <Badge
                variant="secondary"
                className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2.5 py-1"
              >
                <Clock className="size-3.5 text-primary" />
                <span>{meal.preparationTimeMinutes} min</span>
              </Badge>
            ) : null}

            {meal.rating?.average ? (
              <Badge
                variant="secondary"
                className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2 py-1"
              >
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{meal.rating.average.toFixed(1)}</span>
              </Badge>
            ) : null}
          </div>

          {/* Availability */}
          <Badge
            variant={meal.isAvailable !== false ? 'success' : 'destructive'}
            className="bg-background/90 backdrop-blur-md shadow-xs text-xs px-2.5 py-1"
          >
            <span
              className={`size-1.5 rounded-full mr-1.5 ${
                meal.isAvailable !== false ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {meal.isAvailable !== false ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Provider Info & Dietary Badges */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {meal.provider?.name && (
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium truncate">
              <Store className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{meal.provider.name}</span>
            </div>
          )}

          {meal.dietaryLabels && meal.dietaryLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 shrink-0">
              {meal.dietaryLabels.slice(0, 2).map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="capitalize text-[10px] py-0 px-2 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Meal Name */}
        <h3 className="font-semibold text-lg text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {meal.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {meal.description || 'No description available for this delicious meal.'}
        </p>
      </div>

      {/* Card Footer: Price & Action */}
      <CardFooter className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-border/40 mt-auto">
        <div>
          <span className="text-xs text-muted-foreground block font-medium">Price</span>
          <span className="text-xl font-bold text-primary">৳{formattedPrice}</span>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={() => onAddToOrder(meal)}
          className={cn(
            'gap-2 font-medium rounded-xl shadow-xs transition-all',
            cartQuantity && cartQuantity > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          )}
          disabled={meal.isAvailable === false}
        >
          <ShoppingBag className="size-4" />
          <span>
            {cartQuantity && cartQuantity > 0 ? `In Order (${cartQuantity})` : 'Add to Order'}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Skeleton loader card
const MealCardSkeleton = () => (
  <div className="flex flex-col gap-4 p-4 border border-border/60 rounded-2xl bg-card">
    <Skeleton className="h-48 w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
  </div>
);

const Meals = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read current filters from URL
  const selectedCategory = searchParams.get('category') || searchParams.get('categorySlug') || '';
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const selectedProvider = searchParams.get('provider') || searchParams.get('providerId') || '';
  const selectedDietary = searchParams.get('dietary') || '';
  const selectedMinPrice = searchParams.get('minPrice') || '';
  const selectedMaxPrice = searchParams.get('maxPrice') || '';
  const selectedSort = searchParams.get('sort') || 'newest';
  const selectedPage = searchParams.get('page') || '1';
  const selectedLimit = searchParams.get('limit') || '12';
  const selectedSearch = searchParams.get('search') || '';

  // Local inputs for custom price and search
  const [minPriceInput, setMinPriceInput] = useState(selectedMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(selectedMaxPrice);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(selectedSearch);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Synchronize local states if URL changes externally
  useEffect(() => {
    setMinPriceInput(selectedMinPrice);
    setMaxPriceInput(selectedMaxPrice);
    setPriceError(null);
  }, [selectedMinPrice, selectedMaxPrice]);

  useEffect(() => {
    setSearchInput(selectedSearch);
  }, [selectedSearch]);

  const { data: currentUserData } = useQuery(currentUserQueryOptions);
  const isLoggedIn = !!currentUserData?.user;
  const userRole = currentUserData?.user?.role;
  const isProvider = userRole === 'PROVIDER';
  const { items, openCustomizationModal } = useCart();
  const [showProviderRestrictionModal, setShowProviderRestrictionModal] = useState(false);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categoriesList: Category[] = useMemo(() => {
    if (!categoriesData?.success) return [];
    return Array.isArray(categoriesData.data) ? categoriesData.data : [];
  }, [categoriesData]);

  // Query parameters object for React Query
  const queryParams = useMemo(
    () => ({
      category: selectedCategory || undefined,
      categoryId: selectedCategoryId || undefined,
      provider: selectedProvider || undefined,
      dietary: selectedDietary || undefined,
      minPrice: selectedMinPrice || undefined,
      maxPrice: selectedMaxPrice || undefined,
      sort: selectedSort,
      page: selectedPage,
      limit: selectedLimit,
      search: selectedSearch || undefined,
    }),
    [
      selectedCategory,
      selectedCategoryId,
      selectedProvider,
      selectedDietary,
      selectedMinPrice,
      selectedMaxPrice,
      selectedSort,
      selectedPage,
      selectedLimit,
      selectedSearch,
    ]
  );

  // Fetch meals with tanstack query
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['meals', queryParams],
    queryFn: () => getMeals(queryParams),
  });

  const rawData = data as any;
  const mealsList: Meal[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data?.data)
    ? rawData.data.data
    : [];

  const meta = rawData?.meta || rawData?.data?.meta;
  const totalItems: number = meta?.totalItems ?? mealsList.length;
  const totalPages: number = meta?.totalPages ?? (totalItems > 0 ? 1 : 0);
  const currentPage: number = meta?.page ? Number(meta.page) : parseInt(selectedPage, 10) || 1;
  const currentLimit: number = meta?.limit ? Number(meta.limit) : parseInt(selectedLimit, 10) || 12;

  // Handle URL updates
  const updateFilters = (
    newParams: Record<string, string | number | undefined | null>,
    resetPage = true
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Merge new parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset to page 1 if changing a filter
    if (resetPage) {
      params.delete('page');
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  // Switch category
  const handleSelectCategory = (slug: string) => {
    if (selectedCategory === slug) {
      updateFilters({ category: '', categorySlug: '', categoryId: '' });
    } else {
      updateFilters({ category: slug, categorySlug: '', categoryId: '' });
    }
  };

  // Toggle dietary tag
  const handleToggleDietary = (dietaryVal: string) => {
    if (selectedDietary.toLowerCase() === dietaryVal.toLowerCase()) {
      updateFilters({ dietary: '' });
    } else {
      updateFilters({ dietary: dietaryVal.toLowerCase() });
    }
  };

  // Apply custom price range
  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const minNum = minPriceInput ? parseFloat(minPriceInput) : null;
    const maxNum = maxPriceInput ? parseFloat(maxPriceInput) : null;

    if (minNum !== null && minNum < 0) {
      setPriceError('Minimum price cannot be negative.');
      return;
    }
    if (maxNum !== null && maxNum < 0) {
      setPriceError('Maximum price cannot be negative.');
      return;
    }
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setPriceError('Min price cannot exceed max price.');
      return;
    }

    setPriceError(null);
    updateFilters({
      minPrice: minPriceInput.trim(),
      maxPrice: maxPriceInput.trim(),
    });
  };

  // Apply price preset
  const handleSelectPricePreset = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    setPriceError(null);
    updateFilters({ minPrice: min, maxPrice: max });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchInput('');
    setPriceError(null);

    const params = new URLSearchParams();
    if (selectedProvider) {
      params.set('provider', selectedProvider);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ search: '' });
  };

  // Page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || (totalPages && newPage > totalPages)) return;
    updateFilters({ page: newPage > 1 ? newPage.toString() : '' }, false);

    const topElem = document.getElementById('meals-list-top');
    if (topElem) {
      topElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate active filter count
  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedDietary ||
      selectedMinPrice ||
      selectedMaxPrice ||
      selectedSearch ||
      selectedSort !== 'newest'
  );

  // If user was redirected to login and returned, automatically open customization for their pending meal
  useEffect(() => {
    if (isLoggedIn) {
      try {
        const pending = sessionStorage.getItem('foodhub_pending_meal');
        if (pending) {
          if (isProvider) {
            sessionStorage.removeItem('foodhub_pending_meal');
            setShowProviderRestrictionModal(true);
            return;
          }
          const pendingMeal = JSON.parse(pending) as Meal;
          sessionStorage.removeItem('foodhub_pending_meal');
          openCustomizationModal(pendingMeal);
        }
      } catch (e) {
        sessionStorage.removeItem('foodhub_pending_meal');
      }
    }
  }, [isLoggedIn, isProvider, openCustomizationModal]);

  const handleAddToOrder = (meal: Meal) => {
    if (!isLoggedIn) {
      try {
        sessionStorage.setItem('foodhub_pending_meal', JSON.stringify(meal));
      } catch {}
      router.push('/login?callbackUrl=/meals');
      return;
    }

    if (isProvider) {
      setShowProviderRestrictionModal(true);
      return;
    }

    openCustomizationModal(meal);
  };

  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.meal.id, item.quantity);
    }
    return map;
  }, [items]);

  // Generate pagination pages
  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  const activeCategoryObject = useMemo(() => {
    return categoriesList.find(
      (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c.id === selectedCategoryId
    );
  }, [categoriesList, selectedCategory, selectedCategoryId]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Anchor for smooth scroll on pagination */}
      <div id="meals-list-top" className="scroll-mt-24" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Utensils className="size-6 stroke-[2.2]" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Explore Meals
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Discover culinary masterpieces, freshly prepared daily by top verified local bakeries,
            restaurants, and kitchen artisans.
          </p>
        </div>

        {/* Quick Search & Controls on Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search dishes or cuisines..."
              className="w-full bg-card border border-border/70 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                title="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          {/* Mobile Filters Toggle Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="md:hidden gap-2 rounded-2xl border-border/80 h-10 font-medium"
          >
            <SlidersHorizontal className="size-4 text-primary" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="size-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>
        </div>
      </div>

      {/* FILTER CONTROL SECTION */}
      <div className="space-y-5 bg-card/50 backdrop-blur-xs p-4 sm:p-6 rounded-3xl border border-border/60 shadow-xs">
        {/* 1) CATEGORY SELECTOR (PILL SELECTOR + DROPDOWN) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            {/* Category Dropdown for quick jump / compact screens */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Categories:</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="bg-background border border-border/80 text-foreground text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {CATEGORY_ICONS[cat.slug.toLowerCase()] ? `${CATEGORY_ICONS[cat.slug.toLowerCase()]} ` : ''}
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Dietary Label Filter Pills */}
          <div className="md:col-span-5 flex items-center justify-end gap-3">
            <div className="flex items-center gap-1.5">
              <Tag className="size-3.5 text-primary" />
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dietary Preferences
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {DIETARY_OPTIONS.map((item) => {
                const isActive = selectedDietary.toLowerCase() === item.value.toLowerCase();
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleToggleDietary(item.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all border font-medium',
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/30 font-semibold'
                        : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive && <Check className="size-3 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* 2 & 3 & 4) SECONDARY FILTERS ROW: Dietary Labels, Price Range, Sort */}
        <div
        className='flex justify-between items-center'
        >
          <div className='flex justify-center items-center gap-8'>
          {/* Price Range Filter */}
            <div>
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-primary" />
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price Range (৳)
                </label>
              </div>
              {(selectedMinPrice || selectedMaxPrice) && (
                <button
                  type="button"
                  onClick={() => handleSelectPricePreset('', '')}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline"
                >
                  Reset Price
                </button>
              )}
            </div>

            {/* Custom Min-Max Inputs */}
            <form onSubmit={handleApplyPrice} className="flex items-center gap-1.5 pt-0.5">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => {
                    setMinPriceInput(e.target.value);
                    setPriceError(null);
                  }}
                  className="w-full bg-background border border-border/80 rounded-xl pl-6 pr-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <span className="text-muted-foreground text-xs font-semibold">-</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => {
                    setMaxPriceInput(e.target.value);
                    setPriceError(null);
                  }}
                  className="w-full bg-background border border-border/80 rounded-xl pl-6 pr-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                className="h-7 px-3 text-xs rounded-xl font-medium"
              >
                Apply
              </Button>
            </form>
            </div>

            <div className='pt-4.5'>
              {/* Quick Price Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {PRICE_PRESETS.map((preset) => {
                const isActive =
                  selectedMinPrice === preset.min && selectedMaxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPricePreset(preset.min, preset.max)}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all border',
                      isActive
                        ? 'bg-primary/10 text-primary border-primary/30 font-semibold shadow-xs'
                        : 'bg-background hover:bg-muted text-muted-foreground border-border/80'
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            {priceError && (
              <p className="text-[11px] text-destructive font-medium">{priceError}</p>
            )}
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-primary" />
              <label className="w-22 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sort Meals
              </label>
            </div>
            <select
              value={selectedSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full bg-background border border-border/80 text-foreground text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-primary font-medium shadow-xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER TAGS STRIP */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/40 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              Active filters:
            </span>

            {/* Category Tag */}
            {activeCategoryObject && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-1 px-2.5 rounded-xl font-medium"
              >
                <span>
                  {CATEGORY_ICONS[activeCategoryObject.slug.toLowerCase()] || ''}{' '}
                  {activeCategoryObject.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ category: '', categorySlug: '', categoryId: '' })
                  }
                  className="hover:text-destructive"
                  title="Remove category filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {/* Dietary Tag */}
            {selectedDietary && (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 py-1 px-2.5 rounded-xl capitalize font-medium"
              >
                <span>Diet: {selectedDietary}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ dietary: '' })}
                  className="hover:text-destructive"
                  title="Remove dietary filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {/* Price Tag */}
            {(selectedMinPrice || selectedMaxPrice) && (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1.5 py-1 px-2.5 rounded-xl font-medium"
              >
                <span>
                  Price:{' '}
                  {selectedMinPrice && selectedMaxPrice
                    ? `৳${selectedMinPrice} - ৳${selectedMaxPrice}`
                    : selectedMinPrice
                    ? `Over ৳${selectedMinPrice}`
                    : `Under ৳${selectedMaxPrice}`}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectPricePreset('', '')}
                  className="hover:text-destructive"
                  title="Remove price filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {/* Search Tag */}
            {selectedSearch && (
              <Badge
                variant="secondary"
                className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 gap-1.5 py-1 px-2.5 rounded-xl font-medium"
              >
                <span>&quot;{selectedSearch}&quot;</span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-destructive"
                  title="Remove search filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {/* Clear all button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1 rounded-lg"
            >
              <RotateCcw className="size-3" />
              <span>Reset All</span>
            </Button>
          </div>
        )}
      </div>

      {/* RESULTS COUNT & META BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {!isLoading && !isError && (
            <span className="font-medium text-foreground">
              {totalItems > 0 ? (
                <>
                  Showing{' '}
                  <span className="font-bold text-primary">
                    {(currentPage - 1) * currentLimit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-primary">
                    {Math.min(currentPage * currentLimit, totalItems)}
                  </span>{' '}
                  of <span className="font-bold text-primary">{totalItems}</span> meals
                </>
              ) : (
                '0 meals found'
              )}
            </span>
          )}
          {isFetching && !isLoading && (
            <span className="text-xs text-primary animate-pulse font-medium">Updating...</span>
          )}
        </div>

        {/* Per-page limit selector */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs">Show:</span>
            <select
              value={selectedLimit}
              onChange={(e) => updateFilters({ limit: e.target.value })}
              className="bg-background border border-border/80 text-foreground text-xs rounded-xl px-2.5 py-1 focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <MealCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-3xl bg-muted/20 my-8 space-y-4">
          <AlertCircle className="size-12 text-destructive" />
          <h3 className="text-lg font-semibold">Failed to load meals</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Something went wrong while fetching the available meals. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl gap-2">
            <RotateCcw className="size-4" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && mealsList.length === 0 && (
        <div className="flex flex-col items-center justify-center p-14 text-center border border-dashed rounded-3xl bg-muted/20 my-8 space-y-4">
          <div className="size-16 rounded-full bg-muted/50 grid place-items-center text-muted-foreground/60">
            <Utensils className="size-8 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">No meals found</h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            {hasActiveFilters
              ? 'No meals match your active filters. Try loosening your search criteria, dietary labels, or price range.'
              : selectedProvider
              ? 'There are currently no meals available for this provider. Please check back later.'
              : 'There are currently no meals available. Please check back later.'}
          </p>
          {hasActiveFilters && (
            <Button
              onClick={handleClearAllFilters}
              variant="outline"
              className="rounded-xl gap-2 mt-2"
            >
              <RotateCcw className="size-4" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>
      )}

      {/* Meals Grid */}
      {!isLoading && !isError && mealsList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mealsList.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onAddToOrder={handleAddToOrder}
              cartQuantity={cartItemMap.get(meal.id)}
            />
          ))}
        </div>
      )}

      {/* 5) PAGINATION CONTROLS */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {/* Previous Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || (meta && !meta.hasPreviousPage)}
              className="gap-1 rounded-xl text-xs h-9 px-3 border-border/80 hover:bg-muted font-medium"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Numeric Page Buttons */}
            {paginationRange.map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-xs text-muted-foreground select-none"
                  >
                    …
                  </span>
                );
              }
              const pageNum = Number(p);
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    'size-9 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center',
                    isCurrent
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || (meta && !meta.hasNextPage)}
              className="gap-1 rounded-xl text-xs h-9 px-3 border-border/80 hover:bg-muted font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Provider Order Restriction Pop-up Modal */}
      <Dialog
        open={showProviderRestrictionModal}
        onOpenChange={setShowProviderRestrictionModal}
      >
        <DialogContent className="max-w-md p-6 sm:p-7 rounded-3xl border-border/80 bg-card shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="grid size-16 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
              <ShieldAlert className="size-8 stroke-[1.75]" />
            </div>

            <DialogHeader className="space-y-2 text-center sm:text-center">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Providers Cannot Order Meals
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                As a registered food provider on FoodHub, your account is configured to manage and
                prepare meals, not to place customer orders.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground text-left space-y-1.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ChefHat className="size-3.5 text-primary" />
                <span>Want to order meals?</span>
              </p>
              <p>
                To order delicious meals from providers on FoodHub, please sign in with or create a
                dedicated <strong>Customer</strong> account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowProviderRestrictionModal(false)}
                className="w-full sm:flex-1 rounded-xl h-11 border-border/80 hover:bg-muted font-medium"
              >
                Understood
              </Button>
              <Link
                href="/console/provider"
                className={cn(
                  buttonVariants(),
                  'w-full sm:flex-1 rounded-xl h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1.5 shadow-sm'
                )}
              >
                <span>Provider Portal</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Meals;