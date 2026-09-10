import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { Categories } from "@/components/categories";
import { TopRatedMeals } from "@/components/home/top-rated-meals";
import { TopRatedProviders } from "@/components/home/top-rated-providers";
import { getMeals } from "./meals/_action";
import { getProviders } from "./providers/_action";

export default async function Home() {
  const queryClient = new QueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["meals", { limit: "16" }],
      queryFn: () => getMeals({ limit: "16" }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["providers"],
      queryFn: getProviders,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col">
        <HeroSection />
        <Suspense fallback={null}>
          <Categories />
        </Suspense>
        <TopRatedMeals />
        <TopRatedProviders />
      </div>
    </HydrationBoundary>
  );
}

