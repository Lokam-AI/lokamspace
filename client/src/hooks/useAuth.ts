'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

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

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setState({
        user: JSON.parse(storedUser),
        token: storedToken,
        isLoading: false,
        error: null,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signIn = useCallback(async (data: SignInData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await AuthService.signIn(data);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await AuthService.signUp(data);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
};

export { AuthProvider } from '../contexts/AuthContext'; 