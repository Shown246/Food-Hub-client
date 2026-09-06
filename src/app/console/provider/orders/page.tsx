'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrderById, updateOrderStatus } from '../_actions';
import { Order, OrderStatus, ProviderOrder } from '@/types/order.type';
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
  RefreshCw,
  ChevronRight,
  Receipt,
  FileText,
  Calendar,
  Loader2,
  X,
  ChefHat,
  PackageCheck,
  Truck,
  User,
  Check,
} from 'lucide-react';

interface NextStatusConfig {
  nextStatus: OrderStatus;
  label: string;
  inFlightText: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonClass: string;
}

const NEXT_STATUS_CONFIG: Record<OrderStatus, NextStatusConfig | null> = {
  PLACED: {
    nextStatus: 'PREPARING',
    label: 'Start Preparing',
    inFlightText: 'Starting...',
    icon: ChefHat,
    buttonClass:
      'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-xs border-transparent',
  },
  PREPARING: {
    nextStatus: 'READY',
    label: 'Mark as Ready',
    inFlightText: 'Marking Ready...',
    icon: PackageCheck,
    buttonClass:
      'bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:hover:bg-purple-500 shadow-xs border-transparent',
  },
  READY: {
    nextStatus: 'DELIVERED',
    label: 'Mark as Delivered',
    inFlightText: 'Delivering...',
    icon: Truck,
    buttonClass:
      'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs border-transparent',
  },
  DELIVERED: null,
  CANCELLED: null,
};

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

export default function ProviderOrdersPage() {
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [mutatingOrderId, setMutatingOrderId] = useState<string | null>(null);
  const [confirmDeliverOrder, setConfirmDeliverOrder] = useState<Order | ProviderOrder | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch orders list
  const { data: ordersRes, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['provider-orders'],
    queryFn: () => getOrders(),
  });

  // Fetch detailed order if modal opened
  const { data: detailRes, isLoading: isDetailLoading } = useQuery({
    queryKey: ['provider-order-detail', activeOrderId],
    queryFn: () => (activeOrderId ? getOrderById(activeOrderId) : null),
    enabled: !!activeOrderId,
  });

  // Order status transition mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: (res, variables) => {
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Order status updated to "${variables.status.toLowerCase()}".`,
        });
        setConfirmDeliverOrder(null);
        queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
        queryClient.invalidateQueries({ queryKey: ['provider-order-detail'] });
        setTimeout(() => setFeedback(null), 4500);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update order status.',
        });
      }
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        message: err?.message || 'An error occurred while updating order status.',
      });
    },
    onSettled: () => {
      setMutatingOrderId(null);
    },
  });

  const handleStatusAdvance = (order: Order | ProviderOrder) => {
    const config = NEXT_STATUS_CONFIG[order.status];
    if (!config) return;

    if (config.nextStatus === 'DELIVERED') {
      setConfirmDeliverOrder(order);
      return;
    }

    setMutatingOrderId(order.id);
    statusMutation.mutate({ orderId: order.id, status: config.nextStatus });
  };

  const handleConfirmDelivery = () => {
    if (!confirmDeliverOrder) return;
    setMutatingOrderId(confirmDeliverOrder.id);
    statusMutation.mutate({ orderId: confirmDeliverOrder.id, status: 'DELIVERED' });
  };

  const ordersList: (Order | ProviderOrder)[] = useMemo(() => {
    const raw: (Order | ProviderOrder)[] =
      ordersRes && ordersRes.success
        ? Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data?.orders || []
        : [];

    let filtered = raw;

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    return [...filtered].sort((a, b) => {
      if (selectedSort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (selectedSort === 'total_desc') {
        const totalA = typeof a.total === 'number' ? a.total : parseFloat(a.total || '0');
        const totalB = typeof b.total === 'number' ? b.total : parseFloat(b.total || '0');
        return totalB - totalA;
      }
      // Default: 'newest'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ordersRes, selectedStatus, selectedSort]);
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
          className={`flex items-center justify-between gap-3 p-4 rounded-xl text-sm font-medium border transition-all animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="size-5 shrink-0" />
            ) : (
              <AlertCircle className="size-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="size-4" />
          </button>
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
                      {((order as any).customerName) && (
                        <div className="flex items-center gap-1.5 text-foreground font-semibold">
                          <User className="size-3.5 text-primary shrink-0" />
                          <span>{(order as any).customerName}</span>
                        </div>
                      )}

                      {order.provider?.name && !((order as any).customerName) && (
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
                      {/* Contextual Next Status Action Button */}
                      {(() => {
                        const nextConfig = NEXT_STATUS_CONFIG[order.status];
                        if (!nextConfig) return null;
                        const NextIcon = nextConfig.icon;
                        const isCurrentMutating =
                          statusMutation.isPending && mutatingOrderId === order.id;

                        return (
                          <Button
                            size="sm"
                            disabled={statusMutation.isPending}
                            onClick={() => handleStatusAdvance(order)}
                            className={`gap-1.5 font-medium rounded-xl text-xs transition-all ${nextConfig.buttonClass}`}
                          >
                            {isCurrentMutating ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>{nextConfig.inFlightText}</span>
                              </>
                            ) : (
                              <>
                                <NextIcon className="size-3.5" />
                                <span>{nextConfig.label}</span>
                              </>
                            )}
                          </Button>
                        );
                      })()}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveOrderId(order.id)}
                        className="gap-1.5 font-medium rounded-xl text-xs"
                      >
                        <Eye className="size-3.5" />
                        <span>Details</span>
                      </Button>
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
                {/* Fulfilment Progress & Status */}
                {detailedOrder.status === 'CANCELLED' ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                    <XCircle className="size-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Order Cancelled</p>
                      {detailedOrder.cancellationReason && (
                        <p className="text-xs text-rose-500/90 mt-0.5">
                          Reason: {detailedOrder.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Fulfilment Progress</span>
                      <div>{getStatusBadge(detailedOrder.status)}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {(['PLACED', 'PREPARING', 'READY', 'DELIVERED'] as OrderStatus[]).map((step, idx) => {
                        const stepSequence: OrderStatus[] = ['PLACED', 'PREPARING', 'READY', 'DELIVERED'];
                        const currentIdx = stepSequence.indexOf(detailedOrder.status);
                        const isCompleted = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const stepLabels: Record<OrderStatus, string> = {
                          PLACED: 'Placed',
                          PREPARING: 'Preparing',
                          READY: 'Ready',
                          DELIVERED: 'Delivered',
                          CANCELLED: 'Cancelled',
                        };

                        return (
                          <div key={step} className="flex flex-col items-center text-center gap-1.5">
                            <div
                              className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : isCurrent
                                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
                                  : 'bg-muted text-muted-foreground border border-border/60'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="size-3.5 stroke-[3]" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-[11px] font-medium leading-tight ${
                                isCurrent
                                  ? 'text-primary font-bold'
                                  : isCompleted
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {stepLabels[step]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
              <div>
                {detailedOrder && (() => {
                  const nextConfig = NEXT_STATUS_CONFIG[detailedOrder.status];
                  if (!nextConfig) return null;
                  const NextIcon = nextConfig.icon;
                  const isCurrentMutating =
                    statusMutation.isPending && mutatingOrderId === detailedOrder.id;

                  return (
                    <Button
                      disabled={statusMutation.isPending}
                      onClick={() => handleStatusAdvance(detailedOrder)}
                      className={`gap-2 font-medium rounded-xl text-xs transition-all ${nextConfig.buttonClass}`}
                    >
                      {isCurrentMutating ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>{nextConfig.inFlightText}</span>
                        </>
                      ) : (
                        <>
                          <NextIcon className="size-4" />
                          <span>{nextConfig.label}</span>
                        </>
                      )}
                    </Button>
                  );
                })()}
              </div>

              <Button variant="outline" onClick={() => setActiveOrderId(null)} className="rounded-xl text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELIVER MODAL */}
      {confirmDeliverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Confirm Order Delivery</h3>
                <p className="text-xs text-muted-foreground">
                  {confirmDeliverOrder.orderNumber || `Order #${confirmDeliverOrder.id.slice(0, 8)}`}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to mark this order as <strong className="text-foreground">Delivered</strong>?
              This completes fulfilment of the order and cannot be undone.
            </p>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Customer</span>
                <span className="font-medium text-foreground">
                  {(confirmDeliverOrder as any).customerName || 'Customer'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total Amount</span>
                <span className="font-bold text-primary">
                  ৳
                  {typeof confirmDeliverOrder.total === 'number'
                    ? confirmDeliverOrder.total.toFixed(2)
                    : parseFloat(confirmDeliverOrder.total || '0').toFixed(2)}
                </span>
              </div>
              {confirmDeliverOrder.deliveryAddress && (
                <div className="flex justify-between text-muted-foreground pt-1 border-t border-border/40">
                  <span className="shrink-0 mr-2">Address</span>
                  <span className="font-medium text-foreground text-right truncate">
                    {confirmDeliverOrder.deliveryAddress}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeliverOrder(null)}
                disabled={statusMutation.isPending}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={statusMutation.isPending}
                onClick={handleConfirmDelivery}
                className="gap-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {statusMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Delivering...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Yes, Mark Delivered</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
