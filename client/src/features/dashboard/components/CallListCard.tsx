'use client';
import { useState } from "react";
import CallListTitle from "./CallListTitle";
import CallList from "./CallList";
import CallListFooter from "./CallListFooter";
import PostServiceCallsPagination from "./PostServiceCallsPagination";
import { STATIC_CALL_LIST } from "@/data/staticData";

const PAGE_SIZE = 5;

export default function CallListCard() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(STATIC_CALL_LIST.length / PAGE_SIZE));
  const pagedCalls = STATIC_CALL_LIST.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === STATIC_CALL_LIST.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(STATIC_CALL_LIST.map((c) => c.id));
    }
  };

  const handleCall = () => {
    // Implement call logic here
    alert(`Calling customers: ${selectedIds.join(", ")}`);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-full">
      <CallListTitle />
      <CallList calls={pagedCalls} selectedIds={selectedIds} onToggle={handleToggle} />
      <div className="mt-auto">
        <CallListFooter
          allSelected={selectedIds.length === STATIC_CALL_LIST.length}
          onSelectAll={handleSelectAll}
          onCall={handleCall}
          disabled={selectedIds.length === 0}
        />
        <PostServiceCallsPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          buttonClassName="bg-[#E5E7EB] hover:bg-[#D4D4D8] text-[#27272A]"
          activeButtonClassName="bg-[#F97316] text-white"
        />
      </div>
    </div>
  );
} 