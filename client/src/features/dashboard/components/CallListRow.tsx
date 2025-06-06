interface CallListRowProps {
  call: { id: number; customer: string; vehicleNumber: string; serviceDate: string };
  selected: boolean;
  onToggle: (id: number) => void;
}

export default function CallListRow({ call, selected, onToggle }: CallListRowProps) {
  return (
    <div className="flex items-center gap-2 py-2 rounded">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(call.id)}
        className="accent-[#F97316] w-4 h-4"
      />
      <div className="flex-1">
        <div className="font-medium text-[#27272A] text-sm">{call.customer}</div>
        <div className="text-xs text-[#71717A]">{call.vehicleNumber} &middot; {call.serviceDate}</div>
      </div>
    </div>
  );
} 