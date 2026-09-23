"use client";

import React, { memo } from "react";
import Link from "next/link";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { Store, MapPin, Phone, Clock, Utensils, ArrowRight, Star } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MealProvider } from "@/types/meal.type";
import { cn } from "@/lib/utils";

export interface ProviderCardProps {
  provider: MealProvider;
}

export const ProviderCard = memo(function ProviderCard({ provider }: ProviderCardProps) {
  const isAccepting = provider.acceptingOrders !== false;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-border/70 bg-card rounded-2xl">
      {/* Top Banner / Logo Section */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 flex items-center justify-center p-6">
        <ProviderLogo
          src={provider.logoUrl}
          name={provider.name}
          size="lg"
          shape="circle"
          className="size-24 rounded-full border-4 border-background shadow-md transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Active Meal Count */}
          {typeof provider.activeMealCount === "number" ? (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2.5 py-1"
            >
              <Utensils className="size-3.5 text-primary" />
              <span>
                {provider.activeMealCount} {provider.activeMealCount === 1 ? "Meal" : "Meals"}
              </span>
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2 py-1"
            >
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold">4.9</span>
            </Badge>
          )}

          {/* Order Status */}
          <Badge
            variant={isAccepting ? "success" : "destructive"}
            className="bg-background/90 backdrop-blur-md shadow-xs text-xs px-2.5 py-1"
          >
            <span
              className={cn(
                "size-1.5 rounded-full mr-1.5",
                isAccepting ? "bg-emerald-500" : "bg-rose-500"
              )}
            />
            {isAccepting ? "Open Now" : "Closed"}
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
          {provider.description ||
            "Dedicated food provider offering fresh, hygienic, and authentic meals."}
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
          <span>View Kitchen Menu</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
});

export const ProviderCardSkeleton = memo(function ProviderCardSkeleton() {
  return (
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
});
