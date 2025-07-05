// API functions for calls
import { API_BASE_URL, getHeaders, handleApiError } from "../config";

/**
 * Get calls by status (ready, missed, completed)
 */
export const getCallsByStatus = async (status: string, filters: any = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}/calls/${status}${
    queryParams ? `?${queryParams}` : ""
  }`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${status} calls:`, error);
    throw error;
  }
};

/**
 * Get call details by ID
 */
export const getCallDetails = async (callId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/${callId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching call details for ID ${callId}:`, error);
    throw error;
  }
};

/**
 * Update a call
 */
export const updateCall = async (callId: string, callData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/${callId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(callData),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error updating call ID ${callId}:`, error);
    throw error;
  }
};

/**
 * Get schedule configuration
 */
export const getScheduleConfig = async () => {
  console.log(
    "Fetching schedule config from:",
    `${API_BASE_URL}/schedule-config/`
  );
  try {
    const response = await fetch(`${API_BASE_URL}/schedule-config/`, {
      method: "GET",
      headers: getHeaders(),
    });

    console.log("Schedule config response status:", response.status);
    await handleApiError(response);
    const data = await response.json();
    console.log("Schedule config response data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching schedule configuration:", error);
    throw error;
  }
};

/**
 * Update schedule configuration
 */
export const updateScheduleConfig = async (configData: any) => {
  console.log(
    "Updating schedule config at:",
    `${API_BASE_URL}/schedule-config/`
  );
  console.log("Update payload:", configData);
  try {
    const response = await fetch(`${API_BASE_URL}/schedule-config/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(configData),
    });

    console.log("Update response status:", response.status);
    await handleApiError(response);
    const data = await response.json();
    console.log("Update response data:", data);
    return data;
  } catch (error) {
    console.error("Error updating schedule configuration:", error);
    throw error;
  }
};

/**
 * Create a demo call
 */
export const createDemoCall = async (demoData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/demo`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(demoData),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("Error creating demo call:", error);
    throw error;
  }
};

/**
 * Initiate a demo call
 */
export const initiateDemoCall = async (callId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/calls/demo/${callId}/initiate`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error initiating demo call ID ${callId}:`, error);
    throw error;
  }
};

/**
 * Get call summary metrics
 */
export const getCallSummaryMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/calls/summary`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching call summary metrics:", error);
    throw error;
  }
};

/**
 * Get CSV template for bulk call upload
 */
export const getCallsCSVTemplate = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/bulk-upload/template`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching CSV template:", error);
    throw error;
  }
};

/**
 * Bulk upload calls from CSV data
 */
export const bulkUploadCalls = async (campaignName: string, calls: any[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/bulk-upload`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        campaign_name: campaignName,
        calls: calls,
      }),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("Error uploading calls:", error);
    throw error;
  }
};
