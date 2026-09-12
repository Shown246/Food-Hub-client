import { Order } from './order.type';

export interface CreateReviewPayload {
  orderId: string;
  mealId: string;
  rating: number; // 1 to 5
  comment?: string | null;
}

export interface UpdateReviewPayload {
  rating?: number; // 1 to 5
  comment?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  customer: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MealReviewItemState {
  rating: number; // 0 if unselected, 1-5 when selected
  comment: string;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
  error?: string | null;
}

export interface ReviewPromptContextType {
  openReviewModal: (orderOrId: string | Order) => void;
  closeReviewModal: () => void;
  dismissReview: (orderId: string) => void;
  isModalOpen: boolean;
  activeOrder: Order | null;
}
