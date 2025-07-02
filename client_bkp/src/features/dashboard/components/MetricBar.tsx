interface MetricBarProps {
  label: string;
  value: number;
}

export default function MetricBar({ label, value }: MetricBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-black">{label}</span>
        <span className="text-[#71717A]">{value}%</span>
      </div>
      <div className="w-full h-2 bg-[#E3E3E7] rounded-full">
        <div className="h-2 bg-[#F97316] rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
} 