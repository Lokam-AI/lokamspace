
import { useState } from "react";
import { MetricsKPICards } from "./MetricsKPICards";
import { CallAnalysisCharts } from "./CallAnalysisCharts";
import { DateRangePicker } from "./DateRangePicker";

export const MetricsSection = () => {
  // Get the first day of the current month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  
  // Get the last day of the current month
  const lastDayOfMonth = new Date();
  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  lastDayOfMonth.setDate(0);
  
  const [startDate, setStartDate] = useState<Date | undefined>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<Date | undefined>(lastDayOfMonth);

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header with Enhanced Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-foreground">Metrics</h2>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
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
        <CallAnalysisCharts 
          startDate={startDate?.toISOString().split('T')[0]}
          endDate={endDate?.toISOString().split('T')[0]}
        />
      </div>
    </div>
  );
};
