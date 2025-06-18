'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button/Button';
import { Input, Label, FormField, FormMessage, PasswordInput } from '@/components/ui/form';
import { signIn } from '../api/authApi';

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await signIn({ email, password });
      
      // Assuming the API returns a token or user data on success
      // TODO: Handle successful login (e.g., store token, redirect)
      console.log('Sign in successful:', data);
      router.push('/dashboard');

    } catch (error: any) {
      setErrors({ api: error.message || 'Failed to connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-8 border border-autopulse-grey-dark">
      <h2 className="text-2xl font-bold text-center text-autopulse-black mb-6">Sign In</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading}
          />
          <FormMessage>{errors.email}</FormMessage>
        </FormField>

        <FormField>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <FormMessage>{errors.password}</FormMessage>
        </FormField>
        
        {errors.api && (
            <FormMessage>{errors.api}</FormMessage>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-autopulse-orange hover:text-autopulse-orange-dark font-semibold">
          Sign Up
        </Link>
      </div>
    </div>
  );
} 