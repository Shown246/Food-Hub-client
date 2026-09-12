'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getCustomerOrders, getDeliveredOrderDetails } from '@/app/console/customer/_actions';
import { Order, OrderStatus } from '@/types/order.type';
import { ReviewPromptContextType } from '@/types/review.type';
import { OrderReviewModal } from '@/components/reviews/OrderReviewModal';
import {
  isReviewDismissedOrCompleted,
  markReviewAsDismissed,
  markReviewAsCompleted,
} from '@/lib/review-storage';

const ReviewPromptContext = createContext<ReviewPromptContextType | null>(null);

export function useReviewPrompt(): ReviewPromptContextType {
  const context = useContext(ReviewPromptContext);
  if (!context) {
    throw new Error('useReviewPrompt must be used within a ReviewPromptProvider');
  }
  return context;
}

function extractOrdersList(res: any): Order[] {
  if (!res || !res.success || !res.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.orders)) return res.data.orders;
  return [];
}

interface ReviewPromptProviderProps {
  children: React.ReactNode;
}

export function ReviewPromptProvider({ children }: ReviewPromptProviderProps) {
  const { data: currentUser } = useCurrentUser();
  const isCustomer = currentUser?.user?.role === 'CUSTOMER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Status tracking refs
  const prevOrderStatusMapRef = useRef<Map<string, OrderStatus> | null>(null);
  const promptedOrdersRef = useRef<Set<string>>(new Set());

  // Reset tracking when user or role changes
  useEffect(() => {
    if (!isCustomer) {
      prevOrderStatusMapRef.current = null;
      promptedOrdersRef.current.clear();
      setIsModalOpen(false);
      setActiveOrder(null);
    }
  }, [isCustomer, currentUser?.user?.id]);

  // Fetch recent customer orders with smart polling
  const { data: ordersResponse } = useQuery({
    queryKey: ['customer-recent-orders'],
    queryFn: () => getCustomerOrders({ limit: 10, sort: 'newest' }),
    enabled: isCustomer,
    refetchInterval: (query) => {
      const orders = extractOrdersList(query.state.data);
      const hasActiveOrder = orders.some((order) =>
        ['PLACED', 'PREPARING', 'READY'].includes(order.status)
      );
      return hasActiveOrder ? 12000 : false;
    },
    refetchOnWindowFocus: true,
  });

  const openReviewModal = useCallback(async (orderOrId: string | Order) => {
    if (typeof orderOrId === 'string') {
      setIsModalOpen(true);
      setIsLoadingOrder(true);
      try {
        const res = await getDeliveredOrderDetails(orderOrId);
        if (res.success && res.data) {
          setActiveOrder(res.data);
        }
      } catch (err) {
        console.error('Failed to load order for review:', err);
      } finally {
        setIsLoadingOrder(false);
      }
    } else {
      setActiveOrder(orderOrId);
      setIsModalOpen(true);

      // If items aren't populated (e.g. from summary list), fetch complete order
      if (!orderOrId.items || orderOrId.items.length === 0) {
        setIsLoadingOrder(true);
        try {
          const res = await getDeliveredOrderDetails(orderOrId.id);
          if (res.success && res.data) {
            setActiveOrder(res.data);
          }
        } catch (err) {
          console.error('Failed to load order details for review:', err);
        } finally {
          setIsLoadingOrder(false);
        }
      }
    }
  }, []);

  const closeReviewModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveOrder(null);
    setIsLoadingOrder(false);
  }, []);

  const dismissReview = useCallback((orderId: string) => {
    markReviewAsDismissed(orderId);
    promptedOrdersRef.current.add(orderId);
    closeReviewModal();
  }, [closeReviewModal]);

  const completeReview = useCallback((orderId: string) => {
    markReviewAsCompleted(orderId);
    promptedOrdersRef.current.add(orderId);
  }, []);

  // Transition & Offline Delivery Detection
  useEffect(() => {
    if (!isCustomer || !ordersResponse || !ordersResponse.success) return;

    const orders = extractOrdersList(ordersResponse);
    if (orders.length === 0) return;

    const isOrderReviewed = (order: Order): boolean => {
      if (order.reviews && order.reviews.length > 0) return true;
      if (typeof order.averageRating === 'number') return true;
      return isReviewDismissedOrCompleted(order.id);
    };

    const prevMap = prevOrderStatusMapRef.current;
    const currentMap = new Map<string, OrderStatus>();
    orders.forEach((o) => currentMap.set(o.id, o.status));

    if (prevMap === null) {
      // First load for this session: Catch-up for offline delivery
      // Check newest delivered order within 48 hours
      const newestDelivered = orders.find((o) => o.status === 'DELIVERED');
      if (newestDelivered) {
        const deliveryDateStr =
          newestDelivered.deliveredAt || newestDelivered.updatedAt || newestDelivered.createdAt;
        const deliveryTimestamp = new Date(deliveryDateStr).getTime();
        const isWithin48h = Date.now() - deliveryTimestamp <= 48 * 60 * 60 * 1000;

        if (
          isWithin48h &&
          !isOrderReviewed(newestDelivered) &&
          !promptedOrdersRef.current.has(newestDelivered.id)
        ) {
          promptedOrdersRef.current.add(newestDelivered.id);
          openReviewModal(newestDelivered);
        }
      }
    } else {
      // Subsequent query updates: Detect live transition to DELIVERED
      for (const order of orders) {
        const prevStatus = prevMap.get(order.id);
        const isLiveTransition =
          prevStatus &&
          ['PLACED', 'PREPARING', 'READY'].includes(prevStatus) &&
          order.status === 'DELIVERED';

        if (
          isLiveTransition &&
          !isOrderReviewed(order) &&
          !promptedOrdersRef.current.has(order.id)
        ) {
          promptedOrdersRef.current.add(order.id);
          openReviewModal(order);
          break; // Prompt one order at a time
        }
      }
    }

    prevOrderStatusMapRef.current = currentMap;
  }, [ordersResponse, isCustomer, openReviewModal]);

  return (
    <ReviewPromptContext.Provider
      value={{
        openReviewModal,
        closeReviewModal,
        dismissReview,
        isModalOpen,
        activeOrder,
      }}
    >
      {children}
      <OrderReviewModal
        isOpen={isModalOpen}
        onClose={closeReviewModal}
        order={activeOrder}
        isLoadingOrder={isLoadingOrder}
        onDismiss={dismissReview}
        onCompleted={completeReview}
      />
    </ReviewPromptContext.Provider>
  );
}
