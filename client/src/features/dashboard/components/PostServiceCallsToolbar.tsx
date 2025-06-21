import { FaSearch } from "react-icons/fa";

interface PostServiceCallsToolbarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  sortValue: string;
  onSortChange: (v: string) => void;
}

export default function PostServiceCallsToolbar({ searchValue, onSearchChange, sortValue, onSortChange }: PostServiceCallsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 w-full">
      <div className="relative w-full sm:max-w-xs h-10 flex items-center">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="border border-[#E3E3E7] rounded-lg pl-9 pr-4 py-2 text-sm w-full h-10 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A] placeholder-[#71717A]"
        />
      </div>
      <div className="flex items-center gap-2 h-10">
        <span className="text-sm text-[#71717A]">Sort by:</span>
        <select
          value={sortValue}
          onChange={e => onSortChange(e.target.value)}
          className="border border-[#E3E3E7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[#27272A] h-10"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="score">Score</option>
        </select>
      </div>
    </div>
  );
} 