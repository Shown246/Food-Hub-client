'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeals } from './_action';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Store, ShoppingBag, Utensils, AlertCircle } from 'lucide-react';

export interface MealProvider {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  openingHours?: string | null;
  acceptingOrders?: boolean;
}

export interface Meal {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  imageUrl?: string | null;
  dietaryLabels?: string[];
  preparationTimeMinutes?: number;
  isAvailable?: boolean;
  createdAt?: string;
  provider?: MealProvider;
}

const MealCard = ({ meal }: { meal: Meal }) => {
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
          className="gap-2 font-medium rounded-xl shadow-xs"
          disabled={meal.isAvailable === false}
        >
          <ShoppingBag className="size-4" />
          <span>Add to Order</span>
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
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['meals'],
    queryFn: getMeals,
  });

  const mealsList: Meal[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.data?.data)
    ? data.data.data
    : [];

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
            There are currently no meals available. Please check back later.
          </p>
        </div>
      )}

      {/* Meals Grid */}
      {!isLoading && !isError && mealsList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mealsList.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Meals;