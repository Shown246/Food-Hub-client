'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrders, getAdminOrderById } from '../_actions';
import {
  AdminOrderSummary,
  AdminOrderDetail,
  GetAdminOrdersParams,
  PaginationMeta,
} from '@/types/admin.type';
import { OrderStatus } from '@/types/order.type';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  X,
  Store,
  MapPin,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  FileText,
  History,
  ShieldAlert,
  ChefHat,
  PackageCheck,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowRight,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeBg: string;
  }
> = {
  PLACED: {
    label: 'Placed',
    icon: Clock,
    badgeBg: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
  },
  PREPARING: {
    label: 'Preparing',
    icon: ChefHat,
    badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  READY: {
    label: 'Ready',
    icon: PackageCheck,
    badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
  },
};

const getStatusBadge = (status: OrderStatus) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: Clock,
    badgeBg: 'bg-muted text-muted-foreground',
  };
  const Icon = config.icon;
  return (
    <Badge className={`gap-1 font-semibold text-xs py-0.5 px-2 ${config.badgeBg}`}>
      <Icon className="size-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

const getActorRoleBadge = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return (
        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-bold">
          ADMIN
        </Badge>
      );
    case 'PROVIDER':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold">
          PROVIDER
        </Badge>
      );
    case 'CUSTOMER':
      return (
        <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px] font-bold">
          CUSTOMER
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] font-mono">
          {role}
        </Badge>
      );
  }
};

function AdminOrdersContent() {
  const searchParams = useSearchParams();

  const initialStatus = (searchParams.get('status') as OrderStatus) || '';
  const initialSearch = searchParams.get('search') || '';
  const initialCustomerId = searchParams.get('customerId') || '';
  const initialProviderId = searchParams.get('providerId') || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>(initialStatus);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Inspector Dialog state
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const handleSearchChange = (val: string) => {
    setSearch(val);
    startTransition(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Fetch orders
  const queryParams: GetAdminOrdersParams = {
    search: debouncedSearch || undefined,
    status: selectedStatus || undefined,
    customerId: initialCustomerId || undefined,
    providerId: initialProviderId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: currentPage,
    limit: 10,
  };

  const {
    data: ordersRes,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-orders', queryParams],
    queryFn: () => getAdminOrders(queryParams),
  });

  const orders: AdminOrderSummary[] =
    ordersRes && ordersRes.success && Array.isArray(ordersRes.data) ? ordersRes.data : [];

  const meta: PaginationMeta | undefined =
    ordersRes && ordersRes.success ? ordersRes.meta : undefined;

  // Fetch individual order detail for Audit Timeline
  const { data: detailRes, isLoading: isDetailLoading } = useQuery({
    queryKey: ['admin-order-detail', inspectOrderId],
    queryFn: () => (inspectOrderId ? getAdminOrderById(inspectOrderId) : null),
    enabled: !!inspectOrderId,
  });

  const detailedOrder: AdminOrderDetail | null =
    detailRes && detailRes.success && detailRes.data ? detailRes.data : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="size-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Platform Orders Inspection
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Oversight of all customer orders, delivery states, and complete chronological actor audit trails.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
          className="w-fit gap-2 font-medium rounded-xl border-border/80 self-start sm:self-auto"
        >
          <RefreshCw className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters Toolbar */}
      <Card className="rounded-2xl border-border/60 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search order #, customer, or provider..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-8 rounded-xl text-xs h-10 border-border/80"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Select */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as OrderStatus | '');
                  setCurrentPage(1);
                }}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready for Pickup</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Date From */}
            <div className="space-y-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl text-xs h-10 border-border/80"
                placeholder="From Date"
              />
            </div>

            {/* Date To */}
            <div className="space-y-1">
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl text-xs h-10 border-border/80"
                placeholder="To Date"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="w-full h-10 rounded-xl text-xs gap-1.5 font-medium border-border/80"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-muted/20 space-y-3">
          <AlertCircle className="size-10 text-destructive mx-auto" />
          <h3 className="text-base font-semibold">Unable to fetch platform orders</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            An error occurred while loading order records. Please retry.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl">
            Retry Request
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-muted/20 space-y-3">
          <ShoppingBag className="size-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No orders found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {debouncedSearch || selectedStatus || dateFrom || dateTo
              ? 'No platform orders match your current filter parameters.'
              : 'There are no customer orders recorded on the platform yet.'}
          </p>
          {(debouncedSearch || selectedStatus || dateFrom || dateTo) && (
            <Button onClick={handleResetFilters} variant="outline" size="sm" className="rounded-xl text-xs">
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && !isError && orders.length > 0 && (
        <Card className="rounded-3xl border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Order Number</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs">Items</TableHead>
                  <TableHead className="text-xs">Total Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date Placed</TableHead>
                  <TableHead className="text-xs text-right pr-6">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const numTotal = parseFloat(order.total || '0').toFixed(2);

                  return (
                    <TableRow key={order.id} className="text-xs">
                      {/* Order Number */}
                      <TableCell className="py-3.5 font-bold">
                        <span className="font-mono text-xs text-primary flex items-center gap-1.5">
                          <Receipt className="size-3.5 shrink-0" />
                          {order.orderNumber}
                        </span>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6 shrink-0">
                            <AvatarImage src={order.customer?.profileImageUrl || undefined} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {order.customer?.fullName
                                ? order.customer.fullName.substring(0, 2).toUpperCase()
                                : 'CU'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground truncate max-w-[120px]">
                            {order.customer?.fullName || 'Customer'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Provider */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-foreground font-medium truncate max-w-[130px]">
                          <Store className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate">{order.provider?.name || 'Provider'}</span>
                        </div>
                      </TableCell>

                      {/* Items */}
                      <TableCell className="py-3.5 text-muted-foreground">
                        <span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="py-3.5 font-bold text-foreground">
                        ৳{numTotal}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">{getStatusBadge(order.status)}</TableCell>

                      {/* Date Placed */}
                      <TableCell className="py-3.5 text-muted-foreground">
                        <div className="space-y-0.5">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] block text-muted-foreground/80">
                            {new Date(order.createdAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectOrderId(order.id)}
                          className="h-8 px-2.5 rounded-xl gap-1 text-xs font-semibold text-primary hover:bg-primary/10"
                        >
                          <Eye className="size-3.5" />
                          <span>Audit Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination Footer */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing page <strong className="text-foreground">{meta.page}</strong> of{' '}
                <strong className="text-foreground">{meta.totalPages}</strong> ({meta.totalItems} orders)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl text-xs gap-1 h-8"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-xl text-xs gap-1 h-8"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ORDER AUDIT & CHRONOLOGICAL DETAILS MODAL */}
      <Dialog open={!!inspectOrderId} onOpenChange={(open) => !open && setInspectOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
          <DialogHeader className="text-left space-y-1 pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    Order Audit Inspection
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-mono mt-0.5">
                    {detailedOrder?.orderNumber || `Order ID: ${inspectOrderId}`}
                  </DialogDescription>
                </div>
              </div>
              {detailedOrder && getStatusBadge(detailedOrder.status)}
            </div>
          </DialogHeader>

          {isDetailLoading || !detailedOrder ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Cancellation Alert if applicable */}
              {detailedOrder.status === 'CANCELLED' && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <XCircle className="size-4 shrink-0" />
                    <span>Order Cancelled</span>
                  </div>
                  {detailedOrder.cancellationReason && (
                    <p className="text-xs leading-relaxed opacity-90 pl-6">
                      Reason: {detailedOrder.cancellationReason}
                    </p>
                  )}
                  {detailedOrder.cancelledAt && (
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 pl-6">
                      Timestamp: {new Date(detailedOrder.cancelledAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* SECTION: Customer & Provider Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Customer Information */}
                <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px] flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" /> Customer Details
                  </span>
                  <div className="space-y-1 text-foreground">
                    <p className="font-bold text-sm">{detailedOrder.customerName}</p>
                    {detailedOrder.customerPhone && (
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Phone className="size-3 text-muted-foreground shrink-0" />
                        {detailedOrder.customerPhone}
                      </p>
                    )}
                    <p className="text-muted-foreground flex items-start gap-1.5 pt-0.5">
                      <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{detailedOrder.deliveryAddress || 'No address provided'}</span>
                    </p>
                    {detailedOrder.deliveryInstructions && (
                      <p className="text-amber-600 dark:text-amber-400 italic text-[11px] pt-1">
                        Note: {detailedOrder.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Provider Information */}
                <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px] flex items-center gap-1.5">
                    <Store className="size-3.5 text-amber-600 dark:text-amber-400" /> Provider Store
                  </span>
                  <div className="space-y-1 text-foreground">
                    <p className="font-bold text-sm">{detailedOrder.provider?.name}</p>
                    {detailedOrder.provider?.phone && (
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Phone className="size-3 text-muted-foreground shrink-0" />
                        {detailedOrder.provider.phone}
                      </p>
                    )}
                    {detailedOrder.provider?.address && (
                      <p className="text-muted-foreground flex items-start gap-1.5 pt-0.5">
                        <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{detailedOrder.provider.address}</span>
                      </p>
                    )}
                    {detailedOrder.provider?.openingHours && (
                      <p className="text-muted-foreground text-[11px] pt-1">
                        Hours: {detailedOrder.provider.openingHours}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: Ordered Items */}
              <div className="space-y-2">
                <span className="font-semibold uppercase tracking-wider text-muted-foreground text-xs flex items-center gap-1.5">
                  <ShoppingBag className="size-3.5 text-primary" /> Ordered Items (
                  {detailedOrder.items?.length || 0})
                </span>
                <div className="border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/40">
                  {detailedOrder.items && detailedOrder.items.length > 0 ? (
                    detailedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground text-sm block">
                            {item.mealName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {item.quantity} × ৳{parseFloat(item.unitPrice).toFixed(2)}
                          </span>
                          {item.itemNote && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                              Special note: {item.itemNote}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-foreground text-sm">
                          ৳{parseFloat(item.lineTotal).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No item details recorded for this order.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: Ledger Breakdown */}
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/10 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">
                    ৳{parseFloat(detailedOrder.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-foreground">
                    ৳{parseFloat(detailedOrder.deliveryFee).toFixed(2)}
                  </span>
                </div>
                {parseFloat(detailedOrder.tax) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span className="font-medium text-foreground">
                      ৳{parseFloat(detailedOrder.tax).toFixed(2)}
                    </span>
                  </div>
                )}
                {parseFloat(detailedOrder.serviceFee) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service Fee</span>
                    <span className="font-medium text-foreground">
                      ৳{parseFloat(detailedOrder.serviceFee).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-foreground border-t border-border/40 pt-2 mt-2">
                  <span>Total Amount</span>
                  <span className="text-primary font-black">
                    ৳{parseFloat(detailedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* SECTION: Chronological Status Audit Trail Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <History className="size-4" />
                  </span>
                  <h4 className="font-bold text-sm text-foreground">
                    Chronological Status Audit Trail
                  </h4>
                </div>

                {detailedOrder.statusHistory && detailedOrder.statusHistory.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
                    {detailedOrder.statusHistory.map((history, idx) => (
                      <div key={history.id} className="relative group text-xs">
                        {/* Dot indicator */}
                        <div className="absolute -left-6 top-1 size-5 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                          <div className="size-1.5 rounded-full bg-background" />
                        </div>

                        {/* Event Card */}
                        <div className="p-3.5 rounded-2xl border border-border/60 bg-card hover:border-border transition-all space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {history.fromStatus ? (
                                <div className="flex items-center gap-1 font-semibold text-foreground">
                                  <span>{history.fromStatus}</span>
                                  <ArrowRight className="size-3 text-muted-foreground" />
                                  <span className="text-primary font-bold">{history.toStatus}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-primary">
                                  Initialized as {history.toStatus}
                                </span>
                              )}
                              {getActorRoleBadge(history.actorRole)}
                            </div>

                            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                              <Calendar className="size-3 text-muted-foreground" />
                              {new Date(history.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Actor Info */}
                          {history.actor && (
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/30">
                              <Avatar className="size-4">
                                <AvatarImage src={history.actor.profileImageUrl || undefined} />
                                <AvatarFallback className="text-[8px]">
                                  {history.actor.fullName
                                    ? history.actor.fullName.substring(0, 2).toUpperCase()
                                    : 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                Action performed by:{' '}
                                <strong className="text-foreground">{history.actor.fullName}</strong>
                              </span>
                            </div>
                          )}

                          {/* Audit Note */}
                          {history.note && (
                            <p className="text-[11px] text-foreground/80 bg-muted/40 p-2 rounded-xl border border-border/40 leading-relaxed font-sans">
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed rounded-2xl bg-muted/20 text-xs text-muted-foreground">
                    No status transitions have been logged for this order.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-3 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectOrderId(null)}
                  className="rounded-xl text-xs"
                >
                  Close Inspection
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64 rounded-3xl" /></div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
