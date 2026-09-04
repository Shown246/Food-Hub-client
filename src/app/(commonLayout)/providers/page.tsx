import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getProviders } from './_action';
import Providers from './Providers';

const ProvidersPage = async () => {
  const queryClient = new QueryClient();
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