'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/context/cart-context';
import { currentUserQueryOptions } from '@/queries/current-user.query';
import { getCustomerProfile, createCustomerOrder } from '@/app/console/customer/_actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, provider, subtotal, clearCart } = useCart();
  const deliveryFee = items.length > 0 ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  const { data: currentUserData, isLoading: isAuthLoading } = useQuery(currentUserQueryOptions);
  const isLoggedIn = !!currentUserData?.user;

  // Prefill phone and address from customer profile
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Load customer profile to prefill form
  useEffect(() => {
    if (isLoggedIn) {
      getCustomerProfile().then((res) => {
        if (res.success && res.data?.user) {
          if (res.data.user.phone) {
            setPhone(res.data.user.phone);
          }
          if (res.data.user.defaultDeliveryAddress) {
            setDeliveryAddress(res.data.user.defaultDeliveryAddress);
          }
        }
      });
    }
  }, [isLoggedIn]);

  const isProvider = currentUserData?.user?.role === 'PROVIDER';

  // Auth & role redirect guard
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isLoggedIn) {
        router.push('/login?callbackUrl=/checkout');
      } else if (isProvider) {
        router.push('/meals');
      }
    }
  }, [isAuthLoading, isLoggedIn, isProvider, router]);

  const handlePlaceOrder = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (isProvider) {
      setOrderError('Providers are not permitted to place meal orders.');
      return;
    }

    setOrderError(null);
    setIsSubmitting(true);

    const payload = {
      items: items.map((item) => ({
        mealId: item.meal.id,
        quantity: item.quantity,
        ...(item.note ? { note: item.note } : {}),
      })),
      customerPhone: phone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      ...(deliveryInstructions.trim() ? { deliveryInstructions: deliveryInstructions.trim() } : {}),
    };

    const response = await createCustomerOrder(payload);
    setIsSubmitting(false);

    if (!response.success) {
      setOrderError(response.message || 'Failed to place order. Please try again.');
      return;
    }

    // Success! Clear the cart and redirect to customer orders
    clearCart();
    router.push('/console/customer/orders');
  };

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="size-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center space-y-6">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-muted/60 text-muted-foreground">
          <ShoppingBag className="size-10 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You don&apos;t have any meals in your order yet. Head over to our meals page to choose your favorites.
          </p>
        </div>
        <Button onClick={() => router.push('/meals')} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
          Explore Meals
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center gap-2">
        <Link
          href="/meals"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Meals</span>
        </Link>
      </div>

      <div className="border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Checkout & Confirm Order
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your items and provide delivery details to complete your order.
        </p>
      </div>

      {orderError && (
        <div className="p-4 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-3">
          <span>{orderError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Information */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border border-border/70 shadow-sm bg-card overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <MapPin className="size-4" />
                </div>
                <CardTitle className="text-lg font-bold">Delivery Address & Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="size-4 text-muted-foreground absolute left-3.5 top-3.5" />
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="pl-10 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="address" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Delivery Address *
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street address, apartment or house number, landmark..."
                  className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="instructions" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Delivery Instructions (Optional)
                </label>
                <Input
                  id="instructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Leave with security, ring bell twice"
                  className="rounded-xl h-11"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border border-border/70 shadow-sm bg-card overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
                {provider?.name && (
                  <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-xs">
                    <Store className="size-3" />
                    <span className="truncate max-w-[140px]">{provider.name}</span>
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Item List */}
              <div className="divide-y divide-border/40 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const unitPrice = typeof item.meal.price === 'number'
                    ? item.meal.price
                    : parseFloat(item.meal.price || '0');
                  const itemTotal = unitPrice * item.quantity;

                  return (
                    <div key={item.meal.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-sm text-foreground block truncate">
                          {item.meal.name}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {item.quantity} × ৳{unitPrice.toFixed(2)}
                        </span>
                        {item.note && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md mt-1 italic">
                            <FileText className="size-3" />
                            {item.note}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-foreground shrink-0">
                        ৳{itemTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Separator className="opacity-60" />

              {/* Price Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground">৳{deliveryFee.toFixed(2)}</span>
                </div>
                <Separator className="my-1 opacity-60" />
                <div className="flex justify-between text-sm font-bold text-foreground pt-1">
                  <span>Total Amount</span>
                  <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">
                    ৳{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold text-white rounded-2xl shadow-lg shadow-orange-500/25 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin mr-2" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5 mr-1.5" />
                    <span>Confirm & Place Order • ৳{grandTotal.toFixed(2)}</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
