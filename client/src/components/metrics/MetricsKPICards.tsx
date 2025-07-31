
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMetricsKPIs, useCallTrends, formatCurrency, formatNumber, calculateAverageCostPerCall } from "@/hooks/useMetrics";

interface MetricsKPICardsProps {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
  filterType?: string;
}

export const MetricsKPICards = ({ 
  dateRange = "7d", 
  startDate, 
  endDate,
  groupBy,
  filterType
}: MetricsKPICardsProps) => {
  // Build API parameters
  const apiParams = {
    ...(startDate && endDate ? { start_date: startDate, end_date: endDate } : { date_range: dateRange }),
    ...(groupBy && { group_by: groupBy }),
    ...(filterType && filterType !== 'All Types' && { filter_type: filterType })
  };

  // Fetch KPI data
  const { 
    data: kpiData, 
    isLoading: kpiLoading, 
    error: kpiError 
  } = useMetricsKPIs(apiParams);

  // Fetch trends data for charts
  const { 
    data: trendsData, 
    isLoading: trendsLoading, 
    error: trendsError 
  } = useCallTrends({ 
    date_range: dateRange,
    ...(groupBy && { group_by: groupBy })
  });

  const isLoading = kpiLoading || trendsLoading;
  const hasError = kpiError || trendsError;

  // Show loading state
  if (isLoading) {
    return <MetricsKPICardsSkeleton />;
  }

  // Show error state
  if (hasError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load metrics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Return early if no data
  if (!kpiData || !trendsData) {
    return null;
  }

  // Transform trends data for charts
  const transformTrendsForChart = (key: 'calls' | 'minutes' | 'cost') => {
    return trendsData.trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: trend[key]
    }));
  };

  // Calculate average cost per call
  const avgCostPerCall = calculateAverageCostPerCall(kpiData.total_spend, kpiData.total_calls);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-foreground-secondary">
            Value: <span className="font-semibold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const metrics = [
    {
      title: "Total Call Minutes",
      value: formatNumber(kpiData.total_minutes),
      data: transformTrendsForChart('minutes'),
      color: "#3b82f6",
      bgColor: "bg-blue-50 border-blue-200"
    },
    {
      title: "Number of Calls",
      value: formatNumber(kpiData.total_calls),
      data: transformTrendsForChart('calls'),
      color: "#f97316",
      bgColor: "bg-orange-50 border-orange-200"
    },
    {
      title: "Total Spent",
      value: formatCurrency(kpiData.total_spend),
      data: transformTrendsForChart('cost'),
      color: "#10b981",
      bgColor: "bg-green-50 border-green-200"
    },
    {
      title: "Average NPS",
      value: kpiData.average_nps !== null ? kpiData.average_nps.toFixed(1) : "N/A",
      data: transformTrendsForChart('calls'), // Use calls trends for NPS visualization
      color: "#8b5cf6",
      bgColor: "bg-purple-50 border-purple-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className={`${metric.bgColor} border-2`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground mb-4">
              {metric.value}
            </div>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metric.data}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={metric.color}
                    fill={metric.color}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Loading skeleton component
const MetricsKPICardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="border-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
