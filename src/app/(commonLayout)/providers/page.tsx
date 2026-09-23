import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getProviders } from './_action';
import { getQueryClient } from '@/lib/query-client';
import Providers from './Providers';

const ProvidersPage = async () => {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Providers />
    </HydrationBoundary>
  )
}

export default ProvidersPage