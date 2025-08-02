import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallAnalysisCharts, useCallTrends } from "@/hooks/useMetrics";

interface CallAnalysisChartsProps {
  startDate?: string;
  endDate?: string;
  groupBy?: string;
  filterType?: string;
}

export const CallAnalysisCharts = ({ 
  startDate, 
  endDate, 
  groupBy, 
  filterType 
}: CallAnalysisChartsProps) => {
  // Build API parameters based on props
  const apiParams = {
    ...(startDate && endDate ? { start_date: startDate, end_date: endDate } : { date_range: '30d' }),
    ...(groupBy && { group_by: groupBy }),
    ...(filterType && filterType !== 'All Types' && { filter_type: filterType })
  };

  // Fetch call analysis charts data from API
  const { data: chartsData, isLoading: chartsLoading, error: chartsError } = useCallAnalysisCharts(apiParams);
  
  // Fetch call trends data for daily distribution
  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useCallTrends(apiParams);

  // Use API data or fallback to empty arrays
  const reasonCallEndedData = chartsData?.reason_call_ended || [];
  const avgDurationByTypeData = chartsData?.avg_duration_by_type || [];
  const costBreakdownData = chartsData?.cost_breakdown || [];
  const dailyDistributionData = trendsData?.trends || [];

  const COLORS = ['#3b82f6', '#f97316', '#10b981'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 border border-border rounded-xl shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          <p className="text-sm text-foreground-secondary">
            {payload[0].name}: <span className="font-semibold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-4 border border-border rounded-xl shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{data.type}</p>
          <div className="space-y-1">
            <p className="text-sm text-foreground-secondary">
              Cost: <span className="font-semibold text-foreground">${data.cost}</span>
            </p>
            <p className="text-sm text-foreground-secondary">
              Percentage: <span className="font-semibold text-foreground">{data.percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (chartsLoading || trendsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-lg border-border bg-card rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (chartsError || trendsError) {
    const error = chartsError || trendsError;
    console.error('Call analysis charts error:', error);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-2 shadow-lg border-border bg-card rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-foreground-secondary mb-2">Failed to load call analysis data</p>
              <p className="text-sm text-foreground-secondary">Please try again later</p>
              <details className="mt-4 text-left">
                <summary className="text-sm cursor-pointer">Error details (click to expand)</summary>
                <pre className="text-xs mt-2 p-2 bg-muted rounded text-red-600 overflow-auto">
                  {error instanceof Error ? error.message : String(error)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Reason Call Ended */}
      <Card className="shadow-lg border-border bg-card rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <CardTitle className="text-xl font-semibold text-foreground">Reason Call Ended</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={reasonCallEndedData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="reason" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground-secondary))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="hsl(var(--border))"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground-secondary))' }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {reasonCallEndedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Average Call Duration by Type */}
      <Card className="shadow-lg border-border bg-card rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-secondary/10 border-b border-border">
          <CardTitle className="text-xl font-semibold text-foreground">Average Call Duration by Type</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={avgDurationByTypeData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="type" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground-secondary))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="hsl(var(--border))"
                />
                <YAxis 
                  label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--foreground-secondary))' } }}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground-secondary))' }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                  {avgDurationByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown - Full Width */}
      <Card className="lg:col-span-2 shadow-lg border-border bg-card rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-accent/10 border-b border-border">
          <CardTitle className="text-xl font-semibold text-foreground">Cost Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="cost"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">Cost Details</h4>
              <div className="space-y-4">
                {costBreakdownData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-semibold text-foreground">{item.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">${item.cost}</div>
                      <div className="text-sm text-foreground-secondary font-medium">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-foreground">Total Cost:</span>
                  <span className="text-xl font-bold text-primary">
                    ${costBreakdownData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Distribution - Full Width */}
      <Card className="lg:col-span-2 shadow-lg border-border bg-card rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <CardTitle className="text-xl font-semibold text-foreground">Daily Call Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyDistributionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                barCategoryGap={dailyDistributionData.length > 15 ? "5%" : "30%"}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--foreground-secondary))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="hsl(var(--border))"
                  tickFormatter={(value) => {
                    // Format date to show day and month (e.g., "15 Aug")
                    const date = new Date(value);
                    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                  }}
                  interval={0} // Show all ticks for all days
                />
                <YAxis
                  label={{ value: 'Number of Calls', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--foreground-secondary))' } }}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground-secondary))' }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  formatter={(value, name) => [value, name === 'demo_calls' ? 'Demo Calls' : 'Service Calls']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: 20 }}
                  formatter={(value) => value === 'demo_calls' ? 'Demo Calls' : 'Service Calls'}
                />
                <Bar dataKey="demo_calls" stackId="a" name="demo_calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="service_calls" stackId="a" name="service_calls" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
