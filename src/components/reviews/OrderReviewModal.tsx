'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types/order.type';
import { createCustomerReview } from '@/app/console/customer/_actions';
import { markReviewAsCompleted, markReviewAsDismissed } from '@/lib/review-storage';
import { StarRating } from './StarRating';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Store,
  Sparkles,
  MessageSquarePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from 'lucide-react';

export interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  isLoadingOrder?: boolean;
  onDismiss?: (orderId: string) => void;
  onCompleted?: (orderId: string) => void;
}

interface ItemReviewInput {
  rating: number;
  comment: string;
}

export function OrderReviewModal({
  isOpen,
  onClose,
  order,
  isLoadingOrder = false,
  onDismiss,
  onCompleted,
}: OrderReviewModalProps) {
  const [reviewsState, setReviewsState] = useState<Record<string, ItemReviewInput>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when order changes or modal opens
  useEffect(() => {
    if (order && isOpen) {
      const initial: Record<string, ItemReviewInput> = {};
      order.items?.forEach((item) => {
        initial[item.mealId] = { rating: 0, comment: '' };
      });
      setReviewsState(initial);
      setExpandedComments({});
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [order?.id, isOpen]);

  const handleRatingChange = (mealId: string, rating: number) => {
    setReviewsState((prev) => ({
      ...prev,
      [mealId]: {
        rating,
        comment: prev[mealId]?.comment || '',
      },
    }));
  };

  const handleCommentChange = (mealId: string, comment: string) => {
    setReviewsState((prev) => ({
      ...prev,
      [mealId]: {
        rating: prev[mealId]?.rating || 0,
        comment,
      },
    }));
  };

  const toggleComment = (mealId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
  };

  const handleDismiss = () => {
    if (order?.id) {
      markReviewAsDismissed(order.id);
      onDismiss?.(order.id);
    }
    onClose();
  };

  const ratedItemsCount = Object.values(reviewsState).filter((r) => r.rating >= 1).length;

  const handleSubmit = async () => {
    if (!order || ratedItemsCount === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const itemsToSubmit = (order.items || []).filter(
      (item) => (reviewsState[item.mealId]?.rating || 0) >= 1
    );

    try {
      const results = await Promise.allSettled(
        itemsToSubmit.map((item) =>
          createCustomerReview({
            orderId: order.id,
            mealId: item.mealId,
            rating: reviewsState[item.mealId].rating,
            comment: reviewsState[item.mealId].comment.trim() || undefined,
          })
        )
      );

      const failedItems: string[] = [];
      results.forEach((res, index) => {
        if (res.status === 'rejected') {
          failedItems.push(itemsToSubmit[index].mealName || itemsToSubmit[index].name || 'Meal');
        } else if (!res.value.success) {
          // If the review was already submitted before, treat as non-fatal
          const msg = res.value.message?.toLowerCase() || '';
          if (!msg.includes('already')) {
            failedItems.push(itemsToSubmit[index].mealName || itemsToSubmit[index].name || 'Meal');
          }
        }
      });

      if (failedItems.length > 0) {
        setIsSubmitting(false);
        setErrorMessage(
          `Could not submit reviews for: ${failedItems.join(', ')}. Please try again.`
        );
      } else {
        markReviewAsCompleted(order.id);
        setIsSubmitting(false);
        setIsSuccess(true);
        onCompleted?.(order.id);

        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit reviews. Please try again.');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleDismiss();
        }
      }}
    >
      <DialogContent className="max-w-lg p-5 sm:p-6 rounded-3xl border-border/80 bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {isSuccess ? (
          /* SUCCESS CONFIRMATION STATE */
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="size-9 animate-in zoom-in duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Thank you for your feedback!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your review helps other foodies discover delicious meals and helps our kitchen improve.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl mt-2 text-xs"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <DialogHeader className="text-left space-y-3 pb-3 border-b border-border/40 shrink-0">
              <div className="flex items-center gap-3">
                {order?.provider?.logoUrl ? (
                  <img
                    src={order.provider.logoUrl}
                    alt={order.provider.name || 'Restaurant'}
                    className="size-10 rounded-xl object-cover border border-border/60 shrink-0"
                  />
                ) : (
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Store className="size-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {order?.provider?.name || 'FoodHub Restaurant'}
                    </span>
                    {order && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        {order.orderNumber || `#${order.id.slice(0, 8)}`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Sparkles className="size-3 text-amber-500" />
                    <span>Delivered Order</span>
                  </p>
                </div>
              </div>

              <div>
                <DialogTitle className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                  Your order was delivered! How was the meal?
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Rate the items you received to share your thoughts.
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* ERROR FEEDBACK */}
            {errorMessage && (
              <div className="my-2 p-3 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2 shrink-0">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* BODY: SCROLLABLE MEAL LIST */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
              {isLoadingOrder || !order ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : !order.items || order.items.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground border border-dashed rounded-2xl">
                  <Receipt className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p>No meal items available to review for this order.</p>
                </div>
              ) : (
                order.items.map((item) => {
                  const itemState = reviewsState[item.mealId] || { rating: 0, comment: '' };
                  const isExpanded =
                    expandedComments[item.mealId] || itemState.comment.length > 0;

                  return (
                    <div
                      key={item.id || item.mealId}
                      className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 hover:border-border/80 transition-colors space-y-3"
                    >
                      {/* Item Title & Quantity */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {item.mealName || item.name || 'Meal Item'}
                        </span>
                        <Badge variant="secondary" className="text-xs shrink-0 font-medium">
                          Qty: {item.quantity}
                        </Badge>
                      </div>

                      {/* Interactive Star Rating + Comment Trigger */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                        <StarRating
                          rating={itemState.rating}
                          onChange={(r) => handleRatingChange(item.mealId, r)}
                          size="md"
                        />

                        {!isExpanded && (
                          <button
                            type="button"
                            onClick={() => toggleComment(item.mealId)}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                          >
                            <MessageSquarePlus className="size-3.5" />
                            <span>Add note</span>
                          </button>
                        )}
                      </div>

                      {/* Expandable Comment Textarea */}
                      {isExpanded && (
                        <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                          <textarea
                            rows={2}
                            maxLength={2000}
                            value={itemState.comment}
                            onChange={(e) => handleCommentChange(item.mealId, e.target.value)}
                            placeholder="How was the taste, freshness, or portion size? (optional)"
                            className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
                          />
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground px-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleCommentChange(item.mealId, '');
                                toggleComment(item.mealId);
                              }}
                              className="hover:text-destructive transition-colors"
                            >
                              Remove note
                            </button>
                            <span>{itemState.comment.length} / 2000</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            <DialogFooter className="pt-3 border-t border-border/40 flex items-center justify-between sm:justify-between w-full shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                Maybe Later
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={ratedItemsCount === 0 || isSubmitting || isLoadingOrder}
                className="rounded-xl text-xs font-semibold gap-2 bg-primary hover:bg-primary/90 min-w-[130px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>
                    {ratedItemsCount > 1
                      ? `Submit ${ratedItemsCount} Reviews`
                      : ratedItemsCount === 1
                      ? 'Submit Review'
                      : 'Rate items to submit'}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
