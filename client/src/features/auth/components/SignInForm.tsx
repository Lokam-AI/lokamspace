'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // TODO: Implement actual authentication logic here
      console.log('Sign in:', formData);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-8 border border-[#E3E3E7]">
      <h2 className="text-2xl font-bold text-[#27272A] mb-6">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#27272A] mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 border border-[#E3E3E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A]"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#27272A] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-2 border border-[#E3E3E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A] pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#27272A] transition-colors"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#71717A]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#F97316] hover:text-[#EA580C] font-semibold">
          Sign Up
        </Link>
      </div>
    </div>
  );
} 