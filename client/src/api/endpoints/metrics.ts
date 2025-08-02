/**
 * Metrics API endpoints and types
 */

import api from "../axios";

// Types for metrics API responses
export interface MetricsKPIResponse {
  total_minutes: number;
  total_calls: number;
  total_spend: number;
  average_nps: number | null;
  call_status_breakdown: Record<string, number>;
  call_types_breakdown: Record<string, number>;
  cost_by_category: Record<string, number>;
}

export interface CallTrendsResponse {
  trends: Array<{
    date: string;
    calls: number;
    minutes: number;
    cost: number;
  }>;
  date_range: string;
  total_days: number;
}

export interface PerformanceSummaryResponse {
  current_period: {
    calls: number;
    minutes: number;
    cost: number;
    avg_nps: number | null;
  };
  previous_period: {
    calls: number;
    minutes: number;
    cost: number;
    avg_nps: number | null;
  };
  changes: {
    calls_change: number;
    minutes_change: number;
    cost_change: number;
    nps_change: number;
  };
}

export interface CallAnalysisChartsResponse {
  reason_call_ended: Array<{
    reason: string;
    count: number;
    color: string;
  }>;
  avg_duration_by_type: Array<{
    type: string;
    duration: number;
    color: string;
  }>;
  cost_breakdown: Array<{
    type: string;
    cost: number;
    percentage: number;
  }>;
}

// API functions
export const metricsApi = {
  /**
   * Get dashboard KPI metrics
   */
  getDashboardKPIs: async (params?: {
    date_range?: string;
    start_date?: string;
    end_date?: string;
    group_by?: string;
    filter_type?: string;
  }): Promise<MetricsKPIResponse> => {
    const response = await api.get("/metrics/dashboard-kpis", {
      params,
    });
    return response.data;
  },

  /**
   * Get call trends over time
   */
  getCallTrends: async (params?: {
    date_range?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<CallTrendsResponse> => {
    const response = await api.get("/metrics/call-trends", {
      params,
    });
    return response.data;
  },

  /**
   * Get performance summary comparing periods
   */
  getPerformanceSummary: async (): Promise<PerformanceSummaryResponse> => {
    const response = await api.get("/metrics/performance-summary");
    return response.data;
  },

  /**
   * Get call analysis charts data
   */
  getCallAnalysisCharts: async (params?: {
    date_range?: string;
    start_date?: string;
    end_date?: string;
    group_by?: string;
    filter_type?: string;
  }): Promise<CallAnalysisChartsResponse> => {
    const response = await api.get("/metrics/call-analysis-charts", {
      params,
    });
    return response.data;
  },
};
