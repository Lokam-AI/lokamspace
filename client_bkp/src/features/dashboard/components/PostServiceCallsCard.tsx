'use client';
import { useState } from "react";
import PostServiceCallsToolbar from "./PostServiceCallsToolbar";
import PostServiceCallsTable from "./PostServiceCallsTable";
import PostServiceCallsPagination from "./PostServiceCallsPagination";

const allCalls = [
  {
    vehicle_number: "ABC-1234",
    service_details: "Tire Replacement - Completed routine maintenance and inspection",
    service_date: "2025-01-09T02:14:44.854405",
    id: 1,
    customer_id: 1,
    customer_name: "John Smith",
    customer_email: "john.smith@email.com",
    customer_phone: "9029897685",
    assigned_user_id: 1,
    created_at: "2025-01-09T02:14:44.854405",
    status: "pending",
    call_interactions: [
      {
        id: 1,
        call_date: "2025-01-10T02:14:44.854405",
        status: "completed",
        duration_seconds: 291,
        transcription: "Customer satisfaction call for John Smith. Discussed tire replacement service experience.",
        overall_feedback: "Great service experience at Lokam.ai. The tire replacement was handled professionally.",
        overall_score: 4.5,
        timeliness_score: 3.3,
        cleanliness_score: 4.4,
        advisor_helpfulness_score: 4.7,
        work_quality_score: 4.4,
        recommendation_score: 3.7,
        action_items: "Follow up on warranty information",
        completed_at: "2025-01-10T02:36:44.854405"
      }
    ]
  },
  {
    vehicle_number: "XYZ-5678",
    service_details: "Oil Change - Routine oil and filter replacement",
    service_date: "2025-01-12T10:00:00.000000",
    id: 2,
    customer_id: 2,
    customer_name: "Jane Doe",
    customer_email: "jane.doe@email.com",
    customer_phone: "9876543210",
    assigned_user_id: 2,
    created_at: "2025-01-12T10:00:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 2,
        call_date: "2025-01-13T11:00:00.000000",
        status: "completed",
        duration_seconds: 180,
        transcription: "Customer satisfaction call for Jane Doe. Discussed oil change experience.",
        overall_feedback: "Quick and efficient service. Satisfied with the oil change.",
        overall_score: 4.8,
        timeliness_score: 4.5,
        cleanliness_score: 4.8,
        advisor_helpfulness_score: 4.9,
        work_quality_score: 4.7,
        recommendation_score: 4.6,
        action_items: "Send service reminder for next oil change",
        completed_at: "2025-01-13T11:30:00.000000"
      }
    ]
  }
];

const PAGE_SIZE = 8;

export default function PostServiceCallsCard() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = allCalls.filter(
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
    <div className="bg-white rounded-xl shadow p-4 flex flex-col min-w-[320px]">
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