'use client';

import { ProviderMeal } from "@/types/meal.type";
import { getProviderMeals } from "../_actions";
import { useQuery } from "@tanstack/react-query";

const MenuPage = () => {
  const { data: mealsResponse, isLoading, error } = useQuery({
    queryKey: ["provider-meals"],
    queryFn: () => getProviderMeals(),
  });

  const mealsList = mealsResponse?.success ? (Array.isArray(mealsResponse.data) ? mealsResponse.data : []) : [];

  return (
    <div>
      <h1>Menu</h1>
      {isLoading && <p>Loading meals...</p>}
      {error && <p>Error loading meals: {error.message}</p>}
      {mealsResponse && !mealsResponse.success && (
        <p>Error loading meals: {mealsResponse.message}</p>
      )}
      {mealsList.map((meal: ProviderMeal) => (
        <div key={meal.id}>
          <h2>{meal.name}</h2>
          <p>{meal.description}</p>
          <p>{meal.price}</p>
          <p>{meal.preparationTimeMinutes}</p>
          <p>{String(meal.isAvailable)}</p>
          <p>{String(meal.isArchived)}</p>
          <p>{meal.createdAt}</p>
          <p>{meal.updatedAt}</p>
          <p>{meal.category?.name}</p>
        </div>
      ))}
    </div>  
  );
};

export default MenuPage;
