'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// You can replace these with your actual icons
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SignOutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    organization: 'Example Org',
  };

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-width duration-300 ${
          isOpen ? 'w-64' : 'w-20'
        } z-30`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {isOpen && <h1 className="text-xl font-bold">Garagebot</h1>}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <DashboardIcon />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center p-2 rounded-lg hover:bg-gray-100"
            >
              <DashboardIcon />
              {isOpen && <span className="ml-3">Dashboard</span>}
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center p-2 rounded-lg hover:bg-gray-100"
            >
              <ProfileIcon />
              {isOpen && <span className="ml-3">Profile</span>}
            </Link>
          </nav>

          {/* User Info & Sign Out */}
          <div className="p-4 border-t">
            {isOpen && (
              <div className="mb-4">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.organization}</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 text-red-600"
            >
              <SignOutIcon />
              {isOpen && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-margin duration-300 ${
          isOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
} 