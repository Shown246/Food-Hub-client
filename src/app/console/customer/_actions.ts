'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { getBackendAuthHeaders } from "@/lib/auth/backend-auth-headers";
import { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import { AuthUser } from "@/types/auth.type";
import { GetOrdersParams, Order } from "@/types/order.type";
import { logoutAction as authLogoutAction } from "@/app/(auth)/logout_action";

export const logoutAction = async (): Promise<void> => {
  await authLogoutAction();
};

export const getCustomerProfile = async (): Promise<ApiResponse<{ user: AuthUser }> | ApiErrorResponse> => {
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

export const updateCustomerProfile = async (
  payload: UpdateProfilePayload
): Promise<ApiResponse<{ user: AuthUser }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<{ user: AuthUser }>("/api/profile", payload, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update profile",
    };
  }
};

export const getCustomerOrders = async (
  params?: GetOrdersParams
): Promise<ApiResponse<{ orders: Order[]; meta?: any }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get< {orders: Order[]}>("/api/orders", { params, headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch orders",
    };
  }
};

export const getCustomerOrderById = async (
  orderId: string
): Promise<ApiResponse<Order> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<Order>(`/api/orders/${orderId}`, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch order details",
    };
  }
};

export const cancelCustomerOrder = async (
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
