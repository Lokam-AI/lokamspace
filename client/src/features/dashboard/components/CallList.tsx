import CallListRow from "./CallListRow";

interface Call {
  id: number;
  customer: string;
  vehicleNumber: string;
  serviceDate: string;
}

interface CallListProps {
  calls: Call[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export default function CallList({ calls, selectedIds, onToggle }: CallListProps) {
  return (
    <div className="divide-y divide-[#F4F4F5]">
      {calls.map((call) => (
        <CallListRow
          key={call.id}
          call={call}
          selected={selectedIds.includes(call.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
} 