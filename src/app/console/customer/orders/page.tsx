'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerOrders,
  getCustomerOrderById,
  cancelCustomerOrder,
} from '../_actions';
import { Order, OrderStatus } from '@/types/order.type';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingBag,
  Clock,
  Store,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  RefreshCw,
  ChevronRight,
  Receipt,
  FileText,
  Calendar,
  Loader2,
  X,
  Star,
} from 'lucide-react';
import { useReviewPrompt } from '@/providers/ReviewPromptProvider';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Placed', value: 'PLACED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready', value: 'READY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Amount', value: 'total_desc' },
];

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'PLACED':
      return (
        <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
          <Clock className="size-3" /> Placed
        </Badge>
      );
    case 'PREPARING':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
          <Loader2 className="size-3 animate-spin" /> Preparing
        </Badge>
      );
    case 'READY':
      return (
        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
          <CheckCircle2 className="size-3" /> Ready for Pickup
        </Badge>
      );
    case 'DELIVERED':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
          <CheckCircle2 className="size-3" /> Delivered
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
          <XCircle className="size-3" /> Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function CustomerOrdersPage() {
  const queryClient = useQueryClient();
  const { openReviewModal } = useReviewPrompt();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch orders list
  const { data: ordersRes, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['customer-orders', selectedStatus, selectedSort],
    queryFn: () => getCustomerOrders({ status: selectedStatus || undefined, sort: selectedSort }),
  });
  // Fetch detailed order if modal opened
  const { data: detailRes, isLoading: isDetailLoading } = useQuery({
    queryKey: ['customer-order-detail', activeOrderId],
    queryFn: () => (activeOrderId ? getCustomerOrderById(activeOrderId) : null),
    enabled: !!activeOrderId,
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      cancelCustomerOrder(orderId, reason),
    onSuccess: (res) => {
      if (res.success) {
        setFeedback({ type: 'success', message: 'Order has been cancelled successfully.' });
        setCancellingOrderId(null);
        setCancelReason('');
        queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
        queryClient.invalidateQueries({ queryKey: ['customer-order-detail'] });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to cancel order.' });
      }
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', message: err?.message || 'Error cancelling order.' });
    },
  });
  // console.log('data', ordersRes?.data.orders);
  const ordersList: Order[] =
      ordersRes && ordersRes.success
        ? (Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.orders || [])
        : [];
  const detailedOrder: Order | null = detailRes && detailRes.success ? detailRes.data : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            My Orders
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track your live orders, order history, and status updates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="w-fit gap-2 font-medium rounded-xl border-border/80"
        >
          <RefreshCw className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Toolbar: Status Filter Pills & Sort Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="bg-background border border-border/80 text-foreground text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-primary font-medium"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-4">
          <AlertCircle className="size-12 text-destructive" />
          <h3 className="text-lg font-semibold">Failed to load orders</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Something went wrong while fetching your orders. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && ordersList.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-3">
          <ShoppingBag className="size-14 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">No orders found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {selectedStatus
              ? `You don't have any orders with status "${selectedStatus}".`
              : "You haven't placed any meal orders yet."}
          </p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !isError && ordersList.length > 0 && (
        <div className="space-y-4">
          {ordersList.map((order) => {
            const formattedTotal =
              typeof order.total === 'number'
                ? order.total.toFixed(2)
                : parseFloat(order.total || '0').toFixed(2);

            return (
              <Card
                key={order.id}
                className="border border-border/60 hover:border-border shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden"
              >
                <CardContent className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Info Section */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                        <Receipt className="size-4 text-primary" />
                        {order.orderNumber || `FH-ORDER-${order.id.slice(0, 8)}`}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-6 text-xs text-muted-foreground font-medium">
                      {order.provider?.name && (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Store className="size-3.5 text-primary shrink-0" />
                          <span>{order.provider.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {order.itemCount !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions Section */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border/40 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-muted-foreground block font-medium">Total Amount</span>
                      <span className="text-xl font-bold text-primary">৳{formattedTotal}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveOrderId(order.id)}
                        className="gap-1.5 font-medium rounded-xl text-xs"
                      >
                        <Eye className="size-3.5" />
                        <span>Details</span>
                      </Button>

                      {order.status === 'DELIVERED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewModal(order)}
                          className="gap-1.5 font-medium rounded-xl text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-500"
                        >
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span>Leave Review</span>
                        </Button>
                      )}

                      {order.status === 'PLACED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setCancellingOrderId(order.id);
                            setCancelReason('');
                          }}
                          className="gap-1.5 font-medium rounded-xl text-xs"
                        >
                          <Ban className="size-3.5" />
                          <span>Cancel</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {activeOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Order Details
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {detailedOrder?.orderNumber || `Order #${activeOrderId}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setActiveOrderId(null)}
                className="rounded-xl"
              >
                <X className="size-5" />
              </Button>
            </div>

            {isDetailLoading || !detailedOrder ? (
              <div className="space-y-4 py-8">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Banner */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </span>
                  <div>{getStatusBadge(detailedOrder.status)}</div>
                </div>

                {/* Provider Information */}
                {detailedOrder.provider && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Store className="size-3.5 text-primary" /> Provider Information
                    </h4>
                    <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-xs md:text-sm space-y-1">
                      <p className="font-bold text-foreground">{detailedOrder.provider.name}</p>
                      {detailedOrder.provider.address && (
                        <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                          <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                          {detailedOrder.provider.address}
                        </p>
                      )}
                      {detailedOrder.provider.phone && (
                        <p className="text-muted-foreground flex items-center gap-1.5">
                          <Phone className="size-3.5 text-muted-foreground shrink-0" />
                          {detailedOrder.provider.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Information */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" /> Delivery Information
                  </h4>
                  <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-xs md:text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground block text-xs">Address</span>
                      <p className="font-medium text-foreground">
                        {detailedOrder.deliveryAddress || 'Standard delivery address'}
                      </p>
                    </div>
                    {detailedOrder.customerPhone && (
                      <div>
                        <span className="text-muted-foreground block text-xs">Phone</span>
                        <p className="font-medium text-foreground">{detailedOrder.customerPhone}</p>
                      </div>
                    )}
                    {detailedOrder.deliveryInstructions && (
                      <div>
                        <span className="text-muted-foreground block text-xs">Instructions</span>
                        <p className="font-medium text-foreground">{detailedOrder.deliveryInstructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShoppingBag className="size-3.5 text-primary" /> Ordered Items
                  </h4>
                  <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40">
                    {detailedOrder.items && detailedOrder.items.length > 0 ? (
                      detailedOrder.items.map((item) => {
                        const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
                        const lineTotal = (itemPrice * item.quantity).toFixed(2);
                        return (
                          <div key={item.id} className="p-3 md:p-4 flex items-center justify-between text-xs md:text-sm">
                            <div>
                              <p className="font-semibold text-foreground">{item.mealName || item.name || 'Meal Item'}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ৳{itemPrice.toFixed(2)}
                              </p>
                              {item.note && (
                                <p className="text-xs italic text-amber-600 dark:text-amber-400 mt-0.5">
                                  Note: {item.note}
                                </p>
                              )}
                            </div>
                            <span className="font-bold text-foreground">৳{lineTotal}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="p-4 text-xs text-muted-foreground text-center">No item breakdown available.</p>
                    )}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">
                      ৳{typeof detailedOrder.subtotal === 'number' ? detailedOrder.subtotal.toFixed(2) : parseFloat(detailedOrder.subtotal || '0').toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-foreground">
                      ৳{typeof detailedOrder.deliveryFee === 'number' ? detailedOrder.deliveryFee.toFixed(2) : parseFloat(detailedOrder.deliveryFee || '0').toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground border-t border-border/40 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      ৳{typeof detailedOrder.total === 'number' ? detailedOrder.total.toFixed(2) : parseFloat(detailedOrder.total || '0').toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              {detailedOrder?.status === 'DELIVERED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (detailedOrder) {
                      openReviewModal(detailedOrder);
                    }
                  }}
                  className="gap-1.5 font-medium rounded-xl text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-500"
                >
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>Leave Review</span>
                </Button>
              ) : (
                <div />
              )}
              <Button variant="outline" onClick={() => setActiveOrderId(null)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center gap-3 text-destructive">
              <Ban className="size-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">Cancel Order</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to cancel this order? You can optionally provide a reason below.
            </p>

            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-xs font-semibold text-foreground block">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                id="cancelReason"
                rows={3}
                placeholder="e.g. Changed my mind, ordered by mistake..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setCancellingOrderId(null)}
                disabled={cancelMutation.isPending}
                className="rounded-xl"
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate({ orderId: cancellingOrderId, reason: cancelReason.trim() })}
                className="gap-2 rounded-xl font-semibold"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
