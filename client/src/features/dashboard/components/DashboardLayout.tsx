'use client';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useState, useEffect } from 'react';
import { FaPlus, FaUpload } from 'react-icons/fa';
import AddServiceRecordModal from './AddServiceRecordModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarWidth, setSidebarWidth] = useState('w-48'); // Default expanded width
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      logout();
      router.push('/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleAddServiceRecord = () => {
    setIsAddServiceModalOpen(true);
  };

  const handleUploadCSV = () => {
    // TODO: Implement CSV upload functionality
    console.log('Upload CSV clicked');
  };

  const handleCloseAddServiceModal = () => {
    setIsAddServiceModalOpen(false);
  };

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarWidth(event.detail.isCollapsed ? 'w-12' : 'w-48');
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  // If no user is authenticated, redirect to signin
  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar user={user} onSignOut={handleSignOut} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
        sidebarWidth === 'w-12' ? 'ml-12' : 'ml-48'
      }`}>
        {/* Action Buttons Header */}
        <div className="sticky top-0 bg-[#F9FAFB] border-b border-[#E5E7EB] px-8 py-4 z-40">
          <div className="flex justify-between items-center">
            <div></div> {/* Empty div for flex spacing */}
            <div className="flex gap-3">
              <button
                onClick={handleAddServiceRecord}
                className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm font-medium"
              >
                <FaPlus size={14} />
                Add Service Record
              </button>
              <button
                onClick={handleUploadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#27272A] rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm font-medium"
              >
                <FaUpload size={14} />
                Upload as CSV
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8">
          {children}
        </div>

        {/* Add Service Record Modal */}
        <AddServiceRecordModal 
          open={isAddServiceModalOpen} 
          onClose={handleCloseAddServiceModal} 
        />
      </main>
    </div>
  );
} 