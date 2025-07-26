export interface CallsSummaryMetrics {
  total_count: number;
  completed_count: number;
  avg_nps: number;
  detractors_count: number;
  historical_data: {
    total_calls: Array<{ name: string; value: number }>;
    completed_calls: Array<{ name: string; value: number }>;
    nps: Array<{ name: string; value: number }>;
    detractors: Array<{ name: string; value: number }>;
  };
}