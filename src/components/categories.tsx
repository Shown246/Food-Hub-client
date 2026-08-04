"use client";

import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "./_category.action";
import { Category } from "@/types/meal.type";

export function Categories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const items = data?.data || [];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={cn("space-y-6", "mt-20 mx-40")}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Categories
          </h2>
          <p className="text-muted-foreground">
            Explore our curated selection of meals, perfect for any taste.
          </p>
        </div>
        {/* <Link
          href="/categories"
          className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
        >
          View All
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link> */}
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">Failed to load categories.</div>
      ) : (
        <div className="relative group">
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full shadow-md bg-background/90 hover:bg-background backdrop-blur-sm border"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item: Category) => (
              <div
                key={item.id}
                className="w-56 sm:w-60 md:w-64 flex-shrink-0"
              >
                <Link href={`/category/${item.slug}`}>
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="p-0">
                      <div className="relative aspect-square w-full">
                        {item.image || item.imageUrl ? (
                          <Image
                            src={item.image || item.imageUrl || ""}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <div className="text-muted-foreground flex flex-col items-center">
                              <div className="p-4 bg-primary/10 rounded-full mb-2">
                                <span className="text-3xl">🍜</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <CardTitle className="text-sm line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        Explore {item.name} options
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full shadow-md bg-background/90 hover:bg-background backdrop-blur-sm border"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
