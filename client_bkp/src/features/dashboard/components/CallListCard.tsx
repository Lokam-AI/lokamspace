'use client';
import { useState } from "react";
import CallListTitle from "./CallListTitle";
import CallList from "./CallList";
import CallListFooter from "./CallListFooter";

const mockCalls = [
  { id: 1, customer: "John Smith", email: "john.smith@email.com", phone: "9029897685", vehicleNumber: "ABC-1234", serviceDate: "2025-01-09", serviceDetails: "Tire Replacement - Completed routine maintenance and inspection", status: "pending" },
  { id: 2, customer: "Jane Doe", email: "jane.doe@email.com", phone: "9876543210", vehicleNumber: "XYZ-5678", serviceDate: "2025-01-12", serviceDetails: "Oil Change - Routine oil and filter replacement", status: "pending" },
];

export default function CallListCard() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === mockCalls.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mockCalls.map((c) => c.id));
    }
  };

  const handleCall = () => {
    // Implement call logic here
    alert(`Calling customers: ${selectedIds.join(", ")}`);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-full min-w-[320px]">
      <CallListTitle />
      <CallList calls={mockCalls} selectedIds={selectedIds} onToggle={handleToggle} />
      <div className="mt-auto">
        <CallListFooter
          allSelected={selectedIds.length === mockCalls.length}
          onSelectAll={handleSelectAll}
          onCall={handleCall}
          disabled={selectedIds.length === 0}
        />
      </div>
    </div>
  );
} 