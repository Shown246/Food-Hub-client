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
      : typeof resolvedParams?.categorySlug === 'string'
      ? resolvedParams.categorySlug
      : undefined;
  const provider =
    typeof resolvedParams?.provider === 'string'
      ? resolvedParams.provider
      : typeof resolvedParams?.providerId === 'string'
      ? resolvedParams.providerId
      : undefined;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['meals', { category, provider }],
    queryFn: () => getMeals({ category, provider }),
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