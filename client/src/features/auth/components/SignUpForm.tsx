'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button/Button';
import { Input, Label, FormField, FormMessage, PasswordInput } from '@/components/ui/form';
import { useAuthStore } from '@/stores/authStore';
import { STATIC_USER } from '@/data/staticData';

// Simplified validation error type
type SignUpErrors = {
  name?: string;
  email?: string;
  password?: string;
  organizationName?: string;
  location?: string;
  api?: string;
};

export default function SignUpForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    location: '',
  });
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const { name, email, password, organizationName, location } = formData;

  const validate = () => {
    const newErrors: SignUpErrors = {};
    if (!name) newErrors.name = 'Name is required.';
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
    if (!organizationName) newErrors.organizationName = 'Organization name is required.';
    if (!location) newErrors.location = 'Location is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        const userData = {
          name: name || STATIC_USER.name,
          email: email || STATIC_USER.email,
          userId: STATIC_USER.userId,
          role: STATIC_USER.role,
        };

        login({ accessToken: 'demo-access-token-12345', user: userData });

        toast.success('Account created successfully! Welcome to AutoCare Dashboard.');
        
        // Redirect to the dashboard after a successful sign-up and auto-login
        router.push('/dashboard');

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create account.';
        setErrors({ api: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-8 border border-autopulse-grey-dark">
      <h2 className="text-2xl font-bold text-center text-autopulse-black mb-6">Create Your Account</h2>
      
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Demo Mode:</strong> This is a static demo. Any valid form submission will create a demo account and log you in automatically.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={handleChange} placeholder="John Doe" disabled={isLoading} />
          <FormMessage>{errors.name}</FormMessage>
        </FormField>

        <FormField>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={handleChange} placeholder="name@example.com" disabled={isLoading} />
          <FormMessage>{errors.email}</FormMessage>
        </FormField>

        <FormField>
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" value={password} onChange={handleChange} placeholder="••••••••" disabled={isLoading} />
          <FormMessage>{errors.password}</FormMessage>
        </FormField>

        <FormField>
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input id="organizationName" value={organizationName} onChange={handleChange} placeholder="e.g., AutoCare Center" disabled={isLoading} />
          <FormMessage>{errors.organizationName}</FormMessage>
        </FormField>

        <FormField>
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={handleChange} placeholder="e.g., New York, NY" disabled={isLoading} />
          <FormMessage>{errors.location}</FormMessage>
        </FormField>
        
        {errors.api && <FormMessage>{errors.api}</FormMessage>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/signin" className="text-autopulse-orange hover:text-autopulse-orange-dark font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
} 