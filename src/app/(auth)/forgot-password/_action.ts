'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { forgotPasswordZodSchema } from "@/zod/auth.validation";
import axios from "axios";

export interface ForgotPasswordActionResult {
  success: boolean;
  message: string;
}

export const forgotPasswordAction = async (
  email: string
): Promise<ForgotPasswordActionResult> => {
  const parsed = forgotPasswordZodSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Please enter a valid email address.",
    };
  }

  try {
    const response = await httpClient.post<{ sent: boolean; message: string }>(
      "/api/auth/forgot-password",
      { email: parsed.data.email.trim().toLowerCase() }
    );

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to send password reset link.",
      };
    }

    return {
      success: true,
      message:
        response.data?.message ||
        response.message ||
        "If an account exists with this email, a password reset link has been sent.",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const msg =
        errorData?.error?.message ||
        errorData?.message ||
        "Failed to send password reset link. Please try again later.";
      return {
        success: false,
        message: msg,
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
};
