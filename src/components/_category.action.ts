import { httpClient } from "@/lib/axios/httpClient";
import { Category } from "@/types/meal.type";

export const getCategories = async () => {
    try {
        const categories = await httpClient.get<Category[]>('/api/categories', {});
        return categories;
    } catch (error) {
        return { success: false, data: [] as Category[] };
    }
}