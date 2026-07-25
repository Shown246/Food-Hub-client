import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getMeals } from './_action';
import Meals from './Meals';

const MealsPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['meals'],
    queryFn: getMeals,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Meals />
    </HydrationBoundary>
  )
}

export default MealsPage