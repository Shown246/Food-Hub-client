import "server-only";

import axios from "axios";
import { cache } from "react";
import { httpClient } from "@/lib/axios/httpClient";
import { getBackendAuthHeaders } from "@/lib/auth/backend-auth-headers";
import type { CurrentUserData } from "@/types/auth.type";

export const getCurrentUser = cache(async (): Promise<CurrentUserData | null> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<CurrentUserData>("/api/auth/me", { headers });
    return response.success ? response.data : null;
  } catch (error) {
    if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
      return null;
    }
    throw error;
  }
});
