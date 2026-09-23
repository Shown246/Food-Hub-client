'use client';

import { useQuery } from '@tanstack/react-query';
import { getProviders } from './_action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, AlertCircle } from 'lucide-react';
import { MealProvider } from '@/types/meal.type';
import { ProviderCard, ProviderCardSkeleton } from '@/components/providers/provider-card';

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