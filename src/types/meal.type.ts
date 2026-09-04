export interface ProviderMeal{
  id: string,
  name: string,
  slug: string,
  description: string,
  price: string | number,
  imageUrl: string | null,
  dietaryLabels: string[],
  preparationTimeMinutes: number,
  isAvailable: boolean,
  isArchived: boolean,
  createdAt: string,
  updatedAt: string,
  category: Category,
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
}