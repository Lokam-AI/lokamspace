import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

interface SignUpData {
  name: string;
  email: string;
  password: string;
  organization_name: string;
  organization_address?: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const AuthService = {
  async signUp(data: SignUpData): Promise<{ token: string; user: any }> {
    try {
      console.log('Signup data:', data); // Debug log
      const response = await axiosInstance.post<AuthResponse>('/api/auth/signup', data);
      console.log('Signup response:', response.data); // Debug log
      return {
        token: response.data.access_token,
        user: {
          name: data.name,
          email: data.email,
        },
      };
    } catch (error) {
      console.error('Signup error:', error); // Debug log
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.message || 'Error creating account';
        throw new Error(message);
      }
      throw error;
    }
  },

  async signIn(data: SignInData): Promise<{ token: string; user: any }> {
    try {
      const formData = new FormData();
      formData.append('username', data.email);
      formData.append('password', data.password);

      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        token: response.data.access_token,
        user: {
          email: data.email,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || 'Invalid credentials';
        throw new Error(message);
      }
      throw error;
    }
  },
}; 