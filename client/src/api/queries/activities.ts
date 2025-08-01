/**
 * React Query hooks for activities
 */

import { useQuery } from "@tanstack/react-query";
import { getRecentActivities, Activity } from "../endpoints/activities";

// Query keys
export const activitiesQueryKeys = {
  all: ["activities"] as const,
  recent: () => [...activitiesQueryKeys.all, "recent"] as const,
};

/**
 * Hook to fetch recent activities
 */
export const useRecentActivities = () => {
  return useQuery({
    queryKey: activitiesQueryKeys.recent(),
    queryFn: getRecentActivities,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 