'use client';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// TODO: Replace with actual user data from authentication
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com'
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    // TODO: Implement actual sign out logic
    try {
      // Clear auth token
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar user={mockUser} onSignOut={handleSignOut} />
      <main className="flex-1 ml-72 p-8">
        {children}
      </main>
    </div>
  );
} 