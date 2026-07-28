'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.type";
import { ISignupResponse } from "@/types/auth.type";
import {
  customerSignupZodSchema,
  providerSignupZodSchema,
  ISignupInput,
  ISignupApiPayload,
} from "@/zod/auth.validation";
import { redirect } from "next/navigation";
import axios from "axios";
import { setSessionIdentity } from "@/lib/auth/session-identity";

export const signupAction = async (
  payload: ISignupInput
): Promise<ISignupResponse | ApiErrorResponse> => {
  let validationResult;
  if (payload.role === "CUSTOMER") {
    validationResult = customerSignupZodSchema.safeParse(payload);
  } else if (payload.role === "PROVIDER") {
    validationResult = providerSignupZodSchema.safeParse(payload);
  } else {
    return {
      success: false,
      message: "Invalid role selected",
    };
  }

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0]?.message || "Invalid Input";
    return {
      success: false,
      message: firstError,
    };
  }

  let apiPayload: ISignupApiPayload;
  if (payload.role === "CUSTOMER") {
    apiPayload = {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: "CUSTOMER",
    };
  } else {
    apiPayload = {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: "PROVIDER",
      providerName: payload.providerName,
      providerDescription: payload.providerDescription,
      providerAddress: payload.providerAddress,
      providerPhone: payload.providerPhone,
    };
  }

  try {
    const response = await httpClient.post<ISignupResponse>(
      "/api/auth/register",
      apiPayload,
      {}
    );

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Registration failed",
      };
    }

    if (!response.data) {
      return {
        success: false,
        message: "Registration failed",
      };
    }

    const { token, accessToken, refreshToken, user } = response.data;
    if (!user) {
      return {
        success: false,
        message: "User data not found",
      };
    }
    if (token) {
      await setTokenInCookies("better-auth.session_token", token);
    }
    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken);
    }
    if (refreshToken) {
      await setTokenInCookies("refreshToken", refreshToken);
    }
    await setSessionIdentity({
      user,
      providerProfile: response.data.providerProfile,
    });

    const role = user.role.toUpperCase();
    switch (role) {
      case "CUSTOMER":
        redirect("/console/customer");
      case "PROVIDER":
        redirect("/console/provider");
      case "ADMIN":
        redirect("/console/admin");
      default:
        redirect("/");
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const msg =
        errorData?.error?.message ||
        errorData?.message ||
        "Registration failed";
      return {
        success: false,
        message: msg,
      };
    }
    throw error;
  }
};
