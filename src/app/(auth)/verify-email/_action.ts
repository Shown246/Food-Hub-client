'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse } from "@/types/api.type";
import axios from "axios";

export interface VerifyEmailActionResult {
  success: boolean;
  message?: string;
  email?: string;
}

export interface ResendVerificationActionResult {
  success: boolean;
  message?: string;
}

export const verifyEmailAction = async (
  token: string
): Promise<VerifyEmailActionResult> => {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      message: "Verification token is required.",
    };
  }

  try {
    const response = await httpClient.post<{ verified: boolean; email: string; message: string }>(
      "/api/auth/verify-email",
      { token: token.trim() }
    );

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Email verification failed.",
      };
    }

    return {
      success: true,
      email: response.data?.email,
      message: response.data?.message || response.message || "Email verified successfully.",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const msg =
        errorData?.error?.message ||
        errorData?.message ||
        "The verification link is invalid or has expired.";
      return {
        success: false,
        message: msg,
      };
    }
    return {
      success: false,
      message: "Verification failed. Please try again.",
    };
  }
};

export const resendVerificationAction = async (
  email: string
): Promise<ResendVerificationActionResult> => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return {
      success: false,
      message: "Email address is required.",
    };
  }

  try {
    const response = await httpClient.post<{ sent: boolean; message: string }>(
      "/api/auth/resend-verification",
      { email: email.trim().toLowerCase() }
    );

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to resend verification email.",
      };
    }

    return {
      success: true,
      message:
        response.data?.message ||
        response.message ||
        "If an account exists with this email, a verification link has been sent.",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const msg =
        errorData?.error?.message ||
        errorData?.message ||
        "Failed to resend verification email. Please try again later.";
      return {
        success: false,
        message: msg,
      };
    }
    return {
      success: false,
      message: "Failed to resend verification email. Please try again later.",
    };
  }
};
