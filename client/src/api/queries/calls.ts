import { useQuery } from "@tanstack/react-query";
import api from "../axios";
import { getRecentCalls } from "../endpoints/calls";

export const useCallStats = (filters: Record<string, any> = {}) =>
  useQuery({
    queryKey: ["call-stats", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/calls/stats${queryParams ? `?${queryParams}` : ""}`);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
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