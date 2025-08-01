import { API_BASE_URL, getHeaders, handleApiError } from "../config";

export interface ApiKey {
  id: string;
  name: string;
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_used_at?: string;
  usage_count: number;
  rate_limit_per_minute: number;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_timeout: number;
  webhook_headers?: Record<string, string>;
  secret_key_preview: string;
  created_by_name: string;
}

export interface ApiKeyCreate {
  name: string;
  rate_limit_per_minute?: number;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_timeout?: number;
  webhook_headers?: Record<string, string>;
}

export interface ApiKeySecret {
  id: string;
  name: string;
  secret_key: string;
}

export interface ApiKeyUpdate {
  name?: string;
  is_active?: boolean;
  rate_limit_per_minute?: number;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_timeout?: number;
  webhook_headers?: Record<string, string>;
}

// Create a new API key
export const createApiKey = async (data: ApiKeyCreate): Promise<ApiKeySecret> => {
  const response = await fetch(`${API_BASE_URL}/api-keys/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

// List all API keys
export const listApiKeys = async (): Promise<ApiKey[]> => {
  const response = await fetch(`${API_BASE_URL}/api-keys/`, {
    method: "GET",
    headers: getHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Get a specific API key
export const getApiKey = async (id: string): Promise<ApiKey> => {
  const response = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Update an API key
export const updateApiKey = async (id: string, data: ApiKeyUpdate): Promise<ApiKey> => {
  const response = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

// Delete an API key
export const deleteApiKey = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  await handleApiError(response);
};