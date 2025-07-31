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
  trends: (params?: { date_range?: string }) => 
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
export const useCallTrends = (params?: { date_range?: string }) => {
  return useQuery({
    queryKey: metricsQueryKeys.trends(params),
    queryFn: () => metricsApi.getCallTrends(params),
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
