'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { IResetPasswordPayload, resetPasswordZodSchema } from "@/zod/auth.validation";
import axios from "axios";

export interface ResetPasswordActionResult {
  success: boolean;
  message: string;
}

export const resetPasswordAction = async (
  token: string,
  payload: IResetPasswordPayload
): Promise<ResetPasswordActionResult> => {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      message: "Reset token is missing or invalid.",
    };
  }

  const parsed = resetPasswordZodSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid password input.",
    };
  }

  try {
    const response = await httpClient.post<{ reset: boolean; message: string }>(
      "/api/auth/reset-password",
      {
        token: token.trim(),
        newPassword: parsed.data.password,
      }
    );

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Failed to reset password.",
      };
    }

    return {
      success: true,
      message:
        response.data?.message ||
        response.message ||
        "Your password has been reset successfully. You can now log in.",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const msg =
        errorData?.error?.message ||
        errorData?.message ||
        "The password reset link is invalid or has expired.";
      return {
        success: false,
        message: msg,
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
};
