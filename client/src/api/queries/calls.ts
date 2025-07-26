import { useQuery } from "@tanstack/react-query";
import api from "../axios";
import { getRecentCalls, getCallsSummaryMetrics } from "../endpoints/calls";
import { CallsSummaryMetrics } from "../../types/analytics";

export const useCallStats = (filters: Record<string, any> = {}) =>
  useQuery({
    queryKey: ["call-stats", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/calls/stats${queryParams ? `?${queryParams}` : ""}`);
      return data;
    },
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

export const useCallsSummaryMetrics = () =>
  useQuery<CallsSummaryMetrics>({
    queryKey: ["calls-summary-metrics"],
    queryFn: getCallsSummaryMetrics,
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

export const useCallsByStatus = (status: string, filters: any = {}) =>
  useQuery({
    queryKey: ["calls", status, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/calls/${status}${queryParams ? `?${queryParams}` : ""}`;
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!status,
  });

export const useRecentCalls = (limit = 6) =>
  useQuery({
    queryKey: ["recent-calls", limit],
    queryFn: async () => {
      return getRecentCalls(limit);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });