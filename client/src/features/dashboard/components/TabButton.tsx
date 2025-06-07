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
        flex items-center gap-3 px-4 py-2 w-full rounded-2xl text-sm font-bold transition-colors
        ${active 
          ? "bg-white shadow-md text-black" 
          : "bg-transparent hover:bg-white/60 text-black/80 hover:text-black"
        }
      `}
      style={{
        boxShadow: active ? "0 2px 8px 0 rgba(0,0,0,0.12)" : undefined,
      }}
    >
      <span
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-colors
          ${active 
            ? "bg-[#F97316] text-white shadow-sm" 
            : "bg-white text-black/80 border border-[#D1D5DB] hover:border-[#9CA3AF] hover:text-black"
          }
        `}
      >
        {icon}
      </span>
      <span className="transition-colors">{label}</span>
    </button>
  );
} 