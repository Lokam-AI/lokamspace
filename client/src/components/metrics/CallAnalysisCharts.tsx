import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const CallAnalysisCharts = () => {
  // Updated data with only 3 call types: Feedback Calls, Bookings, Inquiries
  const reasonCallEndedData = [
    { reason: "Customer Ended", count: 45, color: "#3b82f6" },
    { reason: "Assistant Ended", count: 32, color: "#10b981" },
    { reason: "Transfer Failed", count: 18, color: "#f59e0b" },
    { reason: "Error", count: 12, color: "#ef4444" },
    { reason: "Timeout", count: 8, color: "#8b5cf6" },
    { reason: "Other", count: 5, color: "#6b7280" }
  ];

  // Updated data with only the 3 call types
  const avgDurationByTypeData = [
    { type: "Feedback Calls", duration: 4.2, color: "#3b82f6" },
    { type: "Bookings", duration: 3.8, color: "#10b981" },
    { type: "Inquiries", duration: 2.9, color: "#f59e0b" }
  ];

  // Updated cost breakdown with only the 3 call types
  const costBreakdownData = [
    { type: "Feedback Calls", cost: 52.3, percentage: 45 },
    { type: "Bookings", cost: 38.7, percentage: 33 },
    { type: "Inquiries", cost: 25.8, percentage: 22 }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

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
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
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
                <Bar dataKey="duration" radius={[4, 4, 0, 0]} fill="hsl(var(--secondary))" />
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
    </div>
  );
};
