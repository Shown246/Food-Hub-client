import { getCategories } from "./_category.action";
import { CategoriesSlider } from "./categories-slider";
import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";
import { getQueryClient } from "@/lib/query-client";
import { Category } from "@/types/meal.type";

export async function Categories() {
  const queryClient = getQueryClient();
  let categories;
  try {
    categories = await queryClient.fetchQuery({
      queryKey: ['categories'],
      queryFn: getCategories,
    });
  } catch {
    categories = { success: false, data: [] as Category[] };
  }

  const items = categories?.success ? (Array.isArray(categories.data) ? categories.data : []) : [];

  return (
    <div className="space-y-6 mt-16 md:mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Categories</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Explore our curated selection of meals, perfect for any taste.
          </p>
        </div>
      </div>

      {/* Client Slider Component */}
      <CategoriesSlider items={items} />
    </div>
  );
}
