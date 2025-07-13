import { API_BASE_URL, getHeaders } from "../config";

// Organization interfaces
export interface Organization {
  id: string;
  name: string;
  email: string;
  phone_feedback?: string;
  phone_booking?: string;
  phone_inquiry?: string;
  location?: string;
  location_city?: string;
  location_value?: string;
  call_concurrency_limit: number;
  credit_balance: number;
}

export interface OrganizationSettings {
  name?: string;
  email?: string;
  location_city?: string;
  location_value?: string;
  phone_feedback?: string;
  phone_booking?: string;
  phone_inquiry?: string;
}

/**
 * Get current organization details
 * @returns Organization details
 */
export const getOrganizationSettings = async (): Promise<Organization> => {
  const response = await fetch(`${API_BASE_URL}/organizations/`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization settings");
  }

  return response.json();
};

/**
 * Update organization settings
 * @param settings Organization settings to update
 * @returns Updated organization
 */
export const updateOrganizationSettings = async (
  settings: OrganizationSettings
): Promise<Organization> => {
  const response = await fetch(`${API_BASE_URL}/organizations/settings`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to update organization settings");
  }

  return response.json();
};

/**
 * Get organization statistics
 * @returns Organization statistics
 */
export const getOrganizationStats = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/organizations/stats`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization statistics");
  }

  return response.json();
};
