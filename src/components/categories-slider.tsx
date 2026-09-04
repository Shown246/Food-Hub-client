"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/types/meal.type";

export function CategoriesSlider({ items }: { items: Category[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: any) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories available.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top Header Navigation Arrows */}
      <div className="absolute -top-14 right-0 flex items-center gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          disabled={prevBtnDisabled}
          className="size-9 rounded-full shadow-sm hover:bg-accent disabled:opacity-30 transition-all"
          onClick={scrollPrev}
          aria-label="Previous categories"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          disabled={nextBtnDisabled}
          className="size-9 rounded-full shadow-sm hover:bg-accent disabled:opacity-30 transition-all"
          onClick={scrollNext}
          aria-label="Next categories"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Left Edge Fade */}
      {!prevBtnDisabled && (
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity" />
      )}

      {/* Embla Viewport */}
      <div className="overflow-hidden py-2" ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((item: Category) => (
            <div key={item.id} className="w-56 sm:w-60 md:w-64 flex-shrink-0 min-w-0">
              <Link href={`/meals?category=${item.slug}`}>
                <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border-border/50 bg-card">
                  <CardHeader className="p-1">
                    <div className="relative aspect-square w-full overflow-hidden">
                      {item.image || item.imageUrl ? (
                        <Image
                          src={item.image || item.imageUrl || ""}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-4xl">🍜</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs line-clamp-1">
                      Explore delicious {item.name.toLowerCase()} items
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Right Edge Fade */}
      {!nextBtnDisabled && (
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity" />
      )}
    </div>
  );
}
