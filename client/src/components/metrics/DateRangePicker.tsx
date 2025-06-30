
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  groupBy: string;
  filterType: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onGroupByChange: (value: string) => void;
  onFilterTypeChange: (value: string) => void;
}

export const DateRangePicker = ({
  startDate,
  endDate,
  groupBy,
  filterType,
  onStartDateChange,
  onEndDateChange,
  onGroupByChange,
  onFilterTypeChange,
}: DateRangePickerProps) => {
  return (
    <div className="flex items-center space-x-4 flex-wrap gap-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">From:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-36 justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">To:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-36 justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
              className="p-3 pointer-events-auto"
              disabled={(date) => startDate ? date < startDate : false}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">grouped by</span>
        <Select value={groupBy} onValueChange={onGroupByChange}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Day">Day</SelectItem>
            <SelectItem value="Month">Month</SelectItem>
            <SelectItem value="Quarter">Quarter</SelectItem>
            <SelectItem value="Yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select value={filterType} onValueChange={onFilterTypeChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Types">All Types</SelectItem>
          <SelectItem value="Feedback Calls">Feedback Calls</SelectItem>
          <SelectItem value="Bookings">Bookings</SelectItem>
          <SelectItem value="Inquiries">Inquiries</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
