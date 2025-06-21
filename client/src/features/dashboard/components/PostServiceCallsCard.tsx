'use client';
import { useState } from "react";
import PostServiceCallsToolbar from "./PostServiceCallsToolbar";
import PostServiceCallsTable from "./PostServiceCallsTable";
import PostServiceCallsPagination from "./PostServiceCallsPagination";
import { STATIC_SERVICE_CALLS } from "@/data/staticData";

const PAGE_SIZE = 5;

export default function PostServiceCallsCard() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = STATIC_SERVICE_CALLS.filter(
    c =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
      c.service_details.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return b.service_date.localeCompare(a.service_date);
    if (sort === "oldest") return a.service_date.localeCompare(b.service_date);
    if (sort === "score") return b.call_interactions[0].overall_score - a.call_interactions[0].overall_score;
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
    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 w-full">
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