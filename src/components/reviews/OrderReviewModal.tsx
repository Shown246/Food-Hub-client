'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Order, OrderReview } from '@/types/order.type';
import {
  createCustomerReview,
  updateCustomerReview,
  deleteCustomerReview,
} from '@/app/console/customer/_actions';
import {
  markReviewAsCompleted,
  markReviewAsDismissed,
  removeReviewFromCompleted,
} from '@/lib/review-storage';
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
  Loader2,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Trash2,
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
  reviewId?: string;
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
  const queryClient = useQueryClient();

  const [reviewsState, setReviewsState] = useState<Record<string, ItemReviewInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successAction, setSuccessAction] = useState<'created' | 'updated' | 'deleted' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditMode = Boolean(
    (order?.reviews && order.reviews.length > 0) ||
    Object.values(reviewsState).some((r) => !!r.reviewId)
  );

  // Reset/populate state when order changes or modal opens
  useEffect(() => {
    if (order && isOpen) {
      const existingReviewsMap = new Map<string, OrderReview>();
      if (order.reviews) {
        order.reviews.forEach((r) => existingReviewsMap.set(r.mealId, r));
      }

      const initial: Record<string, ItemReviewInput> = {};

      order.items?.forEach((item) => {
        const existing = existingReviewsMap.get(item.mealId);
        if (existing) {
          initial[item.mealId] = {
            reviewId: existing.id,
            rating: existing.rating,
            comment: existing.comment || '',
          };
        } else {
          initial[item.mealId] = { rating: 0, comment: '' };
        }
      });

      setReviewsState(initial);
      setIsSubmitting(false);
      setIsDeleting(false);
      setIsSuccess(false);
      setSuccessAction(null);
      setErrorMessage(null);
    }
  }, [order?.id, order?.reviews, order?.items, isOpen]);

  const handleRatingChange = (mealId: string, rating: number) => {
    setReviewsState((prev) => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        rating,
        comment: prev[mealId]?.comment || '',
      },
    }));
  };

  const handleCommentChange = (mealId: string, comment: string) => {
    setReviewsState((prev) => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        rating: prev[mealId]?.rating || 0,
        comment,
      },
    }));
  };

  const handleDismiss = () => {
    if (order?.id && !isEditMode) {
      markReviewAsDismissed(order.id);
      onDismiss?.(order.id);
    }
    onClose();
  };

  const ratedItemsCount = Object.values(reviewsState).filter((r) => r.rating >= 1).length;

  const handleSubmit = async () => {
    if (!order || ratedItemsCount === 0 || isSubmitting || isDeleting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const itemsToProcess = (order.items || []).filter(
      (item) => (reviewsState[item.mealId]?.rating || 0) >= 1
    );

    try {
      const results = await Promise.allSettled(
        itemsToProcess.map((item) => {
          const itemState = reviewsState[item.mealId];
          if (itemState?.reviewId) {
            return updateCustomerReview(itemState.reviewId, {
              rating: itemState.rating,
              comment: itemState.comment.trim() || null,
            });
          } else {
            return createCustomerReview({
              orderId: order.id,
              mealId: item.mealId,
              rating: itemState.rating,
              comment: itemState.comment.trim() || undefined,
            });
          }
        })
      );

      const failedItems: string[] = [];
      results.forEach((res, index) => {
        if (res.status === 'rejected') {
          failedItems.push(itemsToProcess[index].mealName || itemsToProcess[index].name || 'Meal');
        } else if (!res.value.success) {
          const msg = res.value.message?.toLowerCase() || '';
          if (!msg.includes('already')) {
            failedItems.push(itemsToProcess[index].mealName || itemsToProcess[index].name || 'Meal');
          }
        }
      });

      if (failedItems.length > 0) {
        setIsSubmitting(false);
        setErrorMessage(
          `Could not save reviews for: ${failedItems.join(', ')}. Please try again.`
        );
      } else {
        markReviewAsCompleted(order.id);
        queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
        queryClient.invalidateQueries({ queryKey: ['customer-recent-orders'] });
        queryClient.invalidateQueries({ queryKey: ['customer-order-detail'] });

        setIsSubmitting(false);
        setSuccessAction(isEditMode ? 'updated' : 'created');
        setIsSuccess(true);
        onCompleted?.(order.id);

        setTimeout(() => {
          onClose();
        }, 1600);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to save review. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!order || isDeleting || isSubmitting) return;

    const idsToDelete = [
      ...new Set([
        ...(order.reviews?.map((r) => r.id) || []),
        ...(Object.values(reviewsState).map((r) => r.reviewId).filter(Boolean) as string[]),
      ]),
    ];

    if (idsToDelete.length === 0) {
      onClose();
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const results = await Promise.allSettled(
        idsToDelete.map((reviewId) => deleteCustomerReview(reviewId))
      );

      const hasFailures = results.some(
        (res) => res.status === 'rejected' || !res.value.success
      );

      if (hasFailures) {
        setIsDeleting(false);
        setErrorMessage('Failed to delete review. Please try again.');
      } else {
        removeReviewFromCompleted(order.id);
        queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
        queryClient.invalidateQueries({ queryKey: ['customer-recent-orders'] });
        queryClient.invalidateQueries({ queryKey: ['customer-order-detail'] });

        setIsDeleting(false);
        setSuccessAction('deleted');
        setIsSuccess(true);

        setTimeout(() => {
          onClose();
        }, 1600);
      }
    } catch (err: any) {
      setIsDeleting(false);
      setErrorMessage(err?.message || 'Failed to delete review. Please try again.');
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
            <div
              className={`size-16 rounded-full flex items-center justify-center ${
                successAction === 'deleted'
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
              }`}
            >
              <CheckCircle2 className="size-9 animate-in zoom-in duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {successAction === 'deleted'
                  ? 'Review Deleted'
                  : successAction === 'updated'
                  ? 'Review Updated Successfully!'
                  : 'Thank you for your feedback!'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {successAction === 'deleted'
                  ? 'Your review for this order has been removed.'
                  : successAction === 'updated'
                  ? 'Your updated rating and note have been saved.'
                  : 'Your review helps other foodies discover delicious meals and helps our kitchen improve.'}
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
                  {isEditMode ? 'Edit your review' : 'Your order was delivered! How was the meal?'}
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  {isEditMode
                    ? 'Update or change your rating and feedback for this order.'
                    : 'Rate the items you received to share your thoughts.'}
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

                      {/* Interactive Star Rating */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                        <StarRating
                          rating={itemState.rating}
                          onChange={(r) => handleRatingChange(item.mealId, r)}
                          size="md"
                        />
                      </div>

                      {/* Comment Textarea - Always Visible */}
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          rows={2}
                          maxLength={2000}
                          value={itemState.comment}
                          onChange={(e) => handleCommentChange(item.mealId, e.target.value)}
                          placeholder="How was the taste, freshness, or portion size? (optional)"
                          className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
                        />
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground px-0.5">
                          {itemState.comment ? (
                            <button
                              type="button"
                              onClick={() => handleCommentChange(item.mealId, '')}
                              className="hover:text-destructive transition-colors"
                            >
                              Clear note
                            </button>
                          ) : (
                            <span />
                          )}
                          <span>{itemState.comment.length} / 2000</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {isEditMode ? (
              <DialogFooter className="pt-3 border-t border-border/40 flex flex-row items-center justify-between gap-2 w-full shrink-0">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-3.5" />
                      <span>Delete Review</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    disabled={isSubmitting || isDeleting}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={ratedItemsCount === 0 || isSubmitting || isDeleting || isLoadingOrder}
                    className="rounded-xl text-xs font-semibold gap-2 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Change Review</span>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            ) : (
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
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
