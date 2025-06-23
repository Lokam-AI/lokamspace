import { config } from '@/config/config';
import { SignInCredentials, SignUpCredentials } from '../types';

export const signIn = async (credentials: SignInCredentials) => {
  const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: "include" 
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An unexpected error occurred.');
  }

  return data;
};

export const signUp = async (credentials: SignUpCredentials) => {
  const { organizationName, ...rest } = credentials;
  
  const response = await fetch(`${config.apiBaseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...rest,
      organization_name: organizationName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An unexpected error occurred during sign-up.');
  }

  return data;
}; 