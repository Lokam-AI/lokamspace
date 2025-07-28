import { useQuery } from "@tanstack/react-query";
import { getRecentActivities, RecentActivitiesResponse } from "../endpoints/activities";

/**
 * Hook to fetch recent activities for dashboard
 * @param date Optional specific date in YYYY-MM-DD format
 * @returns Query result with recent activities data
 */
export const useRecentActivities = (date?: string) =>
  useQuery<RecentActivitiesResponse>({
    queryKey: ["recent-activities", date],
    queryFn: () => getRecentActivities(date),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
