import { OrderStatus } from "./order.type";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ---------------- DASHBOARD TYPES ----------------

export interface AdminRecentOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string;
  itemCount: number;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
  };
  provider: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export interface AdminRecentRegistration {
  id: string;
  fullName: string;
  role: "CUSTOMER" | "PROVIDER";
  status: "ACTIVE" | "SUSPENDED";
  profileImageUrl: string | null;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    logoUrl: string | null;
  } | null;
}

export interface AdminDashboardData {
  customerCount: number;
  providerCount: number;
  activeUserCount: number;
  suspendedUserCount: number;
  totalOrderCount: number;
  orderStatusCounts: Record<OrderStatus, number>;
  activeMealCount: number;
  activeCategoryCount: number;
  recentOrders: AdminRecentOrder[];
  recentRegistrations: AdminRecentRegistration[];
}

// ---------------- USER MANAGEMENT TYPES ----------------

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "PROVIDER";
  status: "ACTIVE" | "SUSPENDED";
  profileImageUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  providerProfile: {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    logoUrl: string | null;
    openingHours: string | null;
    acceptingOrders: boolean;
  } | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  emailVerified: boolean;
  defaultDeliveryAddress: string | null;
  updatedAt: string;
}

export interface AdminUserListParams {
  search?: string;
  role?: "CUSTOMER" | "PROVIDER";
  status?: "ACTIVE" | "SUSPENDED";
  sort?: "newest" | "oldest" | "name_asc" | "name_desc" | "last_login_desc";
  page?: number;
  limit?: number;
}

// ---------------- CATEGORY MANAGEMENT TYPES ----------------

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  mealCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminCategoryPayload {
  name: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateAdminCategoryPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

// ---------------- ORDER MANAGEMENT TYPES ----------------

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  subtotal: string;
  deliveryFee: string;
  tax: string;
  serviceFee: string;
  total: string;
  itemCount: number;
  cancelledAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
  };
  provider: {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    logoUrl: string | null;
    openingHours: string | null;
    acceptingOrders: boolean;
  };
  reviews?: Array<{
    id: string;
    mealId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
  averageRating?: number | null;
}

export interface AdminOrderItem {
  id: string;
  mealId: string;
  mealName: string;
  unitPrice: string;
  quantity: number;
  itemNote: string | null;
  lineTotal: string;
}

export interface AdminOrderStatusHistoryItem {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorRole: "CUSTOMER" | "PROVIDER" | "ADMIN" | "SYSTEM";
  note: string | null;
  createdAt: string;
  actor: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
  } | null;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions: string | null;
  subtotal: string;
  deliveryFee: string;
  tax: string;
  serviceFee: string;
  total: string;
  cancellationReason: string | null;
  cancelledAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
  };
  provider: {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    logoUrl: string | null;
    openingHours: string | null;
    acceptingOrders: boolean;
  };
  items: AdminOrderItem[];
  statusHistory: AdminOrderStatusHistoryItem[];
  reviews?: Array<{
    id: string;
    mealId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
  averageRating?: number | null;
}

export interface GetAdminOrdersParams {
  search?: string;
  status?: OrderStatus;
  customerId?: string;
  providerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
