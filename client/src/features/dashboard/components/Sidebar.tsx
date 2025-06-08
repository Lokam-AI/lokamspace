'use client';
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaUser, FaSignOutAlt } from "react-icons/fa";
import TabButton from "./TabButton";

const navItems = [
  { label: "Dashboard", icon: FaHome, path: "/dashboard" },
  { label: "Profile", icon: FaUser, path: "/dashboard/profile" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    router.push('/auth/signin');
  };

  return (
    <aside className="bg-gray-50 h-full w-72 p-6 flex flex-col gap-2 border-r border-gray-200 min-h-screen font-inter">
      <div className="mb-4 text-2xl font-black text-center tracking-tight text-black">
        GarageBot
      </div>
      <hr className="border-t border-gray-200 mb-4" />
      <nav className="flex flex-col gap-3 flex-1">
        {navItems.map((item) => (
          <TabButton
            key={item.label}
            label={item.label}
            icon={<item.icon size={20} />}
            active={pathname === item.path}
            onClick={() => router.push(item.path)}
          />
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-200">
        <TabButton
          label="Sign Out"
          icon={<FaSignOutAlt size={20} />}
          active={false}
          onClick={handleSignOut}
        />
      </div>
    </aside>
  );
} 