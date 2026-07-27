"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import type { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import type { CurrentUserData } from "@/types/auth.type";

export async function getCurrentUserAction(): Promise<
  ApiResponse<CurrentUserData> | ApiErrorResponse
> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Not authenticated" };
    }
    return { success: true, data: currentUser };
  } catch {
    return { success: false, message: "Unable to load the current user" };
  }
}
