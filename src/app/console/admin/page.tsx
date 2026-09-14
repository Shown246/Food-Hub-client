'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from './_actions';
import { AdminDashboardData } from '@/types/admin.type';
import { OrderStatus } from '@/types/order.type';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  Users,
  Store,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  ChefHat,
  RefreshCw,
  ArrowRight,
  Utensils,
  Layers,
  AlertCircle,
  Receipt,
  ExternalLink,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    cardBg: string;
    border: string;
    textColor: string;
    badgeBg: string;
  }
> = {
  PLACED: {
    label: 'Placed',
    icon: Clock,
    cardBg: 'bg-sky-500/5',
    border: 'border-sky-500/20',
    textColor: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
  },
  PREPARING: {
    label: 'Preparing',
    icon: ChefHat,
    cardBg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  READY: {
    label: 'Ready',
    icon: PackageCheck,
    cardBg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckCircle2,
    cardBg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    cardBg: 'bg-rose-500/5',
    border: 'border-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
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

export default function AdminConsolePage() {
  const {
    data: dashboardRes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => getAdminDashboard(),
    refetchInterval: 30000,
  });

  const dashboard: AdminDashboardData | null =
    dashboardRes && dashboardRes.success && dashboardRes.data ? dashboardRes.data : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Platform Administration
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Live platform metrics, user status distribution, order breakdown, and recent activity.
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
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          <AlertCircle className="size-5 shrink-0" />
          <span>
            {error instanceof Error
              ? error.message
              : !dashboardRes?.success && dashboardRes?.message
              ? dashboardRes.message
              : 'Failed to load platform dashboard data. Please check your network or credentials.'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="ml-auto rounded-xl text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && dashboard && (
        <>
          {/* SECTION 1: Platform KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Customers */}
            <Card className="rounded-3xl border-border/70 hover:border-border transition-all shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Customers
                  </span>
                  <div className="text-3xl font-extrabold text-foreground tracking-tight">
                    {dashboard.customerCount.toLocaleString()}
                  </div>
                  <Link
                    href="/console/admin/users?role=CUSTOMER"
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
                  >
                    <span>Manage customers</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
                <div className="size-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Users className="size-6" />
                </div>
              </CardContent>
            </Card>

            {/* Total Providers */}
            <Card className="rounded-3xl border-border/70 hover:border-border transition-all shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Providers
                  </span>
                  <div className="text-3xl font-extrabold text-foreground tracking-tight">
                    {dashboard.providerCount.toLocaleString()}
                  </div>
                  <Link
                    href="/console/admin/users?role=PROVIDER"
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
                  >
                    <span>Manage providers</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
                <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Store className="size-6" />
                </div>
              </CardContent>
            </Card>

            {/* Active vs Suspended Users */}
            <Card className="rounded-3xl border-border/70 hover:border-border transition-all shadow-xs">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    User Account Status
                  </span>
                  <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="size-4" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <UserCheck className="size-3.5" />
                    <span>{dashboard.activeUserCount} Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <UserX className="size-3.5" />
                    <span>{dashboard.suspendedUserCount} Suspended</span>
                  </div>
                </div>
                <Link
                  href="/console/admin/users"
                  className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                >
                  <span>Review user statuses</span>
                  <ArrowRight className="size-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="rounded-3xl border-border/70 hover:border-border transition-all shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Orders
                  </span>
                  <div className="text-3xl font-extrabold text-foreground tracking-tight">
                    {dashboard.totalOrderCount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {dashboard.activeMealCount} active meals
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {dashboard.activeCategoryCount} categories
                    </span>
                  </div>
                </div>
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="size-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 2: Order Status Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" />
                Order Status Distribution
              </h2>
              <Link
                href="/console/admin/orders"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span>View all orders</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(
                ['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as OrderStatus[]
              ).map((status) => {
                const config = STATUS_CONFIG[status];
                const count = dashboard.orderStatusCounts[status] || 0;
                const percentage =
                  dashboard.totalOrderCount > 0
                    ? Math.round((count / dashboard.totalOrderCount) * 100)
                    : 0;
                const Icon = config.icon;

                return (
                  <Link
                    key={status}
                    href={`/console/admin/orders?status=${status}`}
                    className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.99] group ${config.cardBg} ${config.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${config.textColor}`}>
                        {config.label}
                      </span>
                      <Icon className={`size-4 ${config.textColor} opacity-80 group-hover:opacity-100`} />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-foreground">{count}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="mt-2 w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          status === 'PLACED'
                            ? 'bg-sky-500'
                            : status === 'PREPARING'
                            ? 'bg-amber-500'
                            : status === 'READY'
                            ? 'bg-purple-500'
                            : status === 'DELIVERED'
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Recent Activity Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Recent Orders Table */}
            <Card className="rounded-3xl border-border/70 shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Receipt className="size-4 text-primary" />
                    Recent Platform Orders
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Latest orders submitted across all providers
                  </CardDescription>
                </div>
                <Link
                  href="/console/admin/orders"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-xs gap-1 rounded-xl"
                  )}
                >
                  <span>See All</span>
                  <ExternalLink className="size-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {dashboard.recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No orders have been recorded on the platform yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Order</TableHead>
                        <TableHead className="text-xs">Customer</TableHead>
                        <TableHead className="text-xs">Provider</TableHead>
                        <TableHead className="text-xs">Total</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboard.recentOrders.map((order) => (
                        <TableRow key={order.id} className="text-xs">
                          <TableCell className="font-semibold text-foreground py-3">
                            <Link
                              href={`/console/admin/orders?search=${order.orderNumber}`}
                              className="hover:underline text-primary"
                            >
                              {order.orderNumber}
                            </Link>
                            <div className="text-[10px] text-muted-foreground font-normal">
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarImage src={order.customer?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-[10px]">
                                  {order.customer?.fullName
                                    ? order.customer.fullName.substring(0, 2).toUpperCase()
                                    : 'CU'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[90px] font-medium text-foreground">
                                {order.customer?.fullName || 'Customer'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="truncate max-w-[100px] block font-medium text-foreground">
                              {order.provider?.name || 'Provider'}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-foreground py-3">
                            ৳{parseFloat(order.total || '0').toFixed(2)}
                          </TableCell>
                          <TableCell className="py-3">{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recent User Registrations Table */}
            <Card className="rounded-3xl border-border/70 shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    Recent Registrations
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Newly signed up customer and provider accounts
                  </CardDescription>
                </div>
                <Link
                  href="/console/admin/users"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-xs gap-1 rounded-xl"
                  )}
                >
                  <span>See All</span>
                  <ExternalLink className="size-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {dashboard.recentRegistrations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No new user registrations recorded.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">User</TableHead>
                        <TableHead className="text-xs">Role</TableHead>
                        <TableHead className="text-xs">Account Status</TableHead>
                        <TableHead className="text-xs">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboard.recentRegistrations.map((user) => (
                        <TableRow key={user.id} className="text-xs">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-7">
                                <AvatarImage src={user.profileImageUrl || undefined} />
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                  {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link
                                  href={`/console/admin/users?search=${encodeURIComponent(user.fullName)}`}
                                  className="font-semibold text-foreground hover:underline block truncate max-w-[130px]"
                                >
                                  {user.fullName}
                                </Link>
                                {user.provider && (
                                  <span className="text-[10px] text-muted-foreground block truncate max-w-[130px]">
                                    {user.provider.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-semibold uppercase ${
                                user.role === 'PROVIDER'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                              }`}
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            {user.status === 'ACTIVE' ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
                                <UserCheck className="size-3" /> Active
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold gap-1">
                                <UserX className="size-3" /> Suspended
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3">
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}