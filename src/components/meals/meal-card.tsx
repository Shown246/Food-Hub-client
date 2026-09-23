"use client";

import React, { memo } from "react";
import { MealImage } from "@/components/ui/meal-image";
import { Clock, Star, Store, ShoppingBag } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Meal } from "@/types/meal.type";
import { cn } from "@/lib/utils";

export interface MealCardProps {
  meal: Meal;
  onAddToOrder: (meal: Meal) => void;
  cartQuantity?: number;
}

export const MealCard = memo(function MealCard({
  meal,
  onAddToOrder,
  cartQuantity,
}: MealCardProps) {
  const formattedPrice =
    typeof meal.price === "number"
      ? meal.price.toFixed(2)
      : parseFloat(meal.price || "0").toFixed(2);

  const isAvailable = meal.isAvailable !== false;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-border/70 bg-card rounded-2xl">
      {/* Top Banner / Image Section */}
      <div className="relative h-48 w-full overflow-hidden flex items-center justify-center">
        <MealImage
          src={meal.imageUrl}
          alt={meal.name}
          categoryName={meal.category?.name}
          categorySlug={meal.category?.slug}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
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

            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2 py-1"
            >
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold">
                {meal.rating?.average ? meal.rating.average.toFixed(1) : "4.8"}
              </span>
            </Badge>
          </div>

          <Badge
            variant={isAvailable ? "success" : "destructive"}
            className="bg-background/90 backdrop-blur-md shadow-xs text-xs px-2.5 py-1"
          >
            <span
              className={cn(
                "size-1.5 rounded-full mr-1.5",
                isAvailable ? "bg-emerald-500" : "bg-rose-500"
              )}
            />
            {isAvailable ? "Available" : "Sold Out"}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Provider Name & Dietary Badges */}
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
          {meal.description ||
            "Delicately prepared with authentic ingredients for an unforgettable flavor."}
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
          disabled={!isAvailable}
        >
          <ShoppingBag className="size-4" />
          <span>
            {cartQuantity && cartQuantity > 0 ? `In Order (${cartQuantity})` : "Add to Order"}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
});

export const MealCardSkeleton = memo(function MealCardSkeleton() {
  return (
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
});
