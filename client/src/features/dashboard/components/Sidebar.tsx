'use client';
import { useState } from "react";
import { FaHome, FaUser, FaKey, FaRocket } from "react-icons/fa";
import TabButton from "./TabButton";

const navItems = [
  { label: "Dashboard", icon: FaHome },
];

const accountItems = [
  { label: "Profile", icon: FaUser },
  { label: "Sign In", icon: FaKey },
  { label: "Sign Up", icon: FaRocket },
];

export default function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <aside className="bg-[#F4F4F5] h-full w-72 p-6 flex flex-col gap-2 border-r border-neutral-200 min-h-screen font-inter">
      <div className="mb-2 text-xl font-extrabold text-center tracking-tight text-[#27272A]">GarageBot</div>
      <hr className="border-t border-[#E5E7EB] mb-2" />
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <TabButton
            key={item.label}
            label={item.label}
            icon={<item.icon size={20} />}
            active={active === item.label}
            onClick={() => setActive(item.label)}
          />
        ))}
        <div className="mt-6 mb-2 px-4 text-xs font-bold uppercase text-[#6B7280] tracking-widest">
          Account Pages
        </div>
        {accountItems.map((item) => (
          <TabButton
            key={item.label}
            label={item.label}
            icon={<item.icon size={20} />}
            active={active === item.label}
            onClick={() => setActive(item.label)}
          />
        ))}
      </nav>
    </aside>
  );
} 