"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Clock,
  Store,
  ShoppingBag,
  Utensils,
  ArrowRight,
  Sparkles,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Meal } from "@/types/meal.type";
import { getMeals } from "@/app/(commonLayout)/meals/_action";
import { useCart } from "@/context/cart-context";
import { currentUserQueryOptions } from "@/queries/current-user.query";
import { cn } from "@/lib/utils";

// Themed gradients for meals without images
const CATEGORY_GRADIENTS: Record<string, string> = {
  bangladeshi: "from-amber-600/20 via-orange-600/15 to-yellow-600/20",
  indian: "from-red-600/20 via-amber-600/15 to-orange-600/20",
  chinese: "from-rose-600/20 via-red-600/15 to-amber-600/20",
  pizza: "from-orange-600/20 via-amber-500/15 to-yellow-500/20",
  burgers: "from-amber-700/20 via-yellow-600/15 to-orange-600/20",
  beverages: "from-cyan-600/20 via-blue-600/15 to-teal-600/20",
  desserts: "from-pink-600/20 via-rose-500/15 to-purple-600/20",
};

interface HomeMealCardProps {
  meal: Meal;
  onAddToOrder: (meal: Meal) => void;
  cartQuantity?: number;
}

function HomeMealCard({ meal, onAddToOrder, cartQuantity }: HomeMealCardProps) {
  const formattedPrice =
    typeof meal.price === "number"
      ? meal.price.toFixed(2)
      : parseFloat(meal.price || "0").toFixed(2);

  const categorySlug = meal.category?.slug?.toLowerCase() || "";
  const bgGradient = CATEGORY_GRADIENTS[categorySlug] || "from-amber-500/15 via-primary/5 to-orange-500/15";

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-border/70 bg-card rounded-2xl">
      {/* Top Banner / Image Section */}
      <div className={cn("relative h-48 w-full overflow-hidden bg-gradient-to-br flex items-center justify-center", bgGradient)}>
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-primary/50 group-hover:scale-110 transition-transform duration-500">
            <Utensils className="size-14 stroke-[1.5]" />
            <span className="text-xs font-semibold mt-1 text-muted-foreground/70">
              {meal.category?.name || meal.name}
            </span>
          </div>
        )}

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
              <span className="font-semibold">{meal.rating?.average ? meal.rating.average.toFixed(1) : "4.8"}</span>
            </Badge>
          </div>

          <Badge
            variant={meal.isAvailable !== false ? "success" : "destructive"}
            className="bg-background/90 backdrop-blur-md shadow-xs text-xs px-2.5 py-1"
          >
            <span
              className={cn(
                "size-1.5 rounded-full mr-1.5",
                meal.isAvailable !== false ? "bg-emerald-500" : "bg-rose-500"
              )}
            />
            {meal.isAvailable !== false ? "Available" : "Sold Out"}
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
          {meal.description || "Delicately prepared with authentic ingredients for an unforgettable flavor."}
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
          <span>
            {cartQuantity && cartQuantity > 0 ? `In Order (${cartQuantity})` : "Add to Order"}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}

function HomeMealCardSkeleton() {
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
}

const CUISINE_FILTERS = [
  { label: "All Delights", key: "all" },
  { label: "Bangladeshi", key: "bangladeshi" },
  { label: "Pizza & Italian", key: "pizza" },
  { label: "Chinese", key: "chinese" },
  { label: "Indian Curries", key: "indian" },
  { label: "Beverages", key: "beverages" },
];

export function TopRatedMeals() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showProviderRestrictionModal, setShowProviderRestrictionModal] = useState(false);

  const { data: currentUserData } = useQuery(currentUserQueryOptions);
  const isLoggedIn = !!currentUserData?.user;
  const userRole = currentUserData?.user?.role;
  const isProvider = userRole === "PROVIDER";
  const { items, openCustomizationModal } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["meals", { limit: "16" }],
    queryFn: () => getMeals({ limit: "16" }),
  });

  const rawData = data as any;
  const allMeals: Meal[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data?.data)
    ? rawData.data.data
    : [];

  // Filter meals according to active tab or show random top meals
  const filteredMeals = useMemo(() => {
    if (activeFilter === "all") {
      return allMeals.slice(0, 8);
    }
    return allMeals
      .filter((m) => {
        const slug = m.category?.slug?.toLowerCase() || "";
        const name = m.category?.name?.toLowerCase() || "";
        return slug.includes(activeFilter) || name.includes(activeFilter);
      })
      .slice(0, 8);
  }, [allMeals, activeFilter]);

  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.meal.id, item.quantity);
    }
    return map;
  }, [items]);

  const handleAddToOrder = (meal: Meal) => {
    if (!isLoggedIn) {
      try {
        sessionStorage.setItem("foodhub_pending_meal", JSON.stringify(meal));
      } catch {}
      router.push("/login?callbackUrl=/");
      return;
    }

    if (isProvider) {
      setShowProviderRestrictionModal(true);
      return;
    }

    openCustomizationModal(meal);
  };

  return (
    <section className="py-16 md:py-24 bg-muted/20 border-y border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
              <Flame className="size-3.5" />
              <span>Trending &amp; Community Favorites</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Top-Rated Meals
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Taste community-favorite dishes, freshly prepared upon order by premier local chefs and kitchens.
            </p>
          </div>

          <Link href="/meals">
            <Button variant="outline" className="rounded-xl gap-2 font-semibold shadow-xs hover:bg-accent group">
              <span>View Full Menu</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CUISINE_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer border",
                activeFilter === filter.key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card hover:bg-accent text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <HomeMealCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMeals.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-3xl bg-muted/10 space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-8" />
            </div>
            <h3 className="text-lg font-semibold">No meals found in this category</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Try choosing another filter tab or browse our complete meals catalog.
            </p>
            <Button onClick={() => setActiveFilter("all")} variant="outline" className="rounded-xl">
              Reset Filters
            </Button>
          </div>
        )}

        {/* Meals Grid */}
        {!isLoading && filteredMeals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeals.map((meal) => (
              <HomeMealCard
                key={meal.id}
                meal={meal}
                onAddToOrder={handleAddToOrder}
                cartQuantity={cartItemMap.get(meal.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-rose-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Looking for something specific?</h3>
            <p className="text-sm text-muted-foreground">
              Filter by dietary preference, price range, or your favorite neighborhood provider.
            </p>
          </div>
          <Link href="/meals">
            <Button className="rounded-xl px-6 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-medium shadow-md shadow-orange-500/20 whitespace-nowrap">
              Explore All {allMeals.length > 0 ? allMeals.length : ""} Dishes
            </Button>
          </Link>
        </div>
      </div>

      {/* Provider Restriction Dialog */}
      <Dialog
        open={showProviderRestrictionModal}
        onOpenChange={setShowProviderRestrictionModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <ShieldAlert className="size-6" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Ordering Restricted for Providers
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              You are currently logged into a <strong>Provider Account</strong>. Meal ordering is reserved exclusively for customer accounts. Please switch to a customer account to place orders.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button
              variant="outline"
              onClick={() => setShowProviderRestrictionModal(false)}
              className="rounded-xl"
            >
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
