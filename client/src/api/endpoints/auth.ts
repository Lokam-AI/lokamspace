import { API_BASE_URL, getHeaders, handleApiError } from "../config";

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    organization_id: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  organization_name?: string;
}

// Login user
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login/json`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(credentials),
  });

  const processedResponse = await handleApiError(response);
  const data = await processedResponse.json();

  // Store the token in localStorage
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  return data;
};

// Register a new user
export const register = async (
  userData: RegisterData
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(userData),
  });

  const processedResponse = await handleApiError(response);
  const data = await processedResponse.json();

  // Store the token if registration includes auto-login
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  return data;
};

// Logout user
export const logout = async (): Promise<void> => {
  // Clear the token from localStorage
  localStorage.removeItem("token");

  // Optional: Call backend logout endpoint if needed
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(),
    });
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// Get current user info
export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getHeaders(),
  });

  const processedResponse = await handleApiError(response);
  const userData = await processedResponse.json();
  
  // Normalize the response to match our expected format
  return {
    id: userData.id,
    email: userData.email,
    full_name: userData.name, // Map 'name' to 'full_name'
    role: userData.role,
    organization_id: userData.organization_id,
  };
};

// Request password reset
export const requestPasswordReset = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/request`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email }),
  });

  const processedResponse = await handleApiError(response);
  return processedResponse.json();
};

// Reset password with token
export const resetPassword = async (token: string, new_password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ token, new_password }),
  });

  const processedResponse = await handleApiError(response);
  return processedResponse.json();
};
