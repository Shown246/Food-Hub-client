'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { deleteCookie, getCookie } from "@/lib/cookieUtils";
import { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import { AuthUser } from "@/types/auth.type";
import { GetOrdersParams, Order } from "@/types/order.type";
import { redirect } from "next/navigation";

const getAuthHeaders = async () => {
  const sessionToken = await getCookie("better-auth.session_token");
  const accessToken = await getCookie("accessToken");
  const token = sessionToken || accessToken;

  const cookieHeader: string[] = [];
  if (sessionToken) cookieHeader.push(`better-auth.session_token=${sessionToken}`);
  if (accessToken) cookieHeader.push(`accessToken=${accessToken}`);

  const headers: Record<string, string> = {};
  if (cookieHeader.length > 0) {
    headers["Cookie"] = cookieHeader.join("; ");
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const logoutAction = async (): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await httpClient.post("/api/auth/logout", {}, { headers });
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    await deleteCookie("better-auth.session_token");
    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    await deleteCookie("userRole");
    redirect("/login");
  }
};



export const getCustomerProfile = async (): Promise<ApiResponse<{ user: AuthUser }> | ApiErrorResponse> => {
  try {
    const headers = await getAuthHeaders();
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
    const headers = await getAuthHeaders();
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
    const headers = await getAuthHeaders();
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
    const headers = await getAuthHeaders();
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
    const headers = await getAuthHeaders();
    const response = await httpClient.patch<Order>(`/api/orders/${orderId}/cancel`, { reason }, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to cancel order",
    };
  }
};
