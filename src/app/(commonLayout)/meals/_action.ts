import { httpClient } from "@/lib/axios/httpClient"
import { ProviderMeal } from "@/types/meal.type";

export interface GetMealsParams {
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  search?: string;
}

export const getMeals = async (params?: GetMealsParams) => {
  try {
    const meals = await httpClient.get<ProviderMeal[]>('/api/meals', {
      params: params ? { ...params } : undefined,
    });
    return meals;
  } catch (error) {
    return { success: false, data: [] as ProviderMeal[] };
  }
};