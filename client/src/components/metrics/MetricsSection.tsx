
import { useState } from "react";
import { MetricsKPICards } from "./MetricsKPICards";
import { CallAnalysisCharts } from "./CallAnalysisCharts";
import { DateRangePicker } from "./DateRangePicker";

export const MetricsSection = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date('2025-05-28'));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date('2025-06-28'));
  const [groupBy, setGroupBy] = useState("Day");
  const [filterType, setFilterType] = useState("All Types");

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header with Enhanced Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-foreground">Metrics</h2>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          groupBy={groupBy}
          filterType={filterType}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onGroupByChange={setGroupBy}
          onFilterTypeChange={setFilterType}
        />
      </div>

      {/* KPI Cards */}
      <MetricsKPICards 
        startDate={startDate?.toISOString().split('T')[0]}
        endDate={endDate?.toISOString().split('T')[0]}
      />

      {/* Call Analysis */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-foreground">Call Analysis</h3>
        <CallAnalysisCharts />
      </div>
    </div>
  );
};
