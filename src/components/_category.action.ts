import { httpClient } from "@/lib/axios/httpClient";
import { Category } from "@/types/meal.type";

export const getCategories = async () => {
    const categories = await httpClient.get<Category[]>('/api/categories', {});
    return categories;
}