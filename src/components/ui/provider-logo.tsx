"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Store, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProviderLogoProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  shape?: "circle" | "rounded";
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}

const PROVIDER_GRADIENTS = [
  "from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20",
  "from-rose-500 via-red-500 to-amber-600 text-white shadow-rose-500/20",
  "from-orange-500 via-amber-500 to-yellow-600 text-white shadow-orange-500/20",
  "from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-500/20",
  "from-purple-600 via-pink-600 to-rose-600 text-white shadow-purple-500/20",
  "from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/20",
];

function getProviderGradient(name?: string): string {
  if (!name || !name.trim()) return PROVIDER_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PROVIDER_GRADIENTS.length;
  return PROVIDER_GRADIENTS[index];
}

function getProviderInitials(name?: string): string | null {
  if (!name || !name.trim()) return null;
  const cleaned = name
    .replace(/['"’`]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  if (words.length === 1) {
    const word = words[0];
    return word.length >= 2 ? word.slice(0, 2).toUpperCase() : word.slice(0, 1).toUpperCase();
  }

  // Multi-word: take first letters of up to 2-3 words
  const maxLetters = words.length > 2 ? 3 : 2;
  return words
    .slice(0, maxLetters)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Clean and validate URL string
function sanitizeLogoUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

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

const SIZE_CONFIGS = {
  xs: { px: 32, dimClass: "size-8", fontClass: "text-xs font-semibold", iconSize: "size-4" },
  sm: { px: 40, dimClass: "size-10", fontClass: "text-sm font-semibold", iconSize: "size-5" },
  md: { px: 64, dimClass: "size-16", fontClass: "text-lg font-bold", iconSize: "size-8" },
  lg: { px: 96, dimClass: "size-24", fontClass: "text-2xl font-bold", iconSize: "size-10" },
  xl: { px: 112, dimClass: "size-28", fontClass: "text-3xl font-extrabold", iconSize: "size-12" },
};

export function ProviderLogo({
  src,
  name,
  size = "lg",
  shape = "circle",
  className,
  fallbackClassName,
  priority = false,
  loading = "lazy",
}: ProviderLogoProps) {
  const sanitizedSrc = useMemo(() => sanitizeLogoUrl(src), [src]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [sanitizedSrc]);

  const sizeConfig = typeof size === "number" ? null : SIZE_CONFIGS[size] || SIZE_CONFIGS.lg;
  const pixelDimension = typeof size === "number" ? size : sizeConfig ? sizeConfig.px : 96;

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const initials = useMemo(() => getProviderInitials(name), [name]);
  const gradientClass = useMemo(() => getProviderGradient(name), [name]);

  const showPlaceholder = !sanitizedSrc || hasError;

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 select-none overflow-hidden bg-gradient-to-br transition-all duration-300",
          sizeConfig?.dimClass,
          shapeClass,
          gradientClass,
          fallbackClassName,
          className
        )}
        style={typeof size === "number" ? { width: size, height: size } : undefined}
        role="img"
        aria-label={name || "Provider Logo"}
      >
        {/* Subtle ambient light overlay */}
        <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/10 pointer-events-none" />

        {initials ? (
          <div className="relative z-1 flex flex-col items-center justify-center leading-none">
            <span
              className={cn(
                "tracking-wider drop-shadow-xs",
                sizeConfig?.fontClass || "text-base font-bold"
              )}
            >
              {initials}
            </span>
            {(size === "lg" || size === "xl") && (
              <Store className="size-3 text-white/70 mt-1" />
            )}
          </div>
        ) : (
          <div className="relative z-1 flex items-center justify-center">
            <Store className={cn(sizeConfig?.iconSize || "size-6", "stroke-[1.5] text-white")} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        sizeConfig?.dimClass,
        shapeClass,
        className
      )}
      style={typeof size === "number" ? { width: size, height: size } : undefined}
    >
      <Image
        src={sanitizedSrc}
        alt={name || "Provider Logo"}
        width={pixelDimension}
        height={pixelDimension}
        sizes={`${pixelDimension}px`}
        priority={priority}
        loading={priority ? undefined : loading}
        onError={() => setHasError(true)}
        className={cn("size-full object-cover", shapeClass)}
      />
    </div>
  );
}

export default ProviderLogo;
