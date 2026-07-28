'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { getBackendAuthHeaders } from "@/lib/auth/backend-auth-headers";
import { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import { AuthUser } from "@/types/auth.type";
import { GetOrdersParams, Order, ProviderOrder } from "@/types/order.type";
import { logoutAction as authLogoutAction } from "@/app/(auth)/logout_action";
import { setSessionIdentity } from "@/lib/auth/session-identity";
import { ProviderMeal } from "@/types/meal.type";

export const logoutAction = async (): Promise<void> => {
  await authLogoutAction();
};

export const getProviderProfile = async (): Promise<ApiResponse<{ user: AuthUser }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<{ user: AuthUser }>("/api/profile", { headers });
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
): Promise<ApiResponse<{ user: AuthUser }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<{ user: AuthUser }>("/api/profile", payload, { headers });
    if (response.success && response.data?.user) {
      await setSessionIdentity({
        user: response.data.user,
        providerProfile: null,
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

export const getOrders = async (
  params?: GetOrdersParams
): Promise<ApiResponse<{ orders: ProviderOrder[]; meta?: any }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get< {orders: ProviderOrder[]}>("/api/provider/orders", { headers });
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

export const cancelOrder = async (
  orderId: string,
  reason?: string
): Promise<ApiResponse<Order> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<Order>(`/api/orders/${orderId}/cancel`, { reason }, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to cancel order",
    };
  }
};

export const getProviderMeals = async (
): Promise<ApiResponse<{ meals: ProviderMeal[]; meta?: any }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<{ meals: ProviderMeal[] }>("/api/provider/meals", { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch meals",
    };
  }
};
