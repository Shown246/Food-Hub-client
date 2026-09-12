"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IloginPayload, loginZodSchema } from "@/zod/auth.validation";
import { useMutation } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import Link from "next/link"
import { useSearchParams } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { loginAction } from "@/app/(auth)/login/_action";
import { resendVerificationAction } from "@/app/(auth)/verify-email/_action";
import { Eye, EyeOff, Loader2, RotateCcw } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: IloginPayload) => loginAction(payload, callbackUrl)
  })
  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setUnverifiedEmail(null);
      setResendStatus(null);
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          if ((result as any).code === "EMAIL_NOT_VERIFIED") {
            setUnverifiedEmail(value.email);
            setServerError(
              result.message || "Please verify your email address before logging in."
            );
          } else {
            setServerError(result.message || "LogIn Failed");
          }
          return;
        }
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        console.log(error);
        setServerError("LogIn Failed");
      }
    }
  })

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationAction(unverifiedEmail);
      setResendStatus({
        success: res.success,
        message:
          res.message ||
          (res.success
            ? "Verification email resent! Check your inbox."
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
    className={cn("flex flex-col gap-6")}>
    <FieldGroup>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      {/* Server Error Message */}
      {serverError && (
        <div className="p-4 text-sm rounded-lg bg-destructive/15 text-destructive font-medium flex flex-col gap-2">
          <p>{serverError}</p>
          {unverifiedEmail && (
            <div className="mt-1 pt-2 border-t border-destructive/20 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="w-full text-xs h-8 border-destructive/30 hover:bg-destructive/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isResending ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-3" />
                    Resend verification email
                  </>
                )}
              </Button>
              {resendStatus && (
                <p
                  className={cn(
                    "text-xs font-normal text-center",
                    resendStatus.success
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  )}
                >
                  {resendStatus.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      <form.Field
        name="email"
        validators={{ onChange: loginZodSchema.shape.email }}
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
      <form.Field
        name="password"
        validators={{ onChange: loginZodSchema.shape.password }}
      >
        {(field) => (
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
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
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>
      <Field>
        <form.Subscribe
          selector={(s) => [s.canSubmit, s.isSubmitting] as const}
        >
          {
            ([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  </>
                ) :
                  <>
                    Log In
                  </>
                }
              </Button>
            )
          }
        </form.Subscribe>
      </Field>
      <FieldSeparator>Or continue with</FieldSeparator>
      <Field>
        <Button variant="outline" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Login with GitHub
        </Button>
        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </FieldDescription>
      </Field>
    </FieldGroup>
  </form>
)
}
