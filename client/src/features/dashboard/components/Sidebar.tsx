'use client';
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaUsers, FaBuilding, FaSignOutAlt, FaBars } from "react-icons/fa";
import Image from "next/image";
import TabButton from "./TabButton";
import { useState, useEffect } from "react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
  onSignOut: () => Promise<void>;
}

const navItems = [
  { label: "Dashboard", icon: FaHome, path: "/dashboard" },
  { label: "Customers", icon: FaUsers, path: "/customers" },
  { label: "Organization", icon: FaBuilding, path: "/organization" },
];

export default function Sidebar({ user, onSignOut }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Dispatch event when sidebar state changes
  useEffect(() => {
    const event = new CustomEvent('sidebarToggle', {
      detail: { isCollapsed }
    });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  return (
    <aside className={`bg-[#F4F4F5] flex flex-col border-r border-neutral-200 font-inter transition-all duration-300 fixed left-0 top-0 bottom-0 z-50 ${
      isCollapsed ? 'w-12' : 'w-48'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-4 flex-shrink-0">
          <div className="mb-3">
            {!isCollapsed && (
              <div className="flex items-center gap-2 justify-center mb-2">
                <Image
                  src="/assets/brand/lokam-ai-logo-dark.png"
                  alt="Lokam.ai"
                  width={60}
                  height={18}
                  className="h-4 w-auto"
                />
                <span className="text-[#71717A] text-xs">|</span>
                <span className="text-xs font-semibold text-[#F97316]">AutoPulse</span>
              </div>
            )}
            <div className="flex justify-center">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-[#E5E7EB] transition-colors"
              >
                <FaBars size={14} className="text-[#71717A]" />
              </button>
            </div>
          </div>
          <hr className="border-t border-[#E5E7EB] mb-2" />
        </div>

        {/* Navigation Section - Scrollable if needed */}
        <div className="flex-1 overflow-y-auto px-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <TabButton
                key={item.label}
                label={isCollapsed ? "" : item.label}
                icon={<item.icon size={16} />}
                active={pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                collapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>

        {/* User Section - Always at bottom */}
        <div className="p-4 flex-shrink-0 border-t border-[#E5E7EB]">
          {!isCollapsed && (
            <div className="px-2 mb-3">
              <div className="text-xs font-medium text-[#27272A]">{user.name}</div>
              <div className="text-xs text-[#6B7280]">{user.email}</div>
            </div>
          )}
          <TabButton
            label={isCollapsed ? "" : "Sign Out"}
            icon={<FaSignOutAlt size={16} />}
            active={false}
            onClick={onSignOut}
            variant="danger"
            collapsed={isCollapsed}
          />
        </div>
      </div>
    </aside>
  );
} 