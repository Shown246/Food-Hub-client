import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getMeals } from './_action';
import Meals from './Meals';

interface MealsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const MealsPage = async ({ searchParams }: MealsPageProps) => {
  const resolvedParams = await searchParams;
  const category =
    typeof resolvedParams?.category === 'string'
      ? resolvedParams.category
      : undefined;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['meals', category],
    queryFn: () => getMeals(category ? { category } : undefined),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <Meals />
      </Suspense>
    </HydrationBoundary>
  );
};

export default MealsPage;