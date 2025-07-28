// Activity interfaces and API functions

import { API_BASE_URL, getHeaders } from "../config";

// Activity interface
export interface Activity {
  type: string;
  title: string;
  description: string;
  count: number;
  timestamp: string;
  priority: number;
  is_fallback?: boolean;
}

export interface RecentActivitiesResponse {
  activities: Activity[];
  date: string;
}

/**
 * Get recent activities for dashboard
 * @param date Optional specific date in YYYY-MM-DD format
 * @returns Recent activities response with activity list and date
 */
export const getRecentActivities = async (date?: string): Promise<RecentActivitiesResponse> => {
  const url = new URL(`${API_BASE_URL}/analytics/recent-activities`);
  
  if (date) {
    url.searchParams.append("date_str", date);
  }
  
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recent activities");
  }

  return response.json();
};
