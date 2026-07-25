import { httpClient } from "@/lib/axios/httpClient"

export const getMeals = async () => {
  const meals = await httpClient.get('/api/meals', {});
  return meals;
}