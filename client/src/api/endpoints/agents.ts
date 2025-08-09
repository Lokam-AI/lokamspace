/**
 * API endpoints for Agent Library functionality
 */

import { API_BASE_URL, getHeaders, handleApiError } from "@/api/config";
import { Agent, AgentCategory, AgentCallRequest, AgentCallResponse } from "@/types/agent";

/**
 * Get all available agents
 */
export const getAgents = async (): Promise<Agent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    const data = await response.json();
    return data.agents || [];
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw error;
  }
};

/**
 * Get all agent categories
 */
export const getAgentCategories = async (): Promise<AgentCategory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/categories`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching agent categories:", error);
    throw error;
  }
};

/**
 * Get agents by category
 */
export const getAgentsByCategory = async (categoryId: string): Promise<Agent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/category/${categoryId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    const data = await response.json();
    return data.agents || [];
  } catch (error) {
    console.error(`Error fetching agents for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Get a specific agent by ID
 */
export const getAgentById = async (agentId: string): Promise<Agent> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    const data = await response.json();
    return data.agent;
  } catch (error) {
    console.error(`Error fetching agent ${agentId}:`, error);
    throw error;
  }
};

/**
 * Initiate a test call with an agent
 */
export const initiateAgentTestCall = async (
  callRequest: AgentCallRequest
): Promise<AgentCallResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${callRequest.agent_id}/test-call`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        customer_name: callRequest.customer_name,
        phone_number: callRequest.phone_number,
        notes: callRequest.notes,
      }),
    });

    await handleApiError(response);
    const data = await response.json();
    return {
      call_id: data.call_id,
      status: data.status,
      message: data.message,
      estimated_duration: data.estimated_duration,
    };
  } catch (error) {
    console.error(`Error initiating test call with agent ${callRequest.agent_id}:`, error);
    throw error;
  }
};

/**
 * Get the status of an agent test call
 */
export const getAgentTestCallStatus = async (callId: string): Promise<{
  call_id: string;
  status: string;
  duration?: number;
  recording_url?: string;
  transcript?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/test-calls/${callId}/status`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching test call status for ${callId}:`, error);
    throw error;
  }
};