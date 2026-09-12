'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerProfile,
  updateCustomerProfile,
  UpdateProfilePayload,
} from '../_actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Shield,
  Save,
  KeyRound,
} from 'lucide-react';
import { currentUserQueryKey } from '@/queries/current-user.query';
import { ChangePasswordCard } from '@/components/profile/change-password-card';

const customerProfileQueryKey = ['customer-profile'] as const;

export default function CustomerProfilePage() {
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultDeliveryAddress, setDefaultDeliveryAddress] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: profileResponse, isLoading, isError, refetch } = useQuery({
    queryKey: customerProfileQueryKey,
    queryFn: getCustomerProfile,
  });
  const user =
    profileResponse?.success && profileResponse.data
      ? profileResponse.data.user
      : undefined;

  // Initialize form state when profile is loaded
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setDefaultDeliveryAddress(user.defaultDeliveryAddress || '');
      setProfileImageUrl(user.profileImageUrl || '');
    }
  }, [user?.id]);

  // Mutation to update profile
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateCustomerProfile(payload),
    onSuccess: (res) => {
      if (res.success) {
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
        queryClient.setQueryData(customerProfileQueryKey, res);
        queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to update profile.' });
      }
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', message: err?.message || 'An unexpected error occurred.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    updateMutation.mutate({
      fullName: fullName.trim(),
      phone: phone.trim() || null,
      defaultDeliveryAddress: defaultDeliveryAddress.trim() || null,
      profileImageUrl: profileImageUrl.trim() || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1 rounded-2xl" />
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20 my-8 space-y-4">
        <AlertCircle className="size-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load profile</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          We encountered an error loading your profile information.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          View and manage your personal details and default delivery address.
        </p>
      </div>

      {/* Feedback Banner */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Overview Card */}
        <Card className="lg:col-span-1 border border-border/60 shadow-sm rounded-2xl overflow-hidden h-fit">
          <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-amber-500/10 p-6 flex flex-col items-center text-center border-b border-border/40">
            <Avatar className="size-24 border-4 border-background shadow-md mb-3">
              <AvatarImage src={profileImageUrl || user.profileImageUrl || undefined} alt={user.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'CU'}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-xl text-foreground truncate max-w-full">
              {user.fullName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-full">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="capitalize text-xs font-semibold px-2.5 py-0.5">
                <Shield className="size-3 mr-1 text-primary" />
                {user.role.toLowerCase()}
              </Badge>
              <Badge
                variant={user.status === 'ACTIVE' ? 'success' : 'destructive'}
                className="text-xs font-semibold px-2.5 py-0.5"
              >
                {user.status}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 space-y-4 text-xs md:text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                Email Address
              </span>
              <span className="font-medium text-foreground truncate max-w-[160px]" title={user.email}>
                {user.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                Phone Number
              </span>
              <span className="font-medium text-foreground">
                {user.phone || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Member Since
              </span>
              <span className="font-medium text-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>

            <div className="pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const el = document.getElementById('security-settings');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted"
              >
                <KeyRound className="size-3.5 text-primary" />
                <span>Change Password</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Edit Profile & Security Forms */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border border-border/60 shadow-sm rounded-2xl">

          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="size-5 text-primary" />
              Edit Personal Information
            </CardTitle>
            <CardDescription>
              Update your profile details. Note: Account email cannot be changed here.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-xl border-border/80 focus-visible:ring-primary"
                />
              </div>

              {/* Email (Disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  Email Address (Read-only)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="rounded-xl bg-muted/50 border-border/40 text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+8801700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border-border/80 focus-visible:ring-primary"
                />
              </div>

              {/* Default Delivery Address */}
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress" className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Default Delivery Address
                </Label>
                <textarea
                  id="deliveryAddress"
                  rows={3}
                  placeholder="Enter your street address, apartment, city, etc."
                  value={defaultDeliveryAddress}
                  onChange={(e) => setDefaultDeliveryAddress(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors resize-none"
                />
              </div>

              {/* Profile Image URL */}
              <div className="space-y-2">
                <Label htmlFor="profileImageUrl" className="text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-muted-foreground" />
                  Profile Image URL
                </Label>
                <Input
                  id="profileImageUrl"
                  type="url"
                  placeholder="https://images.example.com/avatar.png"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  className="rounded-xl border-border/80 focus-visible:ring-primary"
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end pt-2 pb-6 px-6 border-t border-border/40">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gap-2 font-semibold rounded-xl px-6"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change Password / Security Section */}
        <ChangePasswordCard />
      </div>
    </div>
  </div>
);
}

