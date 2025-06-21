'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button/Button';
import { Input, Label, FormField, FormMessage, PasswordInput } from '@/components/ui/form';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';
import { STATIC_USER } from '@/data/staticData';

export default function SignInForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
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
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Demo credentials for static login
        if (email === 'demo@autocare.com' && password === 'demo12345') {
          const userData = {
            name: STATIC_USER.name,
            email: STATIC_USER.email,
            userId: STATIC_USER.userId,
            role: STATIC_USER.role,
          };

          login({ accessToken: 'demo-access-token-12345', user: userData });
          
          toast.success('Login successful! Welcome to AutoCare Dashboard.');
          router.push('/dashboard');
        } else {
          throw new Error('Invalid email or password. Use demo@autocare.com / demo12345');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to the server.';
        setErrors({ api: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-8 border border-autopulse-grey-dark">
      <h2 className="text-2xl font-bold text-center text-autopulse-black mb-6">Sign In</h2>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Demo Credentials:</strong><br />
          Email: demo@autocare.com<br />
          Password: demo12345
        </p>
      </div>
      
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