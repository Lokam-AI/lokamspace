import { ReactNode } from "react";

interface TabButtonProps {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}

export default function TabButton({ label, icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-1.5 w-full rounded-2xl text-sm font-medium transition-colors
        ${active ? "bg-white shadow-md" : "bg-transparent hover:bg-[#E5E7EB]"}
      `}
      style={{
        boxShadow: active ? "0 2px 8px 0 rgba(0,0,0,0.04)" : undefined,
      }}
    >
      <span
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-colors
          ${active ? "bg-[#F97316] text-white" : "bg-white text-[#27272A] border border-[#E5E7EB]"}
        `}
      >
        {icon}
      </span>
      <span className="transition-colors text-[#27272A]">{label}</span>
    </button>
  );
} 