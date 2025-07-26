import { API_BASE_URL, getHeaders } from "../config";

// Feedback insight interfaces
export interface FeedbackInsight {
  topic: string;
  count: number;
  percentage: number;
}

export interface FeedbackInsights {
  positive_mentions: FeedbackInsight[];
  areas_to_improve: FeedbackInsight[];
}

/**
 * Get feedback insights for dashboard
 * @returns Feedback insights with positive mentions and areas to improve
 */
export const getFeedbackInsights = async (): Promise<FeedbackInsights> => {
  const response = await fetch(`${API_BASE_URL}/analytics/feedback-insights`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch feedback insights");
  }

  return response.json();
}; 