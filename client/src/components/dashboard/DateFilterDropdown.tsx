
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface DateFilterDropdownProps {
  onFilterChange: (filter: string) => void;
  onExport: () => Promise<void>;
  isExporting?: boolean;
}

export const DateFilterDropdown = ({ onFilterChange, onExport, isExporting = false }: DateFilterDropdownProps) => {
  const [selectedFilter, setSelectedFilter] = useState("This Month");

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    onFilterChange(value);
  };

  const handleExport = async () => {
    if (!isExporting) {
      await onExport();
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <Select value={selectedFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-40">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="This Week">This Week</SelectItem>
          <SelectItem value="This Month">This Month</SelectItem>
          <SelectItem value="This Quarter">This Quarter</SelectItem>
          <SelectItem value="This Year">This Year</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? "Generating..." : "Export PDF"}
      </Button>
    </div>
  );
};
