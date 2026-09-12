'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { getBackendAuthHeaders } from "@/lib/auth/backend-auth-headers";
import { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import { AuthUser } from "@/types/auth.type";
import { GetOrdersParams, Order } from "@/types/order.type";
import { CreateReviewPayload, Review, UpdateReviewPayload } from "@/types/review.type";
import { logoutAction as authLogoutAction } from "@/app/(auth)/logout_action";
import { setSessionIdentity } from "@/lib/auth/session-identity";


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

export interface CreateCustomerOrderPayload {
  items: {
    mealId: string;
    quantity: number;
    note?: string;
  }[];
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions?: string | null;
}

export const createCustomerOrder = async (
  payload: CreateCustomerOrderPayload
): Promise<ApiResponse<Order> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.post<Order>("/api/orders", payload, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to place order",
    };
  }
};

export const getDeliveredOrderDetails = async (
  orderId: string
): Promise<ApiResponse<Order> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<Order>(`/api/orders/${orderId}`, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch delivered order details",
    };
  }
};

export const createCustomerReview = async (
  payload: CreateReviewPayload
): Promise<ApiResponse<Review> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.post<Review>(
      "/api/reviews",
      {
        orderId: payload.orderId,
        mealId: payload.mealId,
        rating: payload.rating,
        comment: payload.comment?.trim() ? payload.comment.trim() : undefined,
      },
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to submit review",
    };
  }
};

export const updateCustomerReview = async (
  reviewId: string,
  payload: UpdateReviewPayload
): Promise<ApiResponse<Review> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const body: Record<string, any> = {};
    if (payload.rating !== undefined) {
      body.rating = payload.rating;
    }
    if (payload.comment !== undefined) {
      body.comment = payload.comment?.trim() ? payload.comment.trim() : null;
    }

    const response = await httpClient.patch<Review>(
      `/api/reviews/${reviewId}`,
      body,
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update review",
    };
  }
};

export const deleteCustomerReview = async (
  reviewId: string
): Promise<ApiResponse<{ id: string; deleted: boolean }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.delete<{ id: string; deleted: boolean }>(
      `/api/reviews/${reviewId}`,
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to delete review",
    };
  }
};

