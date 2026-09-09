import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getMeals } from './_action';
import { getCategories } from '@/components/_category.action';
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

  const categoryId =
    typeof resolvedParams?.categoryId === 'string'
      ? resolvedParams.categoryId
      : undefined;

  const provider =
    typeof resolvedParams?.provider === 'string'
      ? resolvedParams.provider
      : typeof resolvedParams?.providerId === 'string'
      ? resolvedParams.providerId
      : undefined;

  const dietary =
    typeof resolvedParams?.dietary === 'string'
      ? resolvedParams.dietary
      : undefined;

  const minPrice =
    typeof resolvedParams?.minPrice === 'string'
      ? resolvedParams.minPrice
      : undefined;

  const maxPrice =
    typeof resolvedParams?.maxPrice === 'string'
      ? resolvedParams.maxPrice
      : undefined;

  const sort =
    typeof resolvedParams?.sort === 'string'
      ? resolvedParams.sort
      : 'newest';

  const page =
    typeof resolvedParams?.page === 'string'
      ? resolvedParams.page
      : '1';

  const limit =
    typeof resolvedParams?.limit === 'string'
      ? resolvedParams.limit
      : '12';

  const search =
    typeof resolvedParams?.search === 'string'
      ? resolvedParams.search
      : undefined;

  const queryParams = {
    category,
    categoryId,
    provider,
    dietary,
    minPrice,
    maxPrice,
    sort,
    page,
    limit,
    search,
  };

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['meals', queryParams],
      queryFn: () => getMeals(queryParams),
    }),
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: getCategories,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <Meals />
      </Suspense>
    </HydrationBoundary>
  );
};

export default MealsPage;