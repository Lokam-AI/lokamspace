import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  color: "orange" | "black";
  change: string;
}

export default function StatCard({ icon, value, label, color, change }: StatCardProps) {
  const bg = color === "orange" ? "bg-[#F97316]" : "bg-[#27272A]";
  return (
    <div className={`rounded-2xl p-6 flex flex-col gap-2 ${bg} text-white shadow w-full min-w-[220px]`}>
      <div className="flex items-center justify-between">
        <div className="text-3xl">{icon}</div>
        <div className="text-lg font-bold">{change}</div>
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
} 