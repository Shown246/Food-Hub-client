'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
} from '../_actions';
import {
  AdminUserListItem,
  AdminUserDetail,
  AdminUserListParams,
  PaginationMeta,
} from '@/types/admin.type';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Store,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Loader2,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Customer', value: 'CUSTOMER' },
  { label: 'Provider', value: 'PROVIDER' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name (A to Z)', value: 'name_asc' },
  { label: 'Name (Z to A)', value: 'name_desc' },
  { label: 'Recently Logged In', value: 'last_login_desc' },
];

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const initialSearch = searchParams.get('search') || '';
  const initialRole = (searchParams.get('role') as any) || '';
  const initialStatus = (searchParams.get('status') as any) || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Inspector Dialog state
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);

  // Status Action Modal state
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    user: AdminUserListItem | AdminUserDetail;
    nextStatus: 'ACTIVE' | 'SUSPENDED';
  } | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
    setSelectedRole('');
    setSelectedStatus('');
    setSelectedSort('newest');
    setCurrentPage(1);
  };

  // Fetch users list
  const queryParams: AdminUserListParams = {
    search: debouncedSearch || undefined,
    role: (selectedRole as any) || undefined,
    status: (selectedStatus as any) || undefined,
    sort: (selectedSort as any) || undefined,
    page: currentPage,
    limit: 10,
  };

  const {
    data: usersRes,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-users', queryParams],
    queryFn: () => getAdminUsers(queryParams),
  });

  const users: AdminUserListItem[] =
    usersRes && usersRes.success && Array.isArray(usersRes.data)
      ? usersRes.data
      : [];

  const meta: PaginationMeta | undefined =
    usersRes && usersRes.success ? usersRes.meta : undefined;

  // Fetch individual user detail for Inspector
  const { data: detailRes, isLoading: isDetailLoading } = useQuery({
    queryKey: ['admin-user-detail', inspectUserId],
    queryFn: () => (inspectUserId ? getAdminUserById(inspectUserId) : null),
    enabled: !!inspectUserId,
  });

  const detailedUser: AdminUserDetail | null =
    detailRes && detailRes.success && detailRes.data ? detailRes.data : null;

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: 'ACTIVE' | 'SUSPENDED';
    }) => updateAdminUserStatus(userId, status),
    onSuccess: (res, variables) => {
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `User account successfully ${
            variables.status === 'SUSPENDED' ? 'suspended' : 'reactivated'
          }.`,
        });
        setStatusConfirmTarget(null);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({
          queryKey: ['admin-user-detail', variables.userId],
        });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update user status.',
        });
      }
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        message: err?.message || 'An error occurred while updating user status.',
      });
    },
  });

  const handleConfirmStatusChange = () => {
    if (!statusConfirmTarget) return;
    statusMutation.mutate({
      userId: statusConfirmTarget.user.id,
      status: statusConfirmTarget.nextStatus,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="size-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              User Management
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Inspect customer and provider profiles, search accounts, and manage active statuses.
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

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl text-sm font-medium border transition-all animate-in fade-in duration-200 ${
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
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <Card className="rounded-2xl border-border/60 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name, email, or store..."
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

            {/* Role Filter */}
            <div>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter count & clear */}
          {(debouncedSearch || selectedRole || selectedStatus || selectedSort !== 'newest') && (
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted-foreground">
              <span>Filtered active results</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 text-xs gap-1 text-primary hover:text-primary rounded-lg"
              >
                <RotateCcw className="size-3" />
                <span>Reset Filters</span>
              </Button>
            </div>
          )}
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

      {/* Error state */}
      {isError && (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-muted/20 space-y-3">
          <AlertCircle className="size-10 text-destructive mx-auto" />
          <h3 className="text-base font-semibold">Unable to fetch users</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            An error occurred while loading user records. Please retry.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl">
            Retry Request
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && users.length === 0 && (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-muted/20 space-y-3">
          <Users className="size-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No users found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {debouncedSearch || selectedRole || selectedStatus
              ? 'No users match your current filter criteria. Try adjusting or clearing filters.'
              : 'There are no customer or provider users registered yet.'}
          </p>
          {(debouncedSearch || selectedRole || selectedStatus) && (
            <Button onClick={handleResetFilters} variant="outline" size="sm" className="rounded-xl text-xs">
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !isError && users.length > 0 && (
        <Card className="rounded-3xl border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User Profile</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Account Status</TableHead>
                  <TableHead className="text-xs">Contact & Login</TableHead>
                  <TableHead className="text-xs">Registered</TableHead>
                  <TableHead className="text-xs text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSuspended = user.status === 'SUSPENDED';

                  return (
                    <TableRow key={user.id} className="text-xs">
                      {/* User Info */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-border/50 shrink-0">
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground text-sm block truncate max-w-[180px]">
                              {user.fullName}
                            </span>
                            <span className="text-muted-foreground text-xs block truncate max-w-[180px]">
                              {user.email}
                            </span>
                            {user.providerProfile && (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block truncate max-w-[180px] mt-0.5">
                                Store: {user.providerProfile.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-3.5">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-semibold uppercase ${
                            user.role === 'PROVIDER'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>

                      {/* Account Status */}
                      <TableCell className="py-3.5">
                        {user.status === 'ACTIVE' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1 py-0.5 px-2">
                            <UserCheck className="size-3" /> Active
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs font-semibold gap-1 py-0.5 px-2">
                            <UserX className="size-3" /> Suspended
                          </Badge>
                        )}
                      </TableCell>

                      {/* Contact & Login */}
                      <TableCell className="py-3.5 text-muted-foreground">
                        <div className="space-y-0.5">
                          {user.phone ? (
                            <span className="block text-foreground font-medium">{user.phone}</span>
                          ) : (
                            <span className="text-[11px] italic text-muted-foreground">No phone</span>
                          )}
                          <span className="text-[11px] block">
                            {user.lastLoginAt
                              ? `Active ${new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}`
                              : 'Never logged in'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Registered Date */}
                      <TableCell className="py-3.5 text-muted-foreground">
                        <span>
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectUserId(user.id)}
                            className="h-8 px-2.5 rounded-xl gap-1 text-xs font-medium"
                          >
                            <Eye className="size-3.5" />
                            <span>Inspect</span>
                          </Button>

                          {isSuspended ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setStatusConfirmTarget({
                                  user,
                                  nextStatus: 'ACTIVE',
                                })
                              }
                              className="h-8 px-2.5 rounded-xl gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30"
                            >
                              <UserCheck className="size-3.5" />
                              <span>Reactivate</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setStatusConfirmTarget({
                                  user,
                                  nextStatus: 'SUSPENDED',
                                })
                              }
                              className="h-8 px-2.5 rounded-xl gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30"
                            >
                              <UserX className="size-3.5" />
                              <span>Suspend</span>
                            </Button>
                          )}
                        </div>
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
                <strong className="text-foreground">{meta.totalPages}</strong> ({meta.totalItems} users)
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

      {/* USER DETAIL INSPECTOR DIALOG */}
      <Dialog open={!!inspectUserId} onOpenChange={(open) => !open && setInspectUserId(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Shield className="size-5" />
              </span>
              <DialogTitle className="text-lg font-bold text-foreground">
                User Account Inspector
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Comprehensive account profile, verification status, and business data.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading || !detailedUser ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-14 border border-border">
                    <AvatarImage src={detailedUser.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                      {detailedUser.fullName ? detailedUser.fullName.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      {detailedUser.fullName}
                      <Badge
                        variant="secondary"
                        className={`text-[10px] uppercase font-semibold ${
                          detailedUser.role === 'PROVIDER'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {detailedUser.role}
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="size-3 text-muted-foreground shrink-0" />
                      {detailedUser.email}
                      {detailedUser.emailVerified && (
                        <span className="inline-flex items-center text-[10px] text-emerald-600 font-semibold ml-1">
                          ✓ Verified
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  {detailedUser.status === 'ACTIVE' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
                      <UserCheck className="size-3" /> Active
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs font-semibold gap-1">
                      <UserX className="size-3" /> Suspended
                    </Badge>
                  )}
                </div>
              </div>

              {/* Profile Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border/50 bg-card space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Phone className="size-3 text-primary" /> Contact Phone
                  </span>
                  <p className="font-semibold text-foreground">
                    {detailedUser.phone || 'Not provided'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/50 bg-card space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="size-3 text-primary" /> Last Login
                  </span>
                  <p className="font-semibold text-foreground">
                    {detailedUser.lastLoginAt
                      ? new Date(detailedUser.lastLoginAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Never'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/50 bg-card space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Calendar className="size-3 text-primary" /> Member Since
                  </span>
                  <p className="font-semibold text-foreground">
                    {new Date(detailedUser.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/50 bg-card space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <RefreshCw className="size-3 text-primary" /> Last Updated
                  </span>
                  <p className="font-semibold text-foreground">
                    {new Date(detailedUser.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              {detailedUser.defaultDeliveryAddress && (
                <div className="p-3.5 rounded-xl border border-border/50 bg-card text-xs space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <MapPin className="size-3 text-primary" /> Default Delivery Address
                  </span>
                  <p className="font-medium text-foreground">
                    {detailedUser.defaultDeliveryAddress}
                  </p>
                </div>
              )}

              {/* Provider Business Profile (if applicable) */}
              {detailedUser.providerProfile && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Store className="size-3.5 text-primary" /> Associated Provider Business
                  </h4>
                  <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">
                        {detailedUser.providerProfile.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold ${
                          detailedUser.providerProfile.acceptingOrders
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {detailedUser.providerProfile.acceptingOrders
                          ? 'Accepting Orders'
                          : 'Orders Paused'}
                      </Badge>
                    </div>
                    {detailedUser.providerProfile.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {detailedUser.providerProfile.description}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-muted-foreground">
                      {detailedUser.providerProfile.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{detailedUser.providerProfile.address}</span>
                        </div>
                      )}
                      {detailedUser.providerProfile.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="size-3 text-muted-foreground shrink-0" />
                          <span>{detailedUser.providerProfile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons in Inspector */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <div>
                  {detailedUser.status === 'ACTIVE' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInspectUserId(null);
                        setStatusConfirmTarget({
                          user: detailedUser,
                          nextStatus: 'SUSPENDED',
                        });
                      }}
                      className="rounded-xl text-xs gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 font-medium"
                    >
                      <UserX className="size-3.5" />
                      <span>Suspend Account</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInspectUserId(null);
                        setStatusConfirmTarget({
                          user: detailedUser,
                          nextStatus: 'ACTIVE',
                        });
                      }}
                      className="rounded-xl text-xs gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 font-medium"
                    >
                      <UserCheck className="size-3.5" />
                      <span>Reactivate Account</span>
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectUserId(null)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      <Dialog
        open={!!statusConfirmTarget}
        onOpenChange={(open) => !open && setStatusConfirmTarget(null)}
      >
        <DialogContent className="max-w-md p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  statusConfirmTarget?.nextStatus === 'SUSPENDED'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {statusConfirmTarget?.nextStatus === 'SUSPENDED' ? (
                  <UserX className="size-5" />
                ) : (
                  <UserCheck className="size-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {statusConfirmTarget?.nextStatus === 'SUSPENDED'
                    ? 'Suspend User Account'
                    : 'Reactivate User Account'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {statusConfirmTarget?.user.fullName} ({statusConfirmTarget?.user.email})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {statusConfirmTarget?.nextStatus === 'SUSPENDED' ? (
              <>
                <p>
                  Are you sure you want to <strong className="text-rose-600">suspend</strong> this account?
                </p>
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="size-4 shrink-0" /> Security Impact:
                  </p>
                  <p className="text-[11px] leading-normal opacity-90">
                    All active sessions for this user will be revoked immediately in the database.
                    They will be prevented from placing orders or managing their store until reactivated.
                  </p>
                </div>
              </>
            ) : (
              <p>
                Are you sure you want to <strong className="text-emerald-600">reactivate</strong> this account?
                The user will immediately regain access to log in and access FoodHub services.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusConfirmTarget(null)}
              disabled={statusMutation.isPending}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={statusMutation.isPending}
              onClick={handleConfirmStatusChange}
              className={`rounded-xl text-xs font-semibold gap-1.5 ${
                statusConfirmTarget?.nextStatus === 'SUSPENDED'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {statusMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : statusConfirmTarget?.nextStatus === 'SUSPENDED' ? (
                <>
                  <UserX className="size-3.5" />
                  <span>Yes, Suspend Account</span>
                </>
              ) : (
                <>
                  <UserCheck className="size-3.5" />
                  <span>Yes, Reactivate</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64 rounded-3xl" /></div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
