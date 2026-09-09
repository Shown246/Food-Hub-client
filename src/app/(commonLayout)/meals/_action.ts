import { httpClient } from "@/lib/axios/httpClient";
import { Meal, PaginationMeta } from "@/types/meal.type";

export interface GetMealsParams {
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  provider?: string;
  providerId?: string;
  dietary?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sort?: string;
  page?: string | number;
  limit?: string | number;
}

export interface GetMealsResponse {
  success: boolean;
  data: Meal[];
  meta?: PaginationMeta;
  message?: string;
}

export const getMeals = async (params?: GetMealsParams): Promise<GetMealsResponse> => {
  try {
    const queryParams: Record<string, any> = {};

    if (params?.categoryId) {
      queryParams.categoryId = params.categoryId;
    } else if (params?.categorySlug) {
      queryParams.categorySlug = params.categorySlug;
    } else if (params?.category) {
      queryParams.categorySlug = params.category;
    }

    if (params?.search) queryParams.search = params.search;
    if (params?.provider || params?.providerId) {
      queryParams.providerId = params.providerId || params.provider;
    }
    if (params?.dietary) {
      queryParams.dietary = params.dietary.toLowerCase();
    }
    if (params?.minPrice !== undefined && params?.minPrice !== '') {
      queryParams.minPrice = String(params.minPrice);
    }
    if (params?.maxPrice !== undefined && params?.maxPrice !== '') {
      queryParams.maxPrice = String(params.maxPrice);
    }
    if (params?.sort) {
      queryParams.sort = params.sort;
    }
    if (params?.page) {
      queryParams.page = String(params.page);
    }
    if (params?.limit) {
      queryParams.limit = String(params.limit);
    }

    const response = await httpClient.get<Meal[]>('/api/meals', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    return response as unknown as GetMealsResponse;
  } catch (error) {
    return { success: false, data: [] as Meal[] };
  }
};