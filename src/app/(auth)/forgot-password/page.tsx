"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Mail, ArrowRight, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { forgotPasswordAction } from "./_action";
import { forgotPasswordZodSchema } from "@/zod/auth.validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = forgotPasswordZodSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await forgotPasswordAction(email);
        if (result.success) {
          setIsSubmitted(true);
        } else {
          setError(result.message || "Failed to send reset link.");
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            aria-label="FoodHub home"
          >
            <span className="relative grid size-10 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <span className="absolute inset-0 bg-linear-to-t from-black/10 to-white/20" />
              <ShoppingBag aria-hidden="true" className="relative size-5" strokeWidth={2.25} />
            </span>
            <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Food<span className="text-orange-500">Hub</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {isSubmitted ? (
              <div className="flex flex-col items-center text-center gap-6 py-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                  <p className="text-sm text-muted-foreground">
                    If an account exists with <strong className="text-foreground">{email}</strong>, we have sent a password reset link. Please check your inbox and spam folder.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <Link
                    href="/login"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Return to Sign In
                    <ArrowRight className="size-4" />
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setError(null);
                    }}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="size-4" />
                    Resend to another email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <Mail className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Forgot your password?</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      Enter your email address below and we&apos;ll send you a link to reset your password.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 text-sm rounded-lg bg-destructive/15 text-destructive font-medium">
                      {error}
                    </div>
                  )}

                  <Field>
                    <FieldLabel htmlFor="forgot-email">Email Address</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      required
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      disabled={isPending || !email.trim()}
                      className="w-full cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          Sending reset link...
                        </>
                      ) : (
                        "Send Reset Link"
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
            )}
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/login.webp"
          alt="FoodHub Forgot Password"
          fill
          priority
          sizes="50vw"
          className="object-cover dark:brightness-[0.5]"
        />
      </div>
    </div>
  );
}
