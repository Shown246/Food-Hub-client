'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Utensils,
  FileText,
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    provider,
    totalCount,
    subtotal,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const router = useRouter();

  const deliveryFee = totalCount > 0 ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-card border-l border-border/70"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-orange-500 text-white shadow-sm">
                <ShoppingBag className="size-4" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold text-foreground">
                  Your Order
                </SheetTitle>
                <span className="text-xs text-muted-foreground font-medium">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {items.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-lg"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Provider Badge */}
          {provider?.name && items.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-medium">
              <Store className="size-3.5 shrink-0" />
              <span className="truncate">Ordering from: <strong>{provider.name}</strong></span>
            </div>
          )}
        </SheetHeader>

        {/* Drawer Content */}
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-muted/60 text-muted-foreground">
              <Utensils className="size-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="font-semibold text-base text-foreground">
                Your cart is empty
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add delicious meals from our kitchen partners to begin your order.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-xl mt-2 font-medium"
            >
              Browse Meals
            </Button>
          </div>
        ) : (
          /* Order Items List */
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-border/40">
            {items.map((item) => {
              const unitPrice = typeof item.meal.price === 'number'
                ? item.meal.price
                : parseFloat(item.meal.price || '0');
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={item.meal.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                  <div className="flex items-start gap-3">
                    {/* Meal Thumbnail */}
                    <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                      {item.meal.imageUrl ? (
                        <img
                          src={item.meal.imageUrl}
                          alt={item.meal.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground/50">
                          <Utensils className="size-6 stroke-[1.5]" />
                        </div>
                      )}
                    </div>

                    {/* Meal Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                          {item.meal.name}
                        </h4>
                        <span className="font-bold text-sm text-foreground shrink-0">
                          ৳{itemTotal.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        ৳{unitPrice.toFixed(2)} each
                      </span>

                      {/* Kitchen Note */}
                      {item.note && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md w-fit">
                          <FileText className="size-3 shrink-0" />
                          <span className="line-clamp-1 italic">&quot;{item.note}&quot;</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.meal.id)}
                      className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${item.meal.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>

                    <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1 border border-border/50">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.meal.id, item.quantity - 1)}
                        className="size-7 rounded-lg hover:bg-background"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="text-xs font-bold w-5 text-center text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.meal.id, item.quantity + 1)}
                        disabled={item.quantity >= 20}
                        className="size-7 rounded-lg hover:bg-background"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <SheetFooter className="p-5 border-t border-border/60 bg-muted/20 flex flex-col gap-3.5">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-foreground">৳{deliveryFee.toFixed(2)}</span>
              </div>
              <Separator className="my-1 opacity-60" />
              <div className="flex justify-between text-sm font-bold text-foreground pt-0.5">
                <span>Total</span>
                <span className="text-base font-extrabold text-orange-600 dark:text-orange-400">
                  ৳{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleCheckout}
              className="w-full h-12 gap-2 text-base font-semibold text-white rounded-2xl shadow-lg shadow-orange-500/25 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-4" />
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
