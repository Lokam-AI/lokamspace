'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for existing organizations
const existingOrganizations = [
  { id: '1', name: 'Tech Corp', email: 'tech@corp.com' },
  { id: '2', name: 'Digital Solutions', email: 'info@digital.com' },
  { id: '3', name: 'Innovation Labs', email: 'hello@innov.com' },
];

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isNewOrg, setIsNewOrg] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [formData, setFormData] = useState({
    // Organization details
    orgName: '',
    orgEmail: '',
    orgPhone: '',
    orgAddress: '',
    // User details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // TODO: Implement sign-up logic
      console.log('Sign up data:', {
        ...formData,
        organizationId: isNewOrg ? null : selectedOrg,
      });
      // For testing: Redirect to dashboard after sign up
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {step === 1 ? 'Organization Details' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <div className={`h-2 w-16 rounded ${step === 1 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
          <div className={`h-2 w-16 rounded ${step === 2 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsNewOrg(true)}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    isNewOrg
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  New Organization
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewOrg(false)}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    !isNewOrg
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Existing Organization
                </button>
              </div>

              {isNewOrg ? (
                <>
                  <div>
                    <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                      Organization Name
                    </label>
                    <input
                      id="orgName"
                      name="orgName"
                      type="text"
                      required={isNewOrg}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                      value={formData.orgName}
                      onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="orgEmail" className="block text-sm font-medium text-gray-700">
                      Organization Email
                    </label>
                    <input
                      id="orgEmail"
                      name="orgEmail"
                      type="email"
                      required={isNewOrg}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                      value={formData.orgEmail}
                      onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="orgPhone" className="block text-sm font-medium text-gray-700">
                      Organization Phone
                    </label>
                    <input
                      id="orgPhone"
                      name="orgPhone"
                      type="tel"
                      required={isNewOrg}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                      value={formData.orgPhone}
                      onChange={(e) => setFormData({ ...formData, orgPhone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="orgAddress" className="block text-sm font-medium text-gray-700">
                      Organization Address
                    </label>
                    <textarea
                      id="orgAddress"
                      name="orgAddress"
                      required={isNewOrg}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                      value={formData.orgAddress}
                      onChange={(e) => setFormData({ ...formData, orgAddress: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="existingOrg" className="block text-sm font-medium text-gray-700">
                    Select Organization
                  </label>
                  <select
                    id="existingOrg"
                    name="existingOrg"
                    required={!isNewOrg}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                  >
                    <option value="">Select an organization</option>
                    {existingOrganizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className={`${step === 2 ? 'ml-auto' : 'w-full'} inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {step === 1 ? 'Next' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 