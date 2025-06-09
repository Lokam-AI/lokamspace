'use client';
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaUsers, FaBuilding, FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";
import TabButton from "./TabButton";

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

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside className="bg-[#F4F4F5] w-72 flex flex-col fixed left-0 top-0 bottom-0 border-r border-neutral-200 font-inter">
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-4 justify-center">
            <Image
              src="/assets/lokam-ai-logo.png"
              alt="Lokam.ai"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-[#71717A]">|</span>
            <span className="text-lg font-semibold text-[#F97316]">GarageBot</span>
          </div>
        </div>
        <hr className="border-t border-[#E5E7EB] mb-2" />
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <TabButton
              key={item.label}
              label={item.label}
              icon={<item.icon size={20} />}
              active={pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto p-6">
        <div className="px-4 mb-4">
          <div className="text-sm font-medium text-[#27272A]">{user.name}</div>
          <div className="text-xs text-[#6B7280]">{user.email}</div>
        </div>
        <TabButton
          label="Sign Out"
          icon={<FaSignOutAlt size={20} />}
          active={false}
          onClick={onSignOut}
          variant="danger"
        />
      </div>
    </aside>
  );
} 