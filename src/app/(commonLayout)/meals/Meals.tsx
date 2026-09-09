'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeals } from './_action';
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
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Meal } from '@/types/meal.type';
import { currentUserQueryOptions } from '@/queries/current-user.query';
import { useCart } from '@/context/cart-context';
import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';


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
          {/* Prep Time */}
          {meal.preparationTimeMinutes ? (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2.5 py-1"
            >
              <Clock className="size-3.5 text-primary" />
              <span>{meal.preparationTimeMinutes} min</span>
            </Badge>
          ) : (
            <div />
          )}

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
            "gap-2 font-medium rounded-xl shadow-xs transition-all",
            cartQuantity && cartQuantity > 0
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          disabled={meal.isAvailable === false}
        >
          <ShoppingBag className="size-4" />
          <span>{cartQuantity && cartQuantity > 0 ? `In Order (${cartQuantity})` : 'Add to Order'}</span>
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
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || searchParams.get('categorySlug') || undefined;
  const provider = searchParams.get('provider') || searchParams.get('providerId') || undefined;

  const { data: currentUserData } = useQuery(currentUserQueryOptions);
  const isLoggedIn = !!currentUserData?.user;
  const userRole = currentUserData?.user?.role;
  const isProvider = userRole === 'PROVIDER';
  const { items, openCustomizationModal } = useCart();
  const [showProviderRestrictionModal, setShowProviderRestrictionModal] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['meals', { category, provider }],
    queryFn: () => getMeals({ category, provider }),
  });

  const rawData = data as any;
  const mealsList: Meal[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.data)
    ? rawData.data.data
    : [];

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore Meals
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Discover freshly prepared delicious dishes from top local bakeries and restaurants.
          </p>
        </div>
        {!isLoading && !isError && (
          <Badge variant="secondary" className="w-fit text-xs font-semibold px-3 py-1.5 rounded-full">
            {mealsList.length} {mealsList.length === 1 ? 'Meal Available' : 'Meals Available'}
          </Badge>
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
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-4">
          <AlertCircle className="size-12 text-destructive" />
          <h3 className="text-lg font-semibold">Failed to load meals</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Something went wrong while fetching the available meals. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && mealsList.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-3">
          <Utensils className="size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No meals found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {provider
              ? 'There are currently no meals available for this provider. Please check back later.'
              : category
              ? 'There are currently no meals available in this category. Please check back later.'
              : 'There are currently no meals available. Please check back later.'}
          </p>
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
                As a registered food provider on FoodHub, your account is configured to manage and prepare meals, not to place customer orders.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground text-left space-y-1.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ChefHat className="size-3.5 text-primary" />
                <span>Want to order meals?</span>
              </p>
              <p>
                To order delicious meals from providers on FoodHub, please sign in with or create a dedicated <strong>Customer</strong> account.
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
                  "w-full sm:flex-1 rounded-xl h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1.5 shadow-sm"
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