import { httpClient } from "@/lib/axios/httpClient"
import { ProviderMeal } from "@/types/meal.type";

export const getMeals = async () => {
  const meals = await httpClient.get<ProviderMeal[]>('/api/meals', {});
  return meals;
}