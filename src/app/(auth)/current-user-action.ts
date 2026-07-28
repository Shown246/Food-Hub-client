"use server";

import axios from "axios";
import { getBackendAuthHeaders } from "@/lib/auth/backend-auth-headers";
import {
  deleteSessionIdentity,
  setSessionIdentity,
  toSessionIdentity,
} from "@/lib/auth/session-identity";
import { httpClient } from "@/lib/axios/httpClient";
import type { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import type { CurrentUserData, SessionIdentityData } from "@/types/auth.type";

export async function getCurrentUserAction(): Promise<
  ApiResponse<SessionIdentityData> | ApiErrorResponse
> {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<CurrentUserData>("/api/auth/me", {
      headers,
    });
    if (!response.success || !response.data) {
      await deleteSessionIdentity();
      return { success: false, message: "Not authenticated" };
    }
    await setSessionIdentity(response.data);
    return {
      success: true,
      data: toSessionIdentity(response.data),
    };
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      [401, 403].includes(error.response?.status ?? 0)
    ) {
      await deleteSessionIdentity();
      return { success: false, message: "Not authenticated" };
    }
    return { success: false, message: "Unable to load the current user" };
  }
}
