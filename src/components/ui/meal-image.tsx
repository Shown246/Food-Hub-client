"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Utensils,
  Soup,
  Pizza,
  Coffee,
  CakeSlice,
  Sandwich,
  Salad,
  Flame,
  CupSoda,
  Cookie,
  ChefHat,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MealImageProps {
  src?: string | null;
  alt: string;
  categoryName?: string;
  categorySlug?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  variant?: "card" | "thumbnail" | "modal";
  priority?: boolean;
  loading?: "lazy" | "eager";
  children?: React.ReactNode;
}

// Curated aesthetic gradients by category slug or keyword
const THEMED_GRADIENTS: Record<string, { bg: string; iconColor: string; badgeBg: string }> = {
  bangladeshi: {
    bg: "from-amber-600/25 via-orange-600/15 to-yellow-600/20",
    iconColor: "text-amber-500 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  indian: {
    bg: "from-red-600/25 via-amber-600/15 to-orange-600/20",
    iconColor: "text-orange-500 dark:text-orange-400",
    badgeBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  biryani: {
    bg: "from-amber-600/30 via-orange-600/20 to-red-600/20",
    iconColor: "text-amber-500 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  chinese: {
    bg: "from-rose-600/25 via-red-600/15 to-amber-600/20",
    iconColor: "text-rose-500 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  pizza: {
    bg: "from-orange-600/25 via-amber-500/15 to-yellow-500/20",
    iconColor: "text-orange-500 dark:text-orange-400",
    badgeBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  burgers: {
    bg: "from-amber-700/25 via-yellow-600/15 to-orange-600/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  burger: {
    bg: "from-amber-700/25 via-yellow-600/15 to-orange-600/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  sandwich: {
    bg: "from-amber-600/20 via-yellow-600/15 to-orange-500/20",
    iconColor: "text-amber-500 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  beverages: {
    bg: "from-cyan-600/25 via-blue-600/15 to-teal-600/20",
    iconColor: "text-cyan-500 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  drinks: {
    bg: "from-cyan-600/25 via-blue-600/15 to-teal-600/20",
    iconColor: "text-cyan-500 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  coffee: {
    bg: "from-amber-800/25 via-amber-700/15 to-orange-800/20",
    iconColor: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-600/20",
  },
  desserts: {
    bg: "from-pink-600/25 via-rose-500/15 to-purple-600/20",
    iconColor: "text-pink-500 dark:text-pink-400",
    badgeBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  bakery: {
    bg: "from-pink-600/25 via-amber-500/15 to-purple-600/20",
    iconColor: "text-pink-500 dark:text-pink-400",
    badgeBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  salad: {
    bg: "from-emerald-600/25 via-teal-600/15 to-green-600/20",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  healthy: {
    bg: "from-emerald-600/25 via-teal-600/15 to-green-600/20",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};

const DEFAULT_THEME = {
  bg: "from-amber-500/20 via-primary/10 to-orange-500/15",
  iconColor: "text-primary",
  badgeBg: "bg-primary/10 text-primary border-primary/20",
};

function getCategoryTheme(slugOrName?: string) {
  if (!slugOrName) return DEFAULT_THEME;
  const key = slugOrName.toLowerCase().trim();
  for (const [pattern, theme] of Object.entries(THEMED_GRADIENTS)) {
    if (key.includes(pattern)) {
      return theme;
    }
  }
  return DEFAULT_THEME;
}

function getCategoryIcon(slugOrName?: string, sizeClass = "size-10") {
  if (!slugOrName) return <Utensils className={cn(sizeClass, "stroke-[1.5]")} />;
  const key = slugOrName.toLowerCase().trim();

  if (key.includes("pizza")) return <Pizza className={cn(sizeClass, "stroke-[1.5]")} />;
  if (key.includes("burger")) return <Sandwich className={cn(sizeClass, "stroke-[1.5]")} />;
  if (key.includes("sandwich")) return <Sandwich className={cn(sizeClass, "stroke-[1.5]")} />;
  if (key.includes("salad") || key.includes("healthy") || key.includes("vegan")) {
    return <Salad className={cn(sizeClass, "stroke-[1.5]")} />;
  }
  if (key.includes("coffee") || key.includes("tea")) {
    return <Coffee className={cn(sizeClass, "stroke-[1.5]")} />;
  }
  if (key.includes("beverage") || key.includes("drink") || key.includes("juice")) {
    return <CupSoda className={cn(sizeClass, "stroke-[1.5]")} />;
  }
  if (key.includes("dessert") || key.includes("cake") || key.includes("sweet")) {
    return <CakeSlice className={cn(sizeClass, "stroke-[1.5]")} />;
  }
  if (key.includes("cookie") || key.includes("bakery")) {
    return <Cookie className={cn(sizeClass, "stroke-[1.5]")} />;
  }
  if (key.includes("biryani") || key.includes("indian") || key.includes("spicy")) {
    return <Flame className={cn(sizeClass, "stroke-[1.5]")} />;
  }
  if (key.includes("soup") || key.includes("chinese") || key.includes("noodle") || key.includes("asian")) {
    return <Soup className={cn(sizeClass, "stroke-[1.5]")} />;
  }

  return <Utensils className={cn(sizeClass, "stroke-[1.5]")} />;
}

// Clean and validate URL string
function sanitizeImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

  // Accept valid web protocols or relative paths or data URIs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  return null;
}

export function MealImage({
  src,
  alt,
  categoryName,
  categorySlug,
  fill = true,
  width,
  height,
  sizes,
  className,
  containerClassName,
  variant = "card",
  priority = false,
  loading = "lazy",
  children,
}: MealImageProps) {
  const sanitizedSrc = useMemo(() => sanitizeImageUrl(src), [src]);
  const [hasError, setHasError] = useState(false);

  // Reset error state if image src changes
  useEffect(() => {
    setHasError(false);
  }, [sanitizedSrc]);

  const categoryDescriptor = categorySlug || categoryName || "";
  const theme = useMemo(() => getCategoryTheme(categoryDescriptor), [categoryDescriptor]);

  const showPlaceholder = !sanitizedSrc || hasError;

  if (showPlaceholder) {
    // 1. Thumbnail view (Cart item, compact list)
    if (variant === "thumbnail") {
      return (
        <div
          className={cn(
            "relative size-full flex items-center justify-center bg-gradient-to-br overflow-hidden",
            theme.bg,
            containerClassName
          )}
          role="img"
          aria-label={alt}
        >
          {/* Subtle ambient light */}
          <div className="absolute inset-0 bg-radial from-white/10 dark:from-white/5 to-transparent pointer-events-none" />
          <div className={cn("transition-transform duration-300 group-hover:scale-110", theme.iconColor)}>
            {getCategoryIcon(categoryDescriptor, "size-6")}
          </div>
          {children}
        </div>
      );
    }

    // 2. Card view (Homepage, Meals listing, Provider menu)
    return (
      <div
        className={cn(
          "relative size-full overflow-hidden bg-gradient-to-br flex items-center justify-center select-none",
          theme.bg,
          containerClassName
        )}
        role="img"
        aria-label={alt}
      >
        {/* Ambient glow & decorative background circles */}
        <div className="absolute -top-12 -left-12 size-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 size-36 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />

        {/* Themed Center Graphic */}
        <div className="relative z-1 flex flex-col items-center justify-center text-center p-4 transition-transform duration-500 group-hover:scale-105">
          {/* Glassmorphic Icon Badge */}
          <div className="flex items-center justify-center p-3.5 rounded-2xl bg-background/80 dark:bg-card/85 backdrop-blur-md border border-border/60 shadow-sm mb-2.5 group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300">
            <div className={cn("transition-colors duration-300", theme.iconColor)}>
              {getCategoryIcon(categoryDescriptor, variant === "modal" ? "size-11" : "size-9")}
            </div>
          </div>

          {/* Category / Name Label Pill */}
          <div className="flex items-center gap-1 max-w-[200px] px-2.5 py-0.5 rounded-full bg-background/70 dark:bg-card/70 backdrop-blur-sm border border-border/40 text-[11px] font-medium text-muted-foreground shadow-2xs">
            <Sparkles className="size-2.5 text-amber-500 shrink-0" />
            <span className="truncate">{categoryName || alt || "Fresh Meal"}</span>
          </div>
        </div>

        {/* Any overlay badges or components */}
        {children}
      </div>
    );
  }

  // Loaded image with onError fallback
  return (
    <div className={cn("relative size-full overflow-hidden", containerClassName)}>
      <Image
        src={sanitizedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        onError={() => setHasError(true)}
        className={cn("size-full object-cover", className)}
      />
      {children}
    </div>
  );
}

export default MealImage;
