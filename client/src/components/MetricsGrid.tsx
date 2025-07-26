
import React from 'react';
import { 
  Phone, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCallsSummaryMetrics } from '@/api/queries/calls';
import { CallsSummaryMetrics } from '@/types/analytics';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface MetricData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ComponentType<any>;
  description: string;
  data: Array<{ name: string; value: number }>;
  color: string;
}

export const MetricsGrid = () => {
  const { data: summaryData, isLoading, error, refetch } = useCallsSummaryMetrics();

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
  const metrics: CallsSummaryMetrics = summaryData || { total_count: 0, completed_count: 0, avg_nps: 0, detractors_count: 0 };

  // Static chart data (can be enhanced later with real historical data)
  const totalCallsData = [
    { name: "Jan", value: 800 },
    { name: "Feb", value: 950 },
    { name: "Mar", value: 1100 },
    { name: "Apr", value: 1200 },
    { name: "May", value: 1150 },
    { name: "Jun", value: metrics.total_count || 1247 }
  ];

  const completedCallsData = [
    { name: "Jan", value: 720 },
    { name: "Feb", value: 850 },
    { name: "Mar", value: 980 },
    { name: "Apr", value: 1050 },
    { name: "May", value: 1000 },
    { name: "Jun", value: metrics.completed_count || 1089 }
  ];

  const npsData = [
    { name: "Jan", value: 7.2 },
    { name: "Feb", value: 7.4 },
    { name: "Mar", value: 7.6 },
    { name: "Apr", value: 7.5 },
    { name: "May", value: 7.7 },
    { name: "Jun", value: metrics.avg_nps || 7.8 }
  ];

  const detractorsData = [
    { name: "Jan", value: 60 },
    { name: "Feb", value: 55 },
    { name: "Mar", value: 50 },
    { name: "Apr", value: 48 },
    { name: "May", value: 45 },
    { name: "Jun", value: metrics.detractors_count || 43 }
  ];

  const metricsConfig: MetricData[] = [{
    title: "Total Calls",
    value: metrics.total_count.toLocaleString(),
    change: "+12%",
    changeType: "positive" as const,
    icon: Phone,
    description: "Compared to previous month",
    data: totalCallsData,
    color: "#10b981"
  }, {
    title: "Completed Calls",
    value: metrics.completed_count.toLocaleString(),
    change: "+8%",
    changeType: "positive" as const,
    icon: CheckCircle,
    description: "Compared to previous month",
    data: completedCallsData,
    color: "#3b82f6"
  }, {
    title: "Average NPS",
    value: metrics.avg_nps.toString(),
    change: "+0.3",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Compared to previous month",
    data: npsData,
    color: "#8b5cf6"
  }, {
    title: "Detractors",
    value: metrics.detractors_count.toString(),
    change: "-5",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "Compared to previous month",
    data: detractorsData,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metricsConfig.map((metric, index) => {
        const Icon = metric.icon;
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
                  <span className={`text-xs font-medium ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </span>
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
