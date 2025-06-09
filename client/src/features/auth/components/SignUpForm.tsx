'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Mock organizations - replace with actual API call
const ORGANIZATIONS = [
  'Toyota Service Center',
  'Honda Dealership',
  'BMW Workshop',
  'Mercedes Service',
  'Add New Organization'
];

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    newOrganization: '',
    organizationAddress: ''
  });
  const [error, setError] = useState('');
  const [showNewOrgField, setShowNewOrgField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleOrganizationChange = (value: string) => {
    if (value === 'Add New Organization') {
      setShowNewOrgField(true);
      setFormData(prev => ({ ...prev, organization: value }));
    } else {
      setShowNewOrgField(false);
      setFormData(prev => ({ ...prev, organization: value, organizationAddress: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // TODO: Implement actual registration logic here
      const organizationName = showNewOrgField ? formData.newOrganization : formData.organization;
      console.log('Sign up:', { 
        ...formData, 
        organization: organizationName,
        organizationAddress: showNewOrgField ? formData.organizationAddress : ''
      });
      router.push('/dashboard');
    } catch {
      setError('Failed to create account');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-8 border border-[#E3E3E7]">
      <h2 className="text-2xl font-bold text-[#27272A] mb-6">Create Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#27272A] mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 border border-[#E3E3E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A]"
            required
          />
        </div>

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

        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-[#27272A] mb-1">
            Organization
          </label>
          <select
            id="organization"
            value={formData.organization}
            onChange={(e) => handleOrganizationChange(e.target.value)}
            className="w-full px-4 py-2 border border-[#E3E3E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A] bg-white"
            required
          >
            <option value="">Select Organization</option>
            {ORGANIZATIONS.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>

        {showNewOrgField && (
          <>
            <div>
              <label htmlFor="newOrganization" className="block text-sm font-medium text-[#27272A] mb-1">
                New Organization Name
              </label>
              <input
                type="text"
                id="newOrganization"
                value={formData.newOrganization}
                onChange={(e) => setFormData(prev => ({ ...prev, newOrganization: e.target.value }))}
                className="w-full px-4 py-2 border border-[#E3E3E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A]"
                required={showNewOrgField}
              />
            </div>

            <div>
              <label htmlFor="organizationAddress" className="block text-sm font-medium text-[#27272A] mb-1">
                Organization Address <span className="text-[#71717A]">(Optional)</span>
              </label>
              <textarea
                id="organizationAddress"
                value={formData.organizationAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationAddress: e.target.value }))}
                className="w-full px-4 py-2 border border-[#E3E3E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A] resize-none"
                rows={3}
                placeholder="Enter your organization's address"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Create Account
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#71717A]">
        Already have an account?{' '}
        <Link href="/signin" className="text-[#F97316] hover:text-[#EA580C] font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
} 