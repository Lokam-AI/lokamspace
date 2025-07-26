
import React from 'react';
import { 
  Phone, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCallsSummaryMetricsWithTrends } from '@/api/queries/calls';
import { CallsSummaryMetricsWithTrends } from '@/types/analytics';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface MetricData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  hasData: boolean;
  icon: React.ComponentType<any>;
  description: string;
  data: Array<{ name: string; value: number }>;
  color: string;
}

export const MetricsGrid = () => {
  const { data: summaryData, isLoading, error, refetch } = useCallsSummaryMetricsWithTrends();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-red-500 mb-4">Failed to load dashboard metrics. Please try again.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Default values if no data
  const metrics: CallsSummaryMetricsWithTrends = summaryData || { 
    total_count: 0, 
    completed_count: 0, 
    avg_nps: 0, 
    detractors_count: 0,
    trends: {
      total_calls: [],
      completed_calls: [],
      nps: [],
      detractors: []
    },
    month_over_month: {
      total_calls: { change: "0%", changeType: "neutral", hasData: false },
      completed_calls: { change: "0%", changeType: "neutral", hasData: false },
      nps: { change: "0%", changeType: "neutral", hasData: false },
      detractors: { change: "0%", changeType: "neutral", hasData: false }
    }
  };

  const metricsConfig: MetricData[] = [{
    title: "Total Calls",
    value: metrics.total_count.toLocaleString(),
    change: metrics.month_over_month.total_calls.change,
    changeType: metrics.month_over_month.total_calls.changeType,
    hasData: metrics.month_over_month.total_calls.hasData,
    icon: Phone,
    description: "vs last month",
    data: metrics.trends.total_calls,
    color: "#10b981"
  }, {
    title: "Completed Calls",
    value: metrics.completed_count.toLocaleString(),
    change: metrics.month_over_month.completed_calls.change,
    changeType: metrics.month_over_month.completed_calls.changeType,
    hasData: metrics.month_over_month.completed_calls.hasData,
    icon: CheckCircle,
    description: "vs last month",
    data: metrics.trends.completed_calls,
    color: "#3b82f6"
  }, {
    title: "Average NPS",
    value: metrics.avg_nps.toString(),
    change: metrics.month_over_month.nps.change,
    changeType: metrics.month_over_month.nps.changeType,
    hasData: metrics.month_over_month.nps.hasData,
    icon: TrendingUp,
    description: "vs last month",
    data: metrics.trends.nps,
    color: "#8b5cf6"
  }, {
    title: "Detractors",
    value: metrics.detractors_count.toString(),
    change: metrics.month_over_month.detractors.change,
    changeType: metrics.month_over_month.detractors.changeType,
    hasData: metrics.month_over_month.detractors.hasData,
    icon: AlertTriangle,
    description: "vs last month",
    data: metrics.trends.detractors,
    color: "#ef4444"
  }];

  // Custom tooltip component with theme-aware colors
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-foreground-secondary">
            Value: <span className="font-semibold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return TrendingUp;
      case "negative":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metricsConfig.map((metric, index) => {
        const Icon = metric.icon;
        const ChangeIcon = getChangeIcon(metric.changeType);
        return (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-xs font-medium text-foreground-secondary">
                  {metric.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="text-xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-center space-x-1">
                  {metric.hasData ? (
                    <>
                      <ChangeIcon className={`h-3 w-3 ${getChangeColor(metric.changeType)}`} />
                      <span className={`text-xs font-medium ${getChangeColor(metric.changeType)}`}>
                        {metric.change}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">
                      No previous data
                    </span>
                  )}
                </div>
                <div className="text-xs text-foreground-secondary">
                  {metric.description}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.data} margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5
                  }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{
                        fontSize: 8,
                        fill: 'hsl(var(--foreground-secondary))'
                      }} 
                      interval="preserveStartEnd" 
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={metric.color} 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={{
                        r: 3,
                        fill: metric.color
                      }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
