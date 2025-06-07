import { API_CONFIG, getAuthHeader } from '@/config/api.config';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new ApiError(response.status, error.message);
    }
    return response.json();
  }

  private static getUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  static async get(endpoint: string, token?: string) {
    const headers = {
      ...API_CONFIG.HEADERS,
      ...(token ? getAuthHeader(token) : {}),
    };

    const response = await fetch(this.getUrl(endpoint), { headers });
    return this.handleResponse(response);
  }

  static async post(endpoint: string, data: any, token?: string) {
    const headers = {
      ...API_CONFIG.HEADERS,
      ...(token ? getAuthHeader(token) : {}),
    };

    const response = await fetch(this.getUrl(endpoint), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async put(endpoint: string, data: any, token?: string) {
    const headers = {
      ...API_CONFIG.HEADERS,
      ...(token ? getAuthHeader(token) : {}),
    };

    const response = await fetch(this.getUrl(endpoint), {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async delete(endpoint: string, token?: string) {
    const headers = {
      ...API_CONFIG.HEADERS,
      ...(token ? getAuthHeader(token) : {}),
    };

    const response = await fetch(this.getUrl(endpoint), {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }
} 