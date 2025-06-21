import { ReactNode } from "react";

interface TabButtonProps {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger';
  collapsed?: boolean;
}

export default function TabButton({ label, icon, active, onClick, variant = 'default', collapsed = false }: TabButtonProps) {
  const getStyles = () => {
    if (variant === 'danger') {
      return {
        button: 'bg-transparent hover:bg-red-50',
        icon: 'bg-white text-red-600 border border-red-200 group-hover:bg-red-600 group-hover:text-white',
        text: 'text-red-600'
      };
    }
    return {
      button: active ? 'bg-white shadow-md' : 'bg-transparent hover:bg-[#E5E7EB]',
      icon: active ? 'bg-[#F97316] text-white' : 'bg-white text-[#27272A] border border-[#E5E7EB]',
      text: 'text-[#27272A]'
    };
  };

  const styles = getStyles();

  return (
    <button
      onClick={onClick}
      className={`
        group flex items-center gap-2 px-3 py-1.5 w-full rounded-xl text-xs font-medium transition-colors
        ${styles.button}
        ${collapsed ? 'justify-center px-1.5' : ''}
      `}
      style={{
        boxShadow: active ? "0 2px 8px 0 rgba(0,0,0,0.04)" : undefined,
      }}
      title={collapsed ? label : undefined}
    >
      <span
        className={`
          flex items-center justify-center w-8 h-8 rounded-lg transition-colors
          ${styles.icon}
        `}
      >
        {icon}
      </span>
      {!collapsed && <span className={`transition-colors ${styles.text}`}>{label}</span>}
    </button>
  );
} 