import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/app/(auth)/current-user-action";

export const currentUserQueryKey = ["auth", "current-user"] as const;

export const currentUserQueryOptions = queryOptions({
  queryKey: currentUserQueryKey,
  queryFn: async () => {
    const response = await getCurrentUserAction();
    if (!response.success || !response.data) {
      throw new Error(response.message ?? "Not authenticated");
    }
    return response.data;
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: false,
  refetchOnWindowFocus: true,
});
