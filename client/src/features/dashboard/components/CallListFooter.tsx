interface CallListFooterProps {
  allSelected: boolean;
  onSelectAll: () => void;
  onCall: () => void;
  disabled?: boolean;
}

export default function CallListFooter({ allSelected, onSelectAll, onCall, disabled }: CallListFooterProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB] mt-2">
      <label className="flex items-center gap-2 text-sm text-[#27272A]">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onSelectAll}
          className="accent-[#F97316] w-4 h-4"
        />
        Select All
      </label>
      <button
        className="bg-[#F97316] text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-50"
        onClick={onCall}
        disabled={disabled}
      >
        Call
      </button>
    </div>
  );
} 