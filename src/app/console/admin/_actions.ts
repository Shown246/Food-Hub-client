'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { getBackendAuthHeaders } from "@/lib/auth/backend-auth-headers";
import { ApiErrorResponse, ApiResponse } from "@/types/api.type";
import {
  AdminDashboardData,
  AdminUserListItem,
  AdminUserDetail,
  AdminUserListParams,
  AdminCategory,
  CreateAdminCategoryPayload,
  UpdateAdminCategoryPayload,
  AdminOrderSummary,
  AdminOrderDetail,
  GetAdminOrdersParams,
  PaginationMeta,
} from "@/types/admin.type";

export type AdminListResponse<T> =
  | { success: true; data: T[]; meta?: PaginationMeta; message?: string }
  | ApiErrorResponse;

// ---------------- DASHBOARD ----------------

export const getAdminDashboard = async (): Promise<
  ApiResponse<AdminDashboardData> | ApiErrorResponse
> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<AdminDashboardData>("/api/admin/dashboard", { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to fetch admin dashboard data",
    };
  }
};

// ---------------- USERS ----------------

export const getAdminUsers = async (
  params?: AdminUserListParams
): Promise<AdminListResponse<AdminUserListItem>> => {
  try {
    const headers = await getBackendAuthHeaders();
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search.trim();
    if (params?.role) queryParams.role = params.role;
    if (params?.status) queryParams.status = params.status;
    if (params?.sort) queryParams.sort = params.sort;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    const response = (await httpClient.get<AdminUserListItem[]>("/api/admin/users", {
      headers,
      params: queryParams,
    })) as any;

    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to fetch users",
    };
  }
};

export const getAdminUserById = async (
  userId: string
): Promise<ApiResponse<AdminUserDetail> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<AdminUserDetail>(`/api/admin/users/${userId}`, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to fetch user details",
    };
  }
};

export const updateAdminUserStatus = async (
  userId: string,
  status: "ACTIVE" | "SUSPENDED"
): Promise<ApiResponse<AdminUserDetail> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.patch<AdminUserDetail>(
      `/api/admin/users/${userId}/status`,
      { status },
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to update user status",
    };
  }
};

// ---------------- CATEGORIES ----------------

export const getAdminCategories = async (): Promise<
  ApiResponse<AdminCategory[]> | ApiErrorResponse
> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<AdminCategory[]>("/api/admin/categories", { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to fetch categories",
    };
  }
};

export const createAdminCategory = async (
  payload: CreateAdminCategoryPayload
): Promise<ApiResponse<AdminCategory> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const body: Record<string, any> = {
      name: payload.name.trim(),
    };
    if (payload.description !== undefined) {
      body.description = payload.description?.trim() ? payload.description.trim() : null;
    }
    if (payload.displayOrder !== undefined) {
      body.displayOrder = payload.displayOrder;
    }
    if (payload.isActive !== undefined) {
      body.isActive = payload.isActive;
    }

    const response = await httpClient.post<AdminCategory>("/api/admin/categories", body, { headers });
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to create category",
    };
  }
};

export const updateAdminCategory = async (
  categoryId: string,
  payload: UpdateAdminCategoryPayload
): Promise<ApiResponse<AdminCategory> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.slug !== undefined) body.slug = payload.slug.trim();
    if (payload.description !== undefined) {
      body.description = payload.description?.trim() ? payload.description.trim() : null;
    }
    if (payload.displayOrder !== undefined) body.displayOrder = payload.displayOrder;
    if (payload.isActive !== undefined) body.isActive = payload.isActive;

    const response = await httpClient.patch<AdminCategory>(
      `/api/admin/categories/${categoryId}`,
      body,
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to update category",
    };
  }
};

export const deleteAdminCategory = async (
  categoryId: string
): Promise<ApiResponse<{ id: string; deleted: boolean }> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.delete<{ id: string; deleted: boolean }>(
      `/api/admin/categories/${categoryId}`,
      { headers }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to delete category",
    };
  }
};

// ---------------- ORDERS ----------------

export const getAdminOrders = async (
  params?: GetAdminOrdersParams
): Promise<AdminListResponse<AdminOrderSummary>> => {
  try {
    const headers = await getBackendAuthHeaders();
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search.trim();
    if (params?.status) queryParams.status = params.status;
    if (params?.customerId) queryParams.customerId = params.customerId;
    if (params?.providerId) queryParams.providerId = params.providerId;
    if (params?.dateFrom) queryParams.dateFrom = params.dateFrom;
    if (params?.dateTo) queryParams.dateTo = params.dateTo;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    const response = (await httpClient.get<AdminOrderSummary[]>("/api/admin/orders", {
      headers,
      params: queryParams,
    })) as any;

    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to fetch platform orders",
    };
  }
};

export const getAdminOrderById = async (
  orderId: string
): Promise<ApiResponse<AdminOrderDetail> | ApiErrorResponse> => {
  try {
    const headers = await getBackendAuthHeaders();
    const response = await httpClient.get<AdminOrderDetail>(`/api/admin/orders/${orderId}`, {
      headers,
    });
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.data?.error?.code || error?.response?.data?.code,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to fetch order details",
    };
  }
};
