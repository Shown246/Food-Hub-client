'use client';

import React from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangePasswordCard } from '@/components/profile/change-password-card';
import {
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export default function AdminProfilePage() {
  const { data: sessionData, isLoading } = useCurrentUser();
  const user = sessionData?.user;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Admin Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your administrative identity and manage your security credentials.
        </p>
      </div>

      {/* Account Information Card */}
      <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">Account Details</CardTitle>
              <CardDescription className="text-xs">
                Your system administrator credentials
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar className="size-20 border-2 border-primary/20 shadow-sm">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.fullName || 'Admin'} />
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {user?.fullName || 'Administrator'}
                </h2>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs py-0.5">
                  ADMIN
                </Badge>
                {user?.status === 'ACTIVE' ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium text-xs py-0.5 gap-1">
                    <CheckCircle2 className="size-3" /> Active
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-medium text-xs py-0.5 gap-1">
                    <ShieldAlert className="size-3" /> {user?.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">ID: {user?.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" /> Email Address
              </span>
              <p className="text-sm font-semibold text-foreground break-all">
                {user?.email || 'N/A'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Security Status
              </span>
              <p className="text-sm font-semibold text-foreground">
                Active Administrator
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <ChangePasswordCard id="security-settings" />
    </div>
  );
}
