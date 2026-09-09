'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { getBackendAuthHeaders } from "@/lib/auth/backend-auth-headers";
import { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import { AuthUser, CurrentUserData, ProviderProfile } from "@/types/auth.type";
import { GetOrdersParams, Order, OrderStatus, ProviderOrder } from "@/types/order.type";
import { logoutAction as authLogoutAction } from "@/app/(auth)/logout_action";
import { setSessionIdentity } from "@/lib/auth/session-identity";
import {
  CreateProviderMealPayload,
  GetProviderMealsParams,
  ProviderMeal,
  UpdateProviderMealPayload,
} from "@/types/meal.type";

export {
  type CreateProviderMealPayload,
  type GetProviderMealsParams,
  type UpdateProviderMealPayload,
};

export const logoutAction = async (): Promise<void> => {
  await authLogoutAction();
};

export const getProviderProfile = async (): Promise<ApiResponse<CurrentUserData> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<CurrentUserData>("/api/profile", { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch profile",
    };
  }
};

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string | null;
  defaultDeliveryAddress?: string | null;
  profileImageUrl?: string | null;
}

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<ApiResponse<CurrentUserData> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<CurrentUserData>("/api/profile", payload, { headers });
    if (response.success && response.data?.user) {
      await setSessionIdentity({
        user: response.data.user,
        providerProfile: response.data.providerProfile ?? null,
      });
    }
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update profile",
    };
  }
};

export interface UpdateProviderProfilePayload {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string | null;
  openingHours?: string | null;
  acceptingOrders?: boolean;
}

export const updateProviderBusinessProfile = async (
  payload: UpdateProviderProfilePayload
): Promise<ApiResponse<{ providerProfile: ProviderProfile }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.description !== undefined) body.description = payload.description.trim();
    if (payload.address !== undefined) body.address = payload.address.trim();
    if (payload.phone !== undefined) body.phone = payload.phone.trim();
    if (payload.logoUrl !== undefined) {
      body.logoUrl = payload.logoUrl?.trim() ? payload.logoUrl.trim() : null;
    }
    if (payload.openingHours !== undefined) {
      body.openingHours = payload.openingHours?.trim() ? payload.openingHours.trim() : null;
    }
    if (payload.acceptingOrders !== undefined) {
      body.acceptingOrders = payload.acceptingOrders;
    }

    const response = await httpClient.patch<{ providerProfile: ProviderProfile }>(
      "/api/provider/profile",
      body,
      { headers }
    );

    if (response.success && response.data?.providerProfile) {
      const profileResponse = await httpClient.get<CurrentUserData>("/api/profile", { headers });
      if (profileResponse.success && profileResponse.data) {
        await setSessionIdentity(profileResponse.data);
      }
    }

    return response;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to update business profile",
    };
  }
};

export const getOrders = async (
  params?: GetOrdersParams
): Promise<ApiResponse<{ orders: ProviderOrder[]; meta?: any }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<{ orders: ProviderOrder[]; meta?: any }>("/api/provider/orders", { params, headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch orders",
    };
  }
};

export const getOrderById = async (
  orderId: string
): Promise<ApiResponse<Order> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<Order>(`/api/provider/orders/${orderId}`, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch order details",
    };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<ApiResponse<Order> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<Order>(
      `/api/provider/orders/${orderId}/status`,
      { status },
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update order status",
    };
  }
};


export const getProviderMeals = async (
  params?: GetProviderMealsParams
): Promise<ApiResponse<ProviderMeal[]> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();

    // When no specific availability or archived state is requested,
    // fetch all meals (available, unavailable, and archived) so the provider has a complete menu view.
    if (params?.availability === undefined && params?.archived === undefined) {
      const baseParams: Record<string, any> = {};
      if (params?.search) baseParams.search = params.search;
      if (params?.categoryId) baseParams.categoryId = params.categoryId;
      const limit = params?.limit ? String(params.limit) : "100";

      const [resAvail, resUnavail, resArchived] = await Promise.all([
        httpClient.get<ProviderMeal[]>("/api/provider/meals", {
          headers,
          params: { ...baseParams, availability: "true", archived: "false", limit },
        }),
        httpClient.get<ProviderMeal[]>("/api/provider/meals", {
          headers,
          params: { ...baseParams, availability: "false", archived: "false", limit },
        }),
        httpClient.get<ProviderMeal[]>("/api/provider/meals", {
          headers,
          params: { ...baseParams, availability: "false", archived: "true", limit },
        }),
      ]);

      const mealsMap = new Map<string, ProviderMeal>();
      const addMeals = (data: unknown) => {
        const list = Array.isArray(data)
          ? data
          : data && typeof data === "object" && Array.isArray((data as any).meals)
          ? (data as any).meals
          : [];
        for (const m of list) {
          mealsMap.set(m.id, m);
        }
      };

      if (resAvail.success) addMeals(resAvail.data);
      if (resUnavail.success) addMeals(resUnavail.data);
      if (resArchived.success) addMeals(resArchived.data);

      const combinedMeals = Array.from(mealsMap.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return {
        success: true,
        data: combinedMeals,
      };
    }

    const queryParams: Record<string, any> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.categoryId) queryParams.categoryId = params.categoryId;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    if (params?.archived !== undefined) {
      queryParams.archived = String(params.archived);
      if (params?.archived && params?.availability === undefined) {
        queryParams.availability = "false";
      }
    }
    if (params?.availability !== undefined) {
      queryParams.availability = String(params.availability);
      if (params?.archived === undefined) {
        queryParams.archived = "false";
      }
    }

    const response = await httpClient.get<ProviderMeal[]>("/api/provider/meals", {
      params: queryParams,
      headers,
    });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to fetch meals",
    };
  }
};

export const createProviderMeal = async (
  payload: CreateProviderMealPayload
): Promise<ApiResponse<ProviderMeal> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const body: Record<string, any> = {
      name: payload.name.trim(),
      description: payload.description.trim(),
      price: payload.price.trim(),
      categoryId: payload.categoryId,
    };
    if (payload.imageUrl !== undefined) {
      body.imageUrl = payload.imageUrl?.trim() || null;
    }
    if (payload.dietaryLabels !== undefined) {
      body.dietaryLabels = payload.dietaryLabels;
    }
    if (payload.preparationTimeMinutes !== undefined) {
      body.preparationTimeMinutes = payload.preparationTimeMinutes;
    }
    if (payload.isAvailable !== undefined) {
      body.isAvailable = payload.isAvailable;
    }

    const response = await httpClient.post<ProviderMeal>("/api/provider/meals", body, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to create meal",
    };
  }
};

export const updateProviderMeal = async (
  mealId: string,
  payload: UpdateProviderMealPayload
): Promise<ApiResponse<ProviderMeal> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.description !== undefined) body.description = payload.description.trim();
    if (payload.price !== undefined) body.price = payload.price.trim();
    if (payload.categoryId !== undefined) body.categoryId = payload.categoryId;
    if (payload.imageUrl !== undefined) body.imageUrl = payload.imageUrl?.trim() || null;
    if (payload.dietaryLabels !== undefined) body.dietaryLabels = payload.dietaryLabels;
    if (payload.preparationTimeMinutes !== undefined) body.preparationTimeMinutes = payload.preparationTimeMinutes;
    if (payload.updatedAt !== undefined) body.updatedAt = payload.updatedAt;

    const response = await httpClient.patch<ProviderMeal>(
      `/api/provider/meals/${mealId}`,
      body,
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to update meal",
    };
  }
};

export const updateMealAvailability = async (
  mealId: string,
  isAvailable: boolean
): Promise<ApiResponse<ProviderMeal> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<ProviderMeal>(
      `/api/provider/meals/${mealId}/availability`,
      { isAvailable },
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to update meal availability",
    };
  }
};

export const deleteProviderMeal = async (
  mealId: string
): Promise<ApiResponse<ProviderMeal> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.delete<ProviderMeal>(
      `/api/provider/meals/${mealId}`,
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to archive meal",
    };
  }
};

export const restoreProviderMeal = async (
  mealId: string
): Promise<ApiResponse<ProviderMeal> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<ProviderMeal>(
      `/api/provider/meals/${mealId}/restore`,
      {},
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to restore meal",
    };
  }
};

