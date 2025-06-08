'use client';
import { useState } from "react";
import PostServiceCallsToolbar from "./PostServiceCallsToolbar";
import PostServiceCallsTable from "./PostServiceCallsTable";
import PostServiceCallsPagination from "./PostServiceCallsPagination";

const allCalls = [
  {
    customer: "John Doe",
    callDate: "2024-06-01",
    vehicleNumber: "AB12CD3456",
    serviceDate: "2024-05-28",
    transcription: "The service was excellent. I am very satisfied.",
    score: 92,
  },
  {
    customer: "Jane Smith",
    callDate: "2024-06-02",
    vehicleNumber: "XY98ZT4321",
    serviceDate: "2024-05-30",
    transcription: "The advisor was helpful, but the car was not very clean.",
    score: 78,
  },
];

const PAGE_SIZE = 8;

export default function PostServiceCallsCard() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = allCalls.filter(
    c =>
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.transcription.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return b.callDate.localeCompare(a.callDate);
    if (sort === "oldest") return a.callDate.localeCompare(b.callDate);
    if (sort === "score") return b.score - a.score;
    return 0;
  });

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page if search or sort changes
  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }
  function handleSortChange(val: string) {
    setSort(val);
    setPage(1);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-6xl flex flex-col gap-4" style={{ minWidth: 0, flexBasis: '70%' }}>
      <div className="flex flex-row items-center justify-between gap-2 mb-4 w-full">
        <h6 className="text-lg text-black font-bold whitespace-nowrap">Post Service Calls</h6>
        <PostServiceCallsToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          sortValue={sort}
          onSortChange={handleSortChange}
        />
      </div>
      <PostServiceCallsTable calls={paged} />
      <PostServiceCallsPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        buttonClassName="bg-[#E5E7EB] hover:bg-[#D4D4D8] text-[#27272A]"
        activeButtonClassName="bg-[#F97316] text-white"
      />
    </div>
  );
} 