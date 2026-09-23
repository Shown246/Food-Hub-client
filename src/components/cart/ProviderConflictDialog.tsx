'use client';

import React from 'react';
import { useCart } from '@/context/cart-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Store } from 'lucide-react';

export function ProviderConflictDialog() {
  const { providerConflict, resolveProviderConflict } = useCart();

  if (!providerConflict) return null;

  return (
    <Dialog
      open={!!providerConflict}
      onOpenChange={(open) => {
        if (!open) resolveProviderConflict(false);
      }}
    >
      <DialogContent className="max-w-md p-6 border-border/70 rounded-3xl bg-card shadow-2xl">
        <DialogHeader className="gap-3 text-left">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Replace cart items?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Your cart already contains items from{' '}
            <strong className="text-foreground">{providerConflict.currentProviderName}</strong>. FoodHub
            orders must be from a single provider.
            <br />
            Adding items from{' '}
            <strong className="text-foreground">{providerConflict.newProviderName}</strong> will clear your
            current cart.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 flex items-center gap-3 my-1">
          <Store className="size-4 text-primary shrink-0" />
          <div className="text-xs">
            <span className="text-muted-foreground block">New selection:</span>
            <span className="font-semibold text-foreground">
              {providerConflict.quantity}× {providerConflict.newMeal.name}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => resolveProviderConflict(false)}
            className="rounded-xl flex-1 cursor-pointer"
          >
            Keep current cart
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => resolveProviderConflict(true)}
            className="rounded-xl flex-1 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            Clear cart & add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
