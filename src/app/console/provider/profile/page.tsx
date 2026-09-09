'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProviderProfile,
  updateProfile,
  updateProviderBusinessProfile,
  UpdateProfilePayload,
  UpdateProviderProfilePayload,
} from '../_actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Shield,
  Save,
  Power,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { currentUserQueryKey } from '@/queries/current-user.query';

const providerProfileQueryKey = ['provider-profile'] as const;

type ActiveTab = 'business' | 'personal';

export default function ProviderProfilePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('business');

  // Feedback notifications
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Business Profile Form State
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [acceptingOrders, setAcceptingOrders] = useState(true);

  // Personal Account Form State
  const [fullName, setFullName] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [defaultDeliveryAddress, setDefaultDeliveryAddress] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  // Fetch provider profile
  const {
    data: profileResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: providerProfileQueryKey,
    queryFn: getProviderProfile,
  });

  const profileData = profileResponse?.success ? profileResponse.data : undefined;
  const user = profileData?.user;
  const providerProfile = profileData?.providerProfile;

  // Initialize form states when profile loads
  useEffect(() => {
    if (providerProfile) {
      setBusinessName(providerProfile.name || '');
      setBusinessDescription(providerProfile.description || '');
      setBusinessAddress(providerProfile.address || '');
      setBusinessPhone(providerProfile.phone || '');
      setLogoUrl(providerProfile.logoUrl || '');
      setOpeningHours(providerProfile.openingHours || '');
      setAcceptingOrders(providerProfile.acceptingOrders ?? true);
    }
    if (user) {
      setFullName(user.fullName || '');
      setPersonalPhone(user.phone || '');
      setDefaultDeliveryAddress(user.defaultDeliveryAddress || '');
      setProfileImageUrl(user.profileImageUrl || '');
    }
  }, [user?.id, providerProfile?.id]);

  // Mutation to update business profile
  const updateBusinessMutation = useMutation({
    mutationFn: (payload: UpdateProviderProfilePayload) =>
      updateProviderBusinessProfile(payload),
    onSuccess: (res) => {
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Business information updated successfully!',
        });
        queryClient.invalidateQueries({ queryKey: providerProfileQueryKey });
        queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update business information.',
        });
      }
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        message: err?.message || 'An unexpected error occurred.',
      });
    },
  });

  // Mutation for one-click Accepting Orders toggle
  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: boolean) =>
      updateProviderBusinessProfile({ acceptingOrders: newStatus }),
    onMutate: (newStatus: boolean) => {
      setAcceptingOrders(newStatus);
    },
    onSuccess: (res) => {
      if (res.success) {
        const isAccepting = res.data?.providerProfile.acceptingOrders;
        setFeedback({
          type: 'success',
          message: isAccepting
            ? 'Store status updated: Now OPEN and accepting orders.'
            : 'Store status updated: Store is PAUSED. Not accepting new orders.',
        });
        queryClient.invalidateQueries({ queryKey: providerProfileQueryKey });
        queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update store status.',
        });
        if (providerProfile) {
          setAcceptingOrders(providerProfile.acceptingOrders);
        }
      }
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        message: err?.message || 'An unexpected error occurred.',
      });
      if (providerProfile) {
        setAcceptingOrders(providerProfile.acceptingOrders);
      }
    },
  });

  // Mutation to update personal profile
  const updatePersonalMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (res) => {
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Personal details updated successfully!',
        });
        queryClient.invalidateQueries({ queryKey: providerProfileQueryKey });
        queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update personal details.',
        });
      }
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        message: err?.message || 'An unexpected error occurred.',
      });
    },
  });

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    updateBusinessMutation.mutate({
      name: businessName.trim(),
      description: businessDescription.trim(),
      address: businessAddress.trim(),
      phone: businessPhone.trim(),
      logoUrl: logoUrl.trim() || null,
      openingHours: openingHours.trim() || null,
      acceptingOrders,
    });
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    updatePersonalMutation.mutate({
      fullName: fullName.trim(),
      phone: personalPhone.trim() || null,
      defaultDeliveryAddress: defaultDeliveryAddress.trim() || null,
      profileImageUrl: profileImageUrl.trim() || null,
    });
  };

  const handleQuickToggleOrders = () => {
    const nextStatus = !acceptingOrders;
    toggleStatusMutation.mutate(nextStatus);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[460px] lg:col-span-1 rounded-2xl" />
          <Skeleton className="h-[580px] lg:col-span-2 rounded-2xl" />
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
          We encountered an error loading your provider and business profile information.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  const currentBusinessName = providerProfile?.name || businessName || 'Your Business';
  const currentLogoUrl = logoUrl || providerProfile?.logoUrl || undefined;
  const currentAvatarUrl = profileImageUrl || user.profileImageUrl || undefined;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Provider Profile
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 font-semibold text-xs text-primary border-primary/20 bg-primary/10">
              Provider
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage your restaurant or kitchen business information and personal account details.
          </p>
        </div>

        {/* Top Quick Action: Order Status Indicator */}
        <div className="flex items-center gap-3 bg-muted/40 p-2 pl-3 rounded-2xl border border-border/60 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`size-2.5 rounded-full ${
                acceptingOrders
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span>{acceptingOrders ? 'Accepting Orders' : 'Store Paused'}</span>
          </div>
          <Button
            size="sm"
            variant={acceptingOrders ? 'outline' : 'default'}
            onClick={handleQuickToggleOrders}
            disabled={toggleStatusMutation.isPending}
            className="h-8 text-xs font-semibold rounded-xl gap-1.5"
          >
            {toggleStatusMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Power className="size-3.5" />
            )}
            <span>{acceptingOrders ? 'Pause Orders' : 'Open Store'}</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-200 ${
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Business & Account Overview Cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Business Overview Card */}
          <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-amber-500/10 p-6 flex flex-col items-center text-center border-b border-border/40">
              <Avatar className="size-24 border-4 border-background shadow-md mb-3 rounded-2xl">
                <AvatarImage src={currentLogoUrl} alt={currentBusinessName} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl rounded-2xl">
                  {currentBusinessName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="font-bold text-xl text-foreground truncate max-w-full">
                {currentBusinessName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 max-w-full">
                {providerProfile?.description || 'No description added yet.'}
              </p>

              {/* Order Status Badge */}
              <div className="mt-3">
                <Badge
                  variant={acceptingOrders ? 'success' : 'secondary'}
                  className={`text-xs font-semibold px-3 py-1 gap-1.5 ${
                    acceptingOrders
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      acceptingOrders ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                  <span>{acceptingOrders ? 'Open for Orders' : 'Temporarily Closed'}</span>
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 space-y-3.5 text-xs md:text-sm">
              <div className="flex items-start gap-3 py-1 border-b border-border/40">
                <Store className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Store Name</p>
                  <p className="font-medium text-foreground truncate">{currentBusinessName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1 border-b border-border/40">
                <Phone className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Business Contact</p>
                  <p className="font-medium text-foreground truncate">
                    {providerProfile?.phone || businessPhone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1 border-b border-border/40">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Kitchen / Store Address</p>
                  <p className="font-medium text-foreground text-xs leading-relaxed line-clamp-2">
                    {providerProfile?.address || businessAddress || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1">
                <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Operating Hours</p>
                  <p className="font-medium text-foreground text-xs leading-relaxed line-clamp-2">
                    {providerProfile?.openingHours || openingHours || 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Account Summary Card */}
          <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <User className="size-4 text-primary" />
                Owner Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs md:text-sm">
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <Avatar className="size-10 border border-border/60">
                  <AvatarImage src={currentAvatarUrl} alt={user.fullName} />
                  <AvatarFallback className="bg-muted text-foreground font-semibold text-xs">
                    {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'PV'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Shield className="size-3.5 text-primary" /> Role
                </span>
                <Badge variant="secondary" className="capitalize text-[11px] font-semibold px-2 py-0.5">
                  {user.role.toLowerCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> Member Since
                </span>
                <span className="font-medium text-foreground">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabbed Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Custom Tabs Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('business');
                setFeedback(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'business'
                  ? 'bg-background text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Store className="size-4 text-primary" />
              <span>Business Information</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('personal');
                setFeedback(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'personal'
                  ? 'bg-background text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <User className="size-4 text-primary" />
              <span>Personal Account</span>
            </button>
          </div>

          {/* TAB 1: Business Information Form */}
          {activeTab === 'business' && (
            <Card className="border border-border/60 shadow-sm rounded-2xl animate-in fade-in duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UtensilsCrossed className="size-5 text-primary" />
                      Restaurant / Kitchen Details
                    </CardTitle>
                    <CardDescription>
                      Update your public store information, contact numbers, hours, and order acceptance status.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleBusinessSubmit}>
                <CardContent className="space-y-6">
                  {/* Store Name & Store Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-xs font-semibold flex items-center gap-1.5">
                        <Store className="size-3.5 text-muted-foreground" />
                        Restaurant / Business Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="e.g. Bella Italia Kitchen"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        maxLength={150}
                        className="rounded-xl border-border/80 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessPhone" className="text-xs font-semibold flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted-foreground" />
                        Business Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="businessPhone"
                        type="tel"
                        placeholder="e.g. +8801700000000"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        required
                        maxLength={30}
                        className="rounded-xl border-border/80 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Kitchen / Business Address */}
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress" className="text-xs font-semibold flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      Kitchen / Business Address <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      id="businessAddress"
                      rows={2}
                      placeholder="e.g. House 42, Road 11, Block D, Banani, Dhaka"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      required
                      maxLength={1000}
                      className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors resize-none"
                    />
                  </div>

                  {/* Opening Hours & Accepting Orders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="openingHours" className="text-xs font-semibold flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground" />
                        Opening / Operating Hours
                      </Label>
                      <Input
                        id="openingHours"
                        type="text"
                        placeholder="e.g. Mon-Fri: 9:00 AM - 10:00 PM"
                        value={openingHours}
                        onChange={(e) => setOpeningHours(e.target.value)}
                        maxLength={1000}
                        className="rounded-xl border-border/80 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="acceptingOrdersToggle" className="text-xs font-semibold flex items-center gap-1.5">
                        <Power className="size-3.5 text-muted-foreground" />
                        Accepting Orders Status
                      </Label>
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-muted/20">
                        <div className="text-xs">
                          <span className="font-semibold text-foreground">
                            {acceptingOrders ? 'Accepting Orders' : 'Store Paused'}
                          </span>
                          <p className="text-muted-foreground text-[11px]">
                            {acceptingOrders
                              ? 'Customers can browse and place orders.'
                              : 'Temporarily paused for incoming orders.'}
                          </p>
                        </div>
                        <input
                          id="acceptingOrdersToggle"
                          type="checkbox"
                          checked={acceptingOrders}
                          onChange={(e) => setAcceptingOrders(e.target.checked)}
                          className="size-5 rounded-md border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Store Logo URL with Live Preview */}
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-xs font-semibold flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-muted-foreground" />
                      Store Logo URL
                    </Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="logoUrl"
                        type="url"
                        placeholder="https://images.example.com/store-logo.jpg"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="rounded-xl border-border/80 focus-visible:ring-primary flex-1"
                      />
                      {logoUrl && (
                        <div className="size-10 rounded-xl overflow-hidden border border-border/60 bg-muted/30 shrink-0">
                          <img
                            src={logoUrl}
                            alt="Logo preview"
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Direct HTTP or HTTPS URL to your restaurant or store logo image.
                    </p>
                  </div>

                  {/* Business Description */}
                  <div className="space-y-2">
                    <Label htmlFor="businessDescription" className="text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-muted-foreground" />
                      Business Description <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      id="businessDescription"
                      rows={4}
                      placeholder="Tell customers about your kitchen, signature meals, culinary philosophy, hygiene standards, and food experience..."
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      required
                      maxLength={3000}
                      className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors resize-none"
                    />
                    <div className="flex justify-end">
                      <span className="text-[11px] text-muted-foreground">
                        {businessDescription.length}/3000 characters
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end pt-3 pb-6 px-6 border-t border-border/40">
                  <Button
                    type="submit"
                    disabled={updateBusinessMutation.isPending}
                    className="gap-2 font-semibold rounded-xl px-6"
                  >
                    {updateBusinessMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Saving Business Info...</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>Save Business Info</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* TAB 2: Personal Account Form */}
          {activeTab === 'personal' && (
            <Card className="border border-border/60 shadow-sm rounded-2xl animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="size-5 text-primary" />
                  Owner Personal Information
                </CardTitle>
                <CardDescription>
                  Update your owner profile details and contact settings. Note: Account login email cannot be modified here.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handlePersonalSubmit}>
                <CardContent className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold flex items-center gap-1.5">
                      <User className="size-3.5 text-muted-foreground" />
                      Owner Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      maxLength={100}
                      className="rounded-xl border-border/80 focus-visible:ring-primary"
                    />
                  </div>

                  {/* Email (Disabled / Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
                      <Mail className="size-3.5 text-muted-foreground" />
                      Login Email Address (Read-only)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="rounded-xl bg-muted/50 border-border/40 text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Personal Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="personalPhone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground" />
                      Personal Phone Number
                    </Label>
                    <Input
                      id="personalPhone"
                      type="tel"
                      placeholder="+8801700000000"
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value)}
                      maxLength={30}
                      className="rounded-xl border-border/80 focus-visible:ring-primary"
                    />
                  </div>

                  {/* Default Delivery Address */}
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress" className="text-xs font-semibold flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      Personal Delivery Address
                    </Label>
                    <textarea
                      id="deliveryAddress"
                      rows={2}
                      placeholder="Enter your personal residential or delivery address"
                      value={defaultDeliveryAddress}
                      onChange={(e) => setDefaultDeliveryAddress(e.target.value)}
                      maxLength={1000}
                      className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors resize-none"
                    />
                  </div>

                  {/* Profile Image URL with preview */}
                  <div className="space-y-2">
                    <Label htmlFor="profileImageUrl" className="text-xs font-semibold flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-muted-foreground" />
                      Owner Profile Image URL
                    </Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="profileImageUrl"
                        type="url"
                        placeholder="https://images.example.com/owner-avatar.png"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        className="rounded-xl border-border/80 focus-visible:ring-primary flex-1"
                      />
                      {profileImageUrl && (
                        <div className="size-10 rounded-full overflow-hidden border border-border/60 bg-muted/30 shrink-0">
                          <img
                            src={profileImageUrl}
                            alt="Avatar preview"
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end pt-3 pb-6 px-6 border-t border-border/40">
                  <Button
                    type="submit"
                    disabled={updatePersonalMutation.isPending}
                    className="gap-2 font-semibold rounded-xl px-6"
                  >
                    {updatePersonalMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Saving Personal Details...</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>Save Personal Changes</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
