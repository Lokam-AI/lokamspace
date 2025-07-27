// API configuration constants and utilities

// Base API URL from environment variable
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
export const AUTH_COOKIE_NAME =
  import.meta.env.VITE_AUTH_COOKIE_NAME || "autopulse_auth";

// Common headers for API requests
export const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header if token exists and includeAuth is true
  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle token expiration and redirect to login
export const handleTokenExpiration = (status: number) => {
  if (status === 401) {
    // Clear token from storage
    localStorage.removeItem("token");

    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes("/login")) {
      // Store the current path to redirect back after login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);

      // Redirect to login page
      window.location.href = "/login";
    }
    return true;
  }
  return false;
};

// Helper function to handle API errors
export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    // Check for unauthorized status and handle token expiration
    if (response.status === 401) {
      handleTokenExpiration(response.status);
    }

    console.error(
      `API Error: ${response.status} ${response.statusText} - ${response.url}`
    );

    let errorData;
    try {
      errorData = await response.json();
      console.error("Error details:", errorData);
    } catch (e) {
      console.error("Could not parse error response as JSON");
      errorData = null;
    }

    throw {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
      url: response.url,
    };
  }
  return response;
};

// Types for API responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    params?: Record<string, any>;
  };
}

// Default fetch options
export const defaultFetchOptions: RequestInit = {
  credentials: "include",
  headers: getHeaders(),
};
