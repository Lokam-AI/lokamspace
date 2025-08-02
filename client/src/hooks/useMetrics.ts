/**
 * Custom hooks for metrics data fetching using React Query
 */

import { useQuery } from "@tanstack/react-query";
import { metricsApi, MetricsKPIResponse, CallTrendsResponse, PerformanceSummaryResponse, CallAnalysisChartsResponse } from "../api/endpoints/metrics";

// Query keys for React Query cache management
export const metricsQueryKeys = {
  all: ['metrics'] as const,
  kpis: (params?: { date_range?: string; start_date?: string; end_date?: string; group_by?: string; filter_type?: string }) => 
    [...metricsQueryKeys.all, 'kpis', params] as const,
  trends: (params?: { date_range?: string; start_date?: string; end_date?: string }) => 
    [...metricsQueryKeys.all, 'trends', params] as const,
  performance: () => [...metricsQueryKeys.all, 'performance'] as const,
  callAnalysisCharts: (params?: { date_range?: string; start_date?: string; end_date?: string; group_by?: string; filter_type?: string }) => 
    [...metricsQueryKeys.all, 'callAnalysisCharts', params] as const,
};

/**
 * Hook to fetch dashboard KPI metrics
 */
export const useMetricsKPIs = (params?: {
  date_range?: string;
  start_date?: string;
  end_date?: string;
  group_by?: string;
  filter_type?: string;
}) => {
  return useQuery({
    queryKey: metricsQueryKeys.kpis(params),
    queryFn: () => metricsApi.getDashboardKPIs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch call trends data
 */
export const useCallTrends = (params?: { 
  date_range?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: metricsQueryKeys.trends(params),
    queryFn: async () => {
      // Use the provided params to get data for the selected date range
      const response = await metricsApi.getCallTrends(params);
      
      // Generate a complete date range to ensure we have entries for every day
      let startDate, endDate;
      
      if (params?.start_date && params?.end_date) {
        startDate = new Date(params.start_date);
        endDate = new Date(params.end_date);
      } else {
        // Default to last 30 days if no date range is specified
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);
      }
      
      // Create a map of existing data points
      const dataMap = new Map();
      response.trends.forEach(trend => {
        dataMap.set(trend.date, trend);
      });
      
      // Generate a complete array with all dates in the range
      const allDates = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Use existing data or create a placeholder with zero values
        if (dataMap.has(dateString)) {
          const trend = dataMap.get(dateString);
          // Add demo_calls and service_calls properties
          const demoCallsCount = Math.round(trend.calls * 0.3);
          const serviceCallsCount = trend.calls - demoCallsCount;
          
          allDates.push({
            ...trend,
            demo_calls: demoCallsCount,
            service_calls: serviceCallsCount
          });
        } else {
          // Add a placeholder entry for days with no data
          allDates.push({
            date: dateString,
            calls: 0,
            minutes: 0,
            cost: 0,
            demo_calls: 0,
            service_calls: 0
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Return the processed response with data for every day
      return {
        ...response,
        trends: allDates,
        total_days: allDates.length
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch performance summary
 */
export const usePerformanceSummary = () => {
  return useQuery({
    queryKey: metricsQueryKeys.performance(),
    queryFn: () => metricsApi.getPerformanceSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch call analysis charts data
 */
export const useCallAnalysisCharts = (params?: {
  date_range?: string;
  start_date?: string;
  end_date?: string;
  group_by?: string;
  filter_type?: string;
}) => {
  return useQuery({
    queryKey: metricsQueryKeys.callAnalysisCharts(params),
    queryFn: () => metricsApi.getCallAnalysisCharts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Helper function to format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Helper function to format numbers
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Helper function to calculate average cost per call
export const calculateAverageCostPerCall = (totalCost: number, totalCalls: number): number => {
  if (totalCalls === 0) return 0;
  return totalCost / totalCalls;
};
