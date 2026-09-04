import { httpClient } from "@/lib/axios/httpClient"
import { ProviderMeal } from "@/types/meal.type";

export interface GetMealsParams {
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  provider?: string;
  providerId?: string;
}

export const getMeals = async (params?: GetMealsParams) => {
  try {
    const queryParams: Record<string, any> = {};
    if (params?.category) queryParams.category = params.category;
    if (params?.categorySlug) queryParams.categorySlug = params.categorySlug;
    if (params?.categoryId) queryParams.categoryId = params.categoryId;
    if (params?.search) queryParams.search = params.search;
    if (params?.provider || params?.providerId) {
      queryParams.provider = params.provider || params.providerId;
    }

    const meals = await httpClient.get<ProviderMeal[]>('/api/meals', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    return meals;
  } catch (error) {
    return { success: false, data: [] as ProviderMeal[] };
  }
};