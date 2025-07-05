import { API_BASE_URL, getHeaders, handleApiError } from "../config";

/**
 * Update organization configuration
 */
export async function updateOrganizationConfig(configData: any) {
  const response = await fetch(`${API_BASE_URL}/organizations/configuration`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(configData),
  });

  await handleApiError(response);
  return await response.json();
}

/**
 * Update settings by key
 */
export async function updateSettingByKey(
  key: string,
  value: any,
  description?: string
) {
  // Convert arrays to JSON strings
  const processedValue = Array.isArray(value) ? JSON.stringify(value) : value;

  const response = await fetch(`${API_BASE_URL}/settings/by-key/${key}`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ value: processedValue, description }),
  });

  try {
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);

    // If we get a 404, try to initialize settings
    if (error.status === 404) {
      console.log(`Setting ${key} not found, initializing default settings...`);
      await initializeSettings();

      // Try the update again
      const retryResponse = await fetch(
        `${API_BASE_URL}/settings/by-key/${key}`,
        {
          method: "PUT",
          headers: getHeaders(),
          credentials: "include",
          body: JSON.stringify({ value: processedValue, description }),
        }
      );

      await handleApiError(retryResponse);
      return await retryResponse.json();
    }

    throw error;
  }
}

/**
 * Initialize default settings
 */
export async function initializeSettings() {
  const response = await fetch(`${API_BASE_URL}/settings/initialize`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });

  await handleApiError(response);
  return await response.json();
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory() {
  const response = await fetch(`${API_BASE_URL}/settings/by-category`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  await handleApiError(response);
  return await response.json();
}

/**
 * Get DMS integration
 */
export async function getDMSIntegration() {
  const response = await fetch(`${API_BASE_URL}/dms-integration`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  // If 404, it means no DMS integration exists yet
  if (response.status === 404) {
    return null;
  }

  await handleApiError(response);
  return await response.json();
}

/**
 * Create DMS integration
 */
export async function createDMSIntegration(integrationData: any) {
  const response = await fetch(`${API_BASE_URL}/dms-integration`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(integrationData),
  });

  await handleApiError(response);
  return await response.json();
}

/**
 * Update DMS integration
 */
export async function updateDMSIntegration(
  integrationId: number,
  integrationData: any
) {
  const response = await fetch(
    `${API_BASE_URL}/dms-integration/${integrationId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(integrationData),
    }
  );

  await handleApiError(response);
  return await response.json();
}

/**
 * Upload knowledge file
 */
export async function uploadKnowledgeFile(formData: FormData) {
  const headers = getHeaders();
  // Remove content-type as it will be set automatically for FormData
  delete headers["Content-Type"];

  const response = await fetch(`${API_BASE_URL}/knowledge-files`, {
    method: "POST",
    headers,
    credentials: "include",
    body: formData,
  });

  await handleApiError(response);
  return await response.json();
}

/**
 * Get knowledge files
 */
export async function getKnowledgeFiles() {
  const response = await fetch(`${API_BASE_URL}/knowledge-files`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  await handleApiError(response);
  return await response.json();
}

/**
 * Delete knowledge file
 */
export async function deleteKnowledgeFile(fileId: number) {
  const response = await fetch(`${API_BASE_URL}/knowledge-files/${fileId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  await handleApiError(response);
  return true;
}
