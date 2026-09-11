'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Minus, Plus, ShoppingBag, Store, Utensils } from 'lucide-react';

export function MealCustomizeModal() {
  const { selectedMealForModal, closeCustomizationModal, addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Reset local state whenever a new meal is opened
  useEffect(() => {
    if (selectedMealForModal) {
      setQuantity(1);
      setNote('');
    }
  }, [selectedMealForModal]);

  if (!selectedMealForModal) return null;

  const meal = selectedMealForModal;
  const unitPrice = typeof meal.price === 'number'
    ? meal.price
    : parseFloat(meal.price || '0');
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(20, prev + 1));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleConfirm = () => {
    addItem(meal, quantity, note);
    closeCustomizationModal();
  };

  return (
    <Dialog
      open={!!selectedMealForModal}
      onOpenChange={(open) => {
        if (!open) closeCustomizationModal();
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden border-border/70 rounded-3xl bg-card shadow-2xl">
        {/* Meal Image Header */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 flex items-center justify-center">
          {meal.imageUrl ? (
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-primary/40">
              <Utensils className="size-12 stroke-[1.5]" />
              <span className="text-xs font-medium mt-1 text-muted-foreground/60">
                {meal.name}
              </span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            {meal.preparationTimeMinutes ? (
              <Badge
                variant="secondary"
                className="bg-background/90 backdrop-blur-md text-foreground shadow-xs gap-1 text-xs px-2.5 py-1 rounded-full"
              >
                <Clock className="size-3 text-primary" />
                <span>{meal.preparationTimeMinutes} min</span>
              </Badge>
            ) : <div />}

            {meal.dietaryLabels && meal.dietaryLabels.length > 0 && (
              <Badge
                variant="outline"
                className="capitalize text-xs py-1 px-2.5 font-medium bg-background/90 backdrop-blur-md text-emerald-600 dark:text-emerald-400 border-emerald-500/30 rounded-full"
              >
                {meal.dietaryLabels[0]}
              </Badge>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <DialogHeader className="gap-1.5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {meal.name}
                </DialogTitle>
                {meal.provider?.name && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Store className="size-3.5 text-orange-500 shrink-0" />
                    <span>{meal.provider.name}</span>
                  </div>
                )}
              </div>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400 shrink-0">
                ৳{unitPrice.toFixed(2)}
              </span>
            </div>

            {meal.description && (
              <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                {meal.description}
              </p>
            )}
          </DialogHeader>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-2xl border border-border/50">
            <span className="font-semibold text-sm text-foreground">Quantity</span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="size-9 rounded-xl border-border/70 hover:bg-background active:scale-95"
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-base font-bold w-6 text-center text-foreground">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= 20}
                className="size-9 rounded-xl border-border/70 hover:bg-background active:scale-95"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Kitchen Notes Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="meal-instructions"
                className="text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                Special Instructions / Kitchen Notes
              </label>
              <span className="text-[11px] text-muted-foreground">
                {note.length}/300
              </span>
            </div>
            <textarea
              id="meal-instructions"
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Less spicy, dressing on the side, no onions..."
              rows={2}
              className="w-full resize-none rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:border-orange-500 transition-colors"
            />
          </div>

          {/* Action CTA Button */}
          <Button
            type="button"
            onClick={handleConfirm}
            className="w-full h-12 gap-2 text-base font-semibold text-white rounded-2xl shadow-lg shadow-orange-500/25 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] transition-all"
          >
            <ShoppingBag className="size-5" />
            <span>Add {quantity} to Order • ৳{totalPrice}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
