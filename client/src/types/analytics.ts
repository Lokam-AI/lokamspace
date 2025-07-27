export interface CallsSummaryMetrics {
  total_count: number;
  completed_count: number;
  avg_nps: number;
  detractors_count: number;
}

export interface TrendDataPoint {
  name: string;
  value: number;
}

export interface MonthOverMonthChange {
  change: string;
  changeType: "positive" | "negative" | "neutral";
  hasData: boolean;
}

export interface CallsSummaryMetricsWithTrends extends CallsSummaryMetrics {
  trends: {
    total_calls: TrendDataPoint[];
    completed_calls: TrendDataPoint[];
    nps: TrendDataPoint[];
    detractors: TrendDataPoint[];
  };
  month_over_month: {
    total_calls: MonthOverMonthChange;
    completed_calls: MonthOverMonthChange;
    nps: MonthOverMonthChange;
    detractors: MonthOverMonthChange;
  };
}