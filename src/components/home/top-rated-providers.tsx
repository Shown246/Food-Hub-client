"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Store, ArrowRight, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealProvider } from "@/types/meal.type";
import { getProviders } from "@/app/(commonLayout)/providers/_action";
import { ProviderCard, ProviderCardSkeleton } from "@/components/providers/provider-card";

export function TopRatedProviders() {
  const { data, isLoading } = useQuery({
    queryKey: ["providers"],
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

  const displayProviders = providersList.slice(0, 4);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-semibold">
              <ChefHat className="size-3.5" />
              <span>Verified Kitchens &amp; Caterers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Top-Rated Providers
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Meet the neighborhood culinary stars and award-winning kitchens preparing genuine homestyle dishes.
            </p>
          </div>

          <Link href="/providers">
            <Button variant="outline" className="rounded-xl gap-2 font-semibold shadow-xs hover:bg-accent group">
              <span>View All Kitchens</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Providers Grid */}
        {!isLoading && displayProviders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayProviders.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-3xl bg-muted/10 space-y-3">
            <Store className="size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No providers available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Please check back soon as our network of local kitchens expands.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
