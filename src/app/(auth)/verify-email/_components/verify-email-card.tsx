"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Mail,
  Loader2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { verifyEmailAction, resendVerificationAction } from "../_action";

type Status = "verifying" | "success" | "error" | "prompt";

export function VerifyEmailCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifiedParam = searchParams.get("verified");
  const errorParam = searchParams.get("error");

  const [status, setStatus] = useState<Status>(() => {
    if (verifiedParam === "true") return "success";
    if (errorParam) return "error";
    if (token) return "verifying";
    return "prompt";
  });

  const [message, setMessage] = useState<string>(() => {
    if (verifiedParam === "true") {
      return "Your email has been successfully verified! You can now sign in to your account.";
    }
    if (errorParam === "missing_token") {
      return "Verification token is missing. Please check your verification link.";
    }
    if (errorParam === "invalid_or_expired") {
      return "This verification link is invalid or has expired.";
    }
    return "";
  });

  const [resendEmail, setResendEmail] = useState("");
  const [isPendingResend, startTransition] = useTransition();
  const [resendResult, setResendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (verifiedParam === "true" || errorParam || !token) {
      return;
    }

    let isCancelled = false;

    async function runVerification() {
      setStatus("verifying");
      try {
        const result = await verifyEmailAction(token as string);
        if (isCancelled) return;

        if (result.success) {
          setStatus("success");
          setMessage(
            result.message ||
              "Your email has been successfully verified! You can now log in."
          );
        } else {
          setStatus("error");
          setMessage(
            result.message ||
              "This verification link is invalid or has expired."
          );
        }
      } catch {
        if (isCancelled) return;
        setStatus("error");
        setMessage("An unexpected error occurred while verifying your email.");
      }
    }

    runVerification();

    return () => {
      isCancelled = true;
    };
  }, [token, verifiedParam, errorParam]);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendResult(null);
    startTransition(async () => {
      try {
        const result = await resendVerificationAction(resendEmail.trim());
        setResendResult({
          success: result.success,
          message:
            result.message ||
            (result.success
              ? "If an account exists with this email, a verification link has been sent."
              : "Failed to send verification link."),
        });
      } catch {
        setResendResult({
          success: false,
          message: "Failed to send verification link. Please try again.",
        });
      }
    });
  };

  // State 1: Verifying
  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
          <Loader2 className="size-8 animate-spin" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Verifying your email
          </h1>
          <p className="text-sm text-muted-foreground">
            Please wait a moment while we verify your FoodHub account...
          </p>
        </div>
      </div>
    );
  }

  // State 2: Success
  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Email Verified!
          </h1>
          <p className="text-sm text-muted-foreground">
            {message ||
              "Your email has been successfully verified. You can now log into your account and start ordering fresh meals."}
          </p>
        </div>
        <Link
          href="/login"
          className={cn(buttonVariants(), "w-full flex items-center justify-center gap-2")}
        >
          Continue to Sign in
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  // State 3 & 4: Error or Prompt (Requires resending verification link)
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl",
          status === "error"
            ? "bg-destructive/15 text-destructive"
            : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
        )}
      >
        {status === "error" ? (
          <XCircle className="size-8" />
        ) : (
          <Mail className="size-8" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {status === "error"
            ? "Verification Failed"
            : "Verify your email"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {message ||
            "Please enter your email address below to receive a new verification link."}
        </p>
      </div>

      {resendResult && (
        <div
          className={cn(
            "w-full p-3 text-sm rounded-md font-medium text-center",
            resendResult.success
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-destructive/15 text-destructive"
          )}
        >
          {resendResult.message}
        </div>
      )}

      <form onSubmit={handleResend} className="flex flex-col gap-4 w-full text-left">
        <Field>
          <FieldLabel htmlFor="resend-email">Account Email</FieldLabel>
          <Input
            id="resend-email"
            type="email"
            required
            placeholder="m@example.com"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          disabled={isPendingResend || !resendEmail.trim()}
          className="w-full flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPendingResend ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending link...
            </>
          ) : (
            <>
              <RotateCcw className="size-4" />
              Resend verification link
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>Already verified?</span>
        <Link
          href="/login"
          className="underline underline-offset-4 text-foreground font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
