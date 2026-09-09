'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/context/cart-context';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { currentUserQueryOptions } from '@/queries/current-user.query';

export function FloatingOrderBar() {
  const { totalCount, subtotal, setIsDrawerOpen, isDrawerOpen } = useCart();
  const { data: currentUserData } = useQuery(currentUserQueryOptions);
  const isProvider = currentUserData?.user?.role === 'PROVIDER';

  // Hide when cart is empty, when drawer is already open, or when user is a provider
  if (totalCount === 0 || isDrawerOpen || isProvider) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="group relative w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded-full shadow-2xl shadow-zinc-950/30 dark:shadow-orange-500/10 border border-white/10 dark:border-zinc-200/50 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
          aria-label="View current order"
        >
          {/* Left: Bag icon with item badge */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative grid size-10 place-items-center rounded-full bg-orange-500 text-white shrink-0 shadow-sm">
              <ShoppingBag className="size-5" />
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center justify-center border-2 border-zinc-950 dark:border-white">
                {totalCount}
              </span>
            </span>

            <div className="flex flex-col text-left truncate">
              <span className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">
                {totalCount} {totalCount === 1 ? 'item added' : 'items added'}
              </span>
              <span className="text-base font-bold tracking-tight text-white dark:text-zinc-950">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Right: View Order Pill & Arrow */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 text-white rounded-full text-sm font-semibold group-hover:bg-orange-600 transition-colors shrink-0 shadow-xs">
            <span>View Order</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
