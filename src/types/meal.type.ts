export interface ProviderMeal {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  imageUrl: string | null;
  dietaryLabels: string[];
  preparationTimeMinutes: number | null;
  isAvailable: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface CreateProviderMealPayload {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl?: string | null;
  dietaryLabels?: string[];
  preparationTimeMinutes?: number | null;
  isAvailable?: boolean;
}

export interface UpdateProviderMealPayload {
  name?: string;
  description?: string;
  price?: string;
  categoryId?: string;
  imageUrl?: string | null;
  dietaryLabels?: string[];
  preparationTimeMinutes?: number | null;
  updatedAt?: string;
}

export interface GetProviderMealsParams {
  search?: string;
  categoryId?: string;
  availability?: boolean;
  archived?: boolean;
  page?: number;
  limit?: number;
}


export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  image?: string | null;
  imageUrl?: string | null;
}

export interface MealProvider {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  openingHours?: string | null;
  acceptingOrders?: boolean;
  activeMealCount?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Meal {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  imageUrl?: string | null;
  dietaryLabels?: string[];
  preparationTimeMinutes?: number;
  isAvailable?: boolean;
  createdAt?: string;
  provider?: MealProvider;
  category?: Category;
  rating?: {
    average: number | null;
    count: number;
  };
}