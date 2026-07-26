export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  mealId: string;
  mealName?: string;
  name?: string;
  price: string | number;
  quantity: number;
  note?: string | null;
}

export interface OrderProviderSummary {
  id: string;
  name: string;
  logoUrl?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  providerId: string;
  status: OrderStatus;
  subtotal: string | number;
  deliveryFee: string | number;
  taxFee: string | number;
  serviceFee: string | number;
  total: string | number;
  itemCount?: number;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryInstructions?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: OrderProviderSummary;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface GetOrdersParams {
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
