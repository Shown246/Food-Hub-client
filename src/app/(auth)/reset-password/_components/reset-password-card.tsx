"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { resetPasswordAction } from "../_action";
import { resetPasswordZodSchema } from "@/zod/auth.validation";
import { cn } from "@/lib/utils";

export function ResetPasswordCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Password criteria indicators
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <XCircle className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Missing Reset Token</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing a valid token. Please request a new password reset link.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Request new reset link
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Password Reset Successful!</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been changed successfully. You can now sign in to your FoodHub account with your new credentials.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Continue to Sign In
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = resetPasswordZodSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please satisfy all password requirements.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await resetPasswordAction(token, { password, confirmPassword });
        if (result.success) {
          setIsSuccess(true);
        } else {
          setError(result.message || "Failed to reset password.");
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <KeyRound className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm rounded-lg bg-destructive/15 text-destructive font-medium flex flex-col gap-2">
            <p>{error}</p>
            {error.toLowerCase().includes("invalid") || error.toLowerCase().includes("expired") ? (
              <Link
                href="/forgot-password"
                className="text-xs underline underline-offset-4 hover:opacity-80"
              >
                Request a new password reset link &rarr;
              </Link>
            ) : null}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="new-password">New Password</FieldLabel>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {/* Password requirements checklist */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 text-muted-foreground">
          <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
            Password requirements:
          </p>
          <div className="grid grid-cols-2 gap-1">
            <div className={cn("flex items-center gap-1.5", hasMinLength && "text-emerald-600 dark:text-emerald-400")}>
              <Check className={cn("size-3.5", hasMinLength ? "opacity-100" : "opacity-30")} />
              <span>8+ characters</span>
            </div>
            <div className={cn("flex items-center gap-1.5", hasUpper && "text-emerald-600 dark:text-emerald-400")}>
              <Check className={cn("size-3.5", hasUpper ? "opacity-100" : "opacity-30")} />
              <span>1 uppercase letter</span>
            </div>
            <div className={cn("flex items-center gap-1.5", hasLower && "text-emerald-600 dark:text-emerald-400")}>
              <Check className={cn("size-3.5", hasLower ? "opacity-100" : "opacity-30")} />
              <span>1 lowercase letter</span>
            </div>
            <div className={cn("flex items-center gap-1.5", hasNumber && "text-emerald-600 dark:text-emerald-400")}>
              <Check className={cn("size-3.5", hasNumber ? "opacity-100" : "opacity-30")} />
              <span>1 number</span>
            </div>
          </div>
          {confirmPassword.length > 0 && (
            <div className={cn("flex items-center gap-1.5 pt-1", passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
              <Check className={cn("size-3.5", passwordsMatch ? "opacity-100" : "opacity-30")} />
              <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
            </div>
          )}
        </div>

        <Field>
          <Button
            type="submit"
            disabled={isPending || !passwordsMatch || !hasMinLength || !hasUpper || !hasLower || !hasNumber}
            className="w-full cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </Field>

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 text-foreground font-medium hover:text-primary"
          >
            Log in
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}
