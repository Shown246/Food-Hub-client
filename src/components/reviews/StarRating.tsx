'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StarRatingProps {
  rating: number; // 0 (unselected) to maxRating
  onChange?: (rating: number) => void;
  maxRating?: number;
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent!',
};

const SIZE_CLASSES = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

export function StarRating({
  rating,
  onChange,
  maxRating = 5,
  disabled = false,
  readOnly = false,
  size = 'md',
  showLabel = true,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;
  const isInteractive = !disabled && !readOnly && !!onChange;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, starValue: number) => {
    if (!isInteractive) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(starValue + 1, maxRating);
      onChange(next);
      setHoverRating(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(starValue - 1, 1);
      onChange(prev);
      setHoverRating(prev);
    }
  };

  const label = RATING_LABELS[displayRating] || '';

  return (
    <div
      className={cn('inline-flex items-center gap-2 select-none', className)}
      onMouseLeave={() => isInteractive && setHoverRating(null)}
      role="group"
      aria-label="Star rating"
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayRating;

          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled || readOnly}
              aria-label={`Rate ${starValue} of ${maxRating} stars${RATING_LABELS[starValue] ? ` - ${RATING_LABELS[starValue]}` : ''}`}
              onClick={() => isInteractive && onChange(starValue)}
              onMouseEnter={() => isInteractive && setHoverRating(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              className={cn(
                'rounded-sm p-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isInteractive && 'cursor-pointer hover:scale-115 active:scale-95'
              )}
            >
              <Star
                className={cn(
                  SIZE_CLASSES[size],
                  'transition-colors duration-150',
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-muted-foreground/30 fill-transparent hover:text-amber-400/60'
                )}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span
          className={cn(
            'text-xs font-semibold min-w-[70px] transition-opacity duration-150',
            label ? 'text-amber-500 dark:text-amber-400' : 'text-muted-foreground/50'
          )}
          aria-live="polite"
        >
          {label || 'Select rating'}
        </span>
      )}
    </div>
  );
}
