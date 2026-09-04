import { httpClient } from "@/lib/axios/httpClient"
import { MealProvider } from "@/types/meal.type";

export const getProviders = async () => {
  try {
    const providers = await httpClient.get<MealProvider[]>('/api/providers', {});
    return providers;
  } catch (error) {
    return { success: false, data: [] as MealProvider[] };
  }
}