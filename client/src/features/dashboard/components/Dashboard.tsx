import Sidebar from "./Sidebar";
import DashboardMain from "./DashboardMain";
import { useRouter } from 'next/navigation';

// TODO: Replace with actual user data from authentication
const mockUser = {
  name: 'Saleeq Muhammed',
  email: 'saleeq.muhammed@autocare.com'
};

export default function AutoPulseDashboard() {
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
    <div className="flex min-h-screen bg-[#F4F4F5]">
      <Sidebar user={mockUser} onSignOut={handleSignOut} />
      <main className="flex-1 p-10">
        <h2 className="text-2xl text-black font-bold mb-4">Dashboard</h2>
        <DashboardMain />
      </main>
    </div>
  );
} 