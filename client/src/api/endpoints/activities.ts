/**
 * Activities API endpoints
 */

import { API_BASE_URL, getHeaders, handleApiError } from "../config";

// Activity types
export interface Activity {
  type: string;
  title: string;
  description: string;
  count?: number;
  timestamp: string;
  priority: number;
}

export interface RecentActivitiesResponse {
  target_date: string;
  activities: Activity[];
}

/**
 * Get recent activities for the current organization
 */
export const getRecentActivities = async (): Promise<RecentActivitiesResponse> => {
  const url = `${API_BASE_URL}/analytics/recent-activities`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
}; 