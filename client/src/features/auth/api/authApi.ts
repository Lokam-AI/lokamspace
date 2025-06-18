import { config } from '@/config/config';
import { SignInCredentials } from '../types';

export const signIn = async (credentials: SignInCredentials) => {
  const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An unexpected error occurred.');
  }

  return data;
}; 