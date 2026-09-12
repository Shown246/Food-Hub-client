"use client";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  passwordSchema,
  ISignupInput,
} from "@/zod/auth.validation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signupAction } from "@/app/(auth)/signup/_action";
import { Eye, EyeOff, Loader2, User, Store, Mail, RotateCcw } from "lucide-react";
import { resendVerificationAction } from "@/app/(auth)/verify-email/_action";
import { z } from "zod";

export function SignupForm() {
  const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: (payload: ISignupInput) => signupAction(payload),
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER" as "CUSTOMER" | "PROVIDER",
      providerName: "",
      providerDescription: "",
      providerAddress: "",
      providerPhone: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const payload: ISignupInput =
          role === "CUSTOMER"
            ? {
                fullName: value.fullName,
                email: value.email,
                phone: value.phone,
                password: value.password,
                confirmPassword: value.confirmPassword,
                role: "CUSTOMER",
              }
            : {
                fullName: value.fullName,
                email: value.email,
                phone: value.phone,
                password: value.password,
                confirmPassword: value.confirmPassword,
                role: "PROVIDER",
                providerName: value.providerName,
                providerDescription: value.providerDescription,
                providerAddress: value.providerAddress,
                providerPhone: value.providerPhone,
              };

        const result = await mutateAsync(payload);
        if (!result.success) {
          setServerError(result.message || "Registration failed");
          return;
        }

        if (
          (result as any).requireVerification ||
          (result as any).emailVerified === false ||
          !(result as any).token
        ) {
          setVerificationPendingEmail(payload.email);
          return;
        }
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        console.error(error);
        setServerError("Registration failed. Please try again.");
      }
    },
  });

  const handleResend = async () => {
    if (!verificationPendingEmail) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationAction(verificationPendingEmail);
      setResendStatus({
        success: res.success,
        message:
          res.message ||
          (res.success
            ? "A fresh verification link has been sent to your email."
            : "Failed to resend verification email."),
      });
    } catch {
      setResendStatus({
        success: false,
        message: "Failed to resend verification email. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (verificationPendingEmail) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
          <Mail className="size-8" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a verification link to:
          </p>
          <div className="inline-block px-3 py-1.5 rounded-lg bg-muted text-sm font-semibold text-foreground break-all max-w-full">
            {verificationPendingEmail}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click the link in the email to activate your account and start using FoodHub. The link expires in 1 hour.
          </p>
        </div>

        {resendStatus && (
          <div
            className={cn(
              "w-full p-3 text-sm rounded-md font-medium text-center",
              resendStatus.success
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {resendStatus.message}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Resending link...
              </>
            ) : (
              <>
                <RotateCcw className="size-4" />
                Resend verification email
              </>
            )}
          </Button>

          <Link href="/login" className={cn(buttonVariants(), "w-full")}>
            Go to Sign in
          </Link>

          <button
            type="button"
            onClick={() => {
              setVerificationPendingEmail(null);
              setResendStatus(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 mt-2 cursor-pointer"
          >
            Need to change your email or details?
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      method="POST"
      action="#"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("flex flex-col gap-6")}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Join FoodHub as a customer or meal provider
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => {
              setRole("CUSTOMER");
              form.setFieldValue("role", "CUSTOMER");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all",
              role === "CUSTOMER"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="size-4" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("PROVIDER");
              form.setFieldValue("role", "PROVIDER");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all",
              role === "PROVIDER"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Store className="size-4" />
            Provider
          </button>
        </div>

        {/* Server Error Message */}
        {serverError && (
          <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive font-medium text-center">
            {serverError}
          </div>
        )}

        {/* User Full Name */}
        <form.Field
          name="fullName"
          validators={{
            onChange: z.string().min(1, "Full name is required"),
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Email */}
        <form.Field
          name="email"
          validators={{
            onChange: z.string().email("Invalid email address"),
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Phone */}
        <form.Field
          name="phone"
          validators={{
            onChange: z.string().min(1, "Phone number is required"),
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="+8801700000000"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Password */}
        <form.Field
          name="password"
          validators={{
            onChange: passwordSchema,
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldDescription>
                Must be 8-128 chars with 1 uppercase, 1 lowercase & 1 number.
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Confirm Password */}
        <form.Field
          name="confirmPassword"
          validators={{
            onChange: ({ value, fieldApi }) => {
              if (!value) return "Please confirm your password";
              if (value !== fieldApi.form.getFieldValue("password")) {
                return "Passwords do not match";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Provider Specific Fields */}
        {role === "PROVIDER" && (
          <div className="flex flex-col gap-4 border-t pt-4 mt-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Provider Profile
            </h2>

            <form.Field
              name="providerName"
              validators={{
                onChange: z.string().min(1, "Restaurant name is required"),
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="providerName">Restaurant / Business Name</FieldLabel>
                  <Input
                    id="providerName"
                    type="text"
                    placeholder="Tasty Bites Kitchen"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="providerDescription"
              validators={{
                onChange: z.string().min(1, "Description is required"),
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="providerDescription">Business Description</FieldLabel>
                  <Input
                    id="providerDescription"
                    type="text"
                    placeholder="Authentic home-cooked meals"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="providerAddress"
              validators={{
                onChange: z.string().min(1, "Address is required"),
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="providerAddress">Business Address</FieldLabel>
                  <Input
                    id="providerAddress"
                    type="text"
                    placeholder="123 Food Court, Dhanmondi, Dhaka"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="providerPhone"
              validators={{
                onChange: z.string().min(1, "Business phone is required"),
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="providerPhone">Business Phone</FieldLabel>
                  <Input
                    id="providerPhone"
                    type="tel"
                    placeholder="+8801711111111"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>
        )}

        {/* Submit Button */}
        <Field className="mt-2">
          <form.Subscribe
            selector={(s) => [s.canSubmit, s.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit} className="w-full">
                {isSubmitting ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  `Create ${role === "CUSTOMER" ? "Customer" : "Provider"} Account`
                )}
              </Button>
            )}
          </form.Subscribe>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 mr-2">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 font-medium">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
