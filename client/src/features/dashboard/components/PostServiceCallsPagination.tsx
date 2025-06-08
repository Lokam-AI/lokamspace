interface PostServiceCallsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  buttonClassName?: string;
  activeButtonClassName?: string;
}

export default function PostServiceCallsPagination({ currentPage, totalPages, onPageChange, buttonClassName = "bg-[#E5E7EB] hover:bg-[#D4D4D8] text-[#27272A]", activeButtonClassName = "bg-[#F97316] text-white" }: PostServiceCallsPaginationProps) {
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    pages.push(i);
  }
  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <button
        className={`px-2 py-1 rounded border border-[#E3E3E7] text-xs disabled:opacity-50 ${buttonClassName}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded text-xs font-semibold border border-[#E3E3E7] ${currentPage === page ? activeButtonClassName : buttonClassName}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      {totalPages > 5 && <span className="px-2">...</span>}
      <button
        className={`px-2 py-1 rounded border border-[#E3E3E7] text-xs disabled:opacity-50 ${buttonClassName}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
} 