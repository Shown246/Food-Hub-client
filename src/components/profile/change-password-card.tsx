'use client';

import React, { useState, useTransition } from 'react';
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
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Shield,
} from 'lucide-react';
import { changePasswordAction } from '@/app/console/change-password-action';
import { cn } from '@/lib/utils';

interface ChangePasswordCardProps {
  className?: string;
  id?: string;
}

export function ChangePasswordCard({ className, id = 'security-settings' }: ChangePasswordCardProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Password criteria indicators
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword;
  const canSubmit =
    !isPending &&
    currentPassword.trim().length > 0 &&
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    passwordsMatch &&
    (currentPassword !== newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (currentPassword === newPassword) {
      setFeedback({
        type: 'error',
        message: 'The new password must be different from the current password.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'The new password and confirmation password do not match.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await changePasswordAction({
          currentPassword,
          newPassword,
          confirmPassword,
        });

        if (result.success) {
          setFeedback({
            type: 'success',
            message: result.message || 'Password changed successfully!',
          });
          // Reset form fields
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);
        } else {
          setFeedback({
            type: 'error',
            message: result.message || 'Failed to update password.',
          });
        }
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'An unexpected error occurred. Please try again.',
        });
      }
    });
  };

  return (
    <Card id={id} className={cn('border border-border/60 shadow-sm rounded-2xl scroll-mt-20', className)}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-foreground">
          <Shield className="size-5 text-primary" />
          Security & Password
        </CardTitle>
        <CardDescription>
          Update your account password to ensure your FoodHub account remains secure.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Inline Feedback Banner */}
          {feedback && (
            <div
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl text-sm font-medium border animate-in fade-in duration-200',
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              )}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="size-5 shrink-0" />
              ) : (
                <AlertCircle className="size-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Current Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <KeyRound className="size-3.5 text-muted-foreground" />
              Current Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                required
                className="rounded-xl border-border/80 pr-10 focus-visible:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer p-1"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* New Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <KeyRound className="size-3.5 text-muted-foreground" />
                New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  required
                  className="rounded-xl border-border/80 pr-10 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer p-1"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <KeyRound className="size-3.5 text-muted-foreground" />
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  required
                  className="rounded-xl border-border/80 pr-10 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer p-1"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements Helper Box */}
          <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 text-xs space-y-2 text-muted-foreground">
            <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
              Password Requirements:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div
                className={cn(
                  'flex items-center gap-1.5 transition-colors',
                  hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                )}
              >
                <Check className={cn('size-3.5 shrink-0', hasMinLength ? 'opacity-100' : 'opacity-30')} />
                <span>At least 8 characters</span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 transition-colors',
                  hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                )}
              >
                <Check className={cn('size-3.5 shrink-0', hasUpper ? 'opacity-100' : 'opacity-30')} />
                <span>1 uppercase letter</span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 transition-colors',
                  hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                )}
              >
                <Check className={cn('size-3.5 shrink-0', hasLower ? 'opacity-100' : 'opacity-30')} />
                <span>1 lowercase letter</span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 transition-colors',
                  hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                )}
              >
                <Check className={cn('size-3.5 shrink-0', hasNumber ? 'opacity-100' : 'opacity-30')} />
                <span>1 number</span>
              </div>
            </div>

            {/* Match & Difference Indicators */}
            {confirmPassword.length > 0 && (
              <div
                className={cn(
                  'flex items-center gap-1.5 pt-1 border-t border-border/40 font-medium',
                  passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                )}
              >
                <Check className={cn('size-3.5 shrink-0', passwordsMatch ? 'opacity-100' : 'opacity-30')} />
                <span>{passwordsMatch ? 'New passwords match' : 'New passwords do not match'}</span>
              </div>
            )}

            {newPassword.length > 0 && currentPassword.length > 0 && currentPassword === newPassword && (
              <p className="text-destructive font-medium text-[11px] pt-0.5">
                New password must be different from your current password.
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-2 pb-6 px-6 border-t border-border/40">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="gap-2 font-semibold rounded-xl px-6"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="size-4" />
                <span>Update Password</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
