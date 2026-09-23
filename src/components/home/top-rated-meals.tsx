"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MealImage } from "@/components/ui/meal-image";
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
import { MealCard, MealCardSkeleton } from "@/components/meals/meal-card";

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

  // If user was redirected to login and returned, automatically open customization for their pending meal
  useEffect(() => {
    if (isLoggedIn) {
      try {
        const pending = sessionStorage.getItem("foodhub_pending_meal");
        if (pending) {
          if (isProvider) {
            sessionStorage.removeItem("foodhub_pending_meal");
            setShowProviderRestrictionModal(true);
            return;
          }
          const pendingMeal = JSON.parse(pending) as Meal;
          sessionStorage.removeItem("foodhub_pending_meal");
          openCustomizationModal(pendingMeal);
        }
      } catch {
        sessionStorage.removeItem("foodhub_pending_meal");
      }
    }
  }, [isLoggedIn, isProvider, openCustomizationModal]);

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
              <MealCardSkeleton key={i} />
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
              <MealCard
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
