/**
 * React Query hooks for Agent Library functionality
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAgents,
  getAgentCategories,
  getAgentsByCategory,
  getAgentById,
  initiateAgentTestCall,
  getAgentTestCallStatus,
} from "@/api/endpoints/agents";
import { AgentCallRequest } from "@/types/agent";

/**
 * Hook to fetch all agents
 */
export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch agent categories
 */
export const useAgentCategories = () => {
  return useQuery({
    queryKey: ["agent-categories"],
    queryFn: getAgentCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to fetch agents by category
 */
export const useAgentsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["agents-by-category", categoryId],
    queryFn: () => getAgentsByCategory(categoryId),
    enabled: !!categoryId && categoryId !== "all",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a specific agent
 */
export const useAgent = (agentId: string) => {
  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => getAgentById(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to initiate agent test calls
 */
export const useInitiateAgentTestCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callRequest: AgentCallRequest) => initiateAgentTestCall(callRequest),
    onSuccess: (data, variables) => {
      // Optionally invalidate queries or update cache
      queryClient.invalidateQueries({ queryKey: ["agent-test-calls"] });
      
      // Start polling for call status
      console.log(`Test call initiated: ${data.call_id} for agent ${variables.agent_id}`);
    },
    onError: (error, variables) => {
      console.error(`Failed to initiate test call for agent ${variables.agent_id}:`, error);
    },
  });
};

/**
 * Hook to fetch test call status
 */
export const useAgentTestCallStatus = (callId: string, enabled = true) => {
  return useQuery({
    queryKey: ["agent-test-call-status", callId],
    queryFn: () => getAgentTestCallStatus(callId),
    enabled: !!callId && enabled,
    refetchInterval: (data) => {
      // Poll every 3 seconds if call is in progress, stop if completed/failed
      if (data?.status === "in_progress" || data?.status === "ringing") {
        return 3000;
      }
      return false;
    },
    staleTime: 1000, // Always consider status data stale for real-time updates
  });
};