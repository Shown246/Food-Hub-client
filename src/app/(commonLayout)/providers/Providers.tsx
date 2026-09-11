'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getProviders } from './_action';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, MapPin, Phone, Clock, Utensils, AlertCircle, ArrowRight } from 'lucide-react';
import { MealProvider } from '@/types/meal.type';
import { cn } from '@/lib/utils';

const ProviderCard = ({ provider }: { provider: MealProvider }) => {
  const isAccepting = provider.acceptingOrders !== false;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/60 bg-card rounded-2xl">
      {/* Top Banner / Logo Section */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 flex items-center justify-center p-6">
        {provider.logoUrl ? (
          <Image
            src={provider.logoUrl}
            alt={provider.name}
            width={96}
            height={96}
            sizes="96px"
            className="h-24 w-24 rounded-full object-cover border-4 border-background shadow-md transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 rounded-full bg-background/80 border-2 border-primary/20 text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
            <Store className="size-10 stroke-[1.5]" />
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Active Meal Count */}
          {typeof provider.activeMealCount === 'number' ? (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2.5 py-1"
            >
              <Utensils className="size-3.5 text-primary" />
              <span>{provider.activeMealCount} {provider.activeMealCount === 1 ? 'Meal' : 'Meals'}</span>
            </Badge>
          ) : (
            <div />
          )}

          {/* Order Status */}
          <Badge
            variant={isAccepting ? 'success' : 'destructive'}
            className="bg-background/90 backdrop-blur-md shadow-xs text-xs px-2.5 py-1"
          >
            <span
              className={`size-1.5 rounded-full mr-1.5 ${
                isAccepting ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {isAccepting ? 'Accepting Orders' : 'Closed'}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Provider Name */}
        <h3 className="font-semibold text-xl text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {provider.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {provider.description || 'Dedicated food provider offering fresh and hygienic meals.'}
        </p>

        {/* Provider Meta Info */}
        <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          {provider.address && (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{provider.address}</span>
            </div>
          )}

          {provider.phone && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{provider.phone}</span>
            </div>
          )}

          {provider.openingHours && (
            <div className="flex items-center gap-2 truncate">
              <Clock className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{provider.openingHours}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Action */}
      <CardFooter className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-border/40 mt-auto">
        <Link
          href={`/meals?provider=${provider.id}`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "w-full gap-2 font-medium rounded-xl shadow-xs group-hover:bg-primary/90 flex items-center justify-center"
          )}
        >
          <span>View Menu</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};

// Skeleton loader card
const ProviderCardSkeleton = () => (
  <div className="flex flex-col gap-4 p-4 border border-border/60 rounded-2xl bg-card">
    <Skeleton className="h-44 w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="space-y-2 pt-2 border-t border-border/40">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <div className="pt-2">
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  </div>
);

const Providers = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  const rawData = data as any;
  const providersList: MealProvider[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.data)
    ? rawData.data.data
    : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Food Providers
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Discover top-rated local kitchens, restaurants, and caterers serving high-quality meals.
          </p>
        </div>
        {!isLoading && !isError && (
          <Badge variant="secondary" className="w-fit text-xs font-semibold px-3 py-1.5 rounded-full">
            {providersList.length} {providersList.length === 1 ? 'Provider Available' : 'Providers Available'}
          </Badge>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-4">
          <AlertCircle className="size-12 text-destructive" />
          <h3 className="text-lg font-semibold">Failed to load providers</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Something went wrong while fetching the provider listings. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && providersList.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-3">
          <Store className="size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No providers found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There are currently no food providers registered. Please check back later.
          </p>
        </div>
      )}

      {/* Providers Grid */}
      {!isLoading && !isError && providersList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {providersList.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Providers;