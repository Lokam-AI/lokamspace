'use client';
import { useState } from "react";
import CallListTitle from "./CallListTitle";
import CallList from "./CallList";
import CallListFooter from "./CallListFooter";

const mockCalls = [
  { id: 1, customer: "John Doe", vehicleNumber: "AB123CD", serviceDate: "2024-06-01" },
  { id: 2, customer: "Jane Smith", vehicleNumber: "XY987ZT", serviceDate: "2024-06-02" },
  { id: 3, customer: "Mike Brown", vehicleNumber: "LM456OP", serviceDate: "2024-06-03" },
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