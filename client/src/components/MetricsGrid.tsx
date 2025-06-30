
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const MetricsGrid = () => {
  // Sample data for charts with proper weekly dates
  const totalCallsData = [{
    date: "May 28",
    value: 95,
    fullDate: "May 28, 2024"
  }, {
    date: "May 30",
    value: 102,
    fullDate: "May 30, 2024"
  }, {
    date: "Jun 1",
    value: 89,
    fullDate: "Jun 1, 2024"
  }, {
    date: "Jun 3",
    value: 115,
    fullDate: "Jun 3, 2024"
  }, {
    date: "Jun 5",
    value: 108,
    fullDate: "Jun 5, 2024"
  }, {
    date: "Jun 7",
    value: 125,
    fullDate: "Jun 7, 2024"
  }, {
    date: "Jun 9",
    value: 112,
    fullDate: "Jun 9, 2024"
  }, {
    date: "Jun 11",
    value: 98,
    fullDate: "Jun 11, 2024"
  }, {
    date: "Jun 13",
    value: 135,
    fullDate: "Jun 13, 2024"
  }, {
    date: "Jun 15",
    value: 118,
    fullDate: "Jun 15, 2024"
  }, {
    date: "Jun 17",
    value: 142,
    fullDate: "Jun 17, 2024"
  }, {
    date: "Jun 19",
    value: 128,
    fullDate: "Jun 19, 2024"
  }, {
    date: "Jun 21",
    value: 156,
    fullDate: "Jun 21, 2024"
  }, {
    date: "Jun 23",
    value: 134,
    fullDate: "Jun 23, 2024"
  }, {
    date: "Jun 25",
    value: 147,
    fullDate: "Jun 25, 2024"
  }, {
    date: "Jun 27",
    value: 162,
    fullDate: "Jun 27, 2024"
  }];

  const completedCallsData = [{
    date: "May 28",
    value: 88,
    fullDate: "May 28, 2024"
  }, {
    date: "May 30",
    value: 95,
    fullDate: "May 30, 2024"
  }, {
    date: "Jun 1",
    value: 82,
    fullDate: "Jun 1, 2024"
  }, {
    date: "Jun 3",
    value: 105,
    fullDate: "Jun 3, 2024"
  }, {
    date: "Jun 5",
    value: 98,
    fullDate: "Jun 5, 2024"
  }, {
    date: "Jun 7",
    value: 115,
    fullDate: "Jun 7, 2024"
  }, {
    date: "Jun 9",
    value: 102,
    fullDate: "Jun 9, 2024"
  }, {
    date: "Jun 11",
    value: 89,
    fullDate: "Jun 11, 2024"
  }, {
    date: "Jun 13",
    value: 122,
    fullDate: "Jun 13, 2024"
  }, {
    date: "Jun 15",
    value: 108,
    fullDate: "Jun 15, 2024"
  }, {
    date: "Jun 17",
    value: 128,
    fullDate: "Jun 17, 2024"
  }, {
    date: "Jun 19",
    value: 115,
    fullDate: "Jun 19, 2024"
  }, {
    date: "Jun 21",
    value: 138,
    fullDate: "Jun 21, 2024"
  }, {
    date: "Jun 23",
    value: 121,
    fullDate: "Jun 23, 2024"
  }, {
    date: "Jun 25",
    value: 132,
    fullDate: "Jun 25, 2024"
  }, {
    date: "Jun 27",
    value: 145,
    fullDate: "Jun 27, 2024"
  }];

  const npsData = [{
    date: "May 28",
    value: 7.2,
    fullDate: "May 28, 2024"
  }, {
    date: "May 30",
    value: 7.4,
    fullDate: "May 30, 2024"
  }, {
    date: "Jun 1",
    value: 7.1,
    fullDate: "Jun 1, 2024"
  }, {
    date: "Jun 3",
    value: 7.6,
    fullDate: "Jun 3, 2024"
  }, {
    date: "Jun 5",
    value: 7.3,
    fullDate: "Jun 5, 2024"
  }, {
    date: "Jun 7",
    value: 7.8,
    fullDate: "Jun 7, 2024"
  }, {
    date: "Jun 9",
    value: 7.5,
    fullDate: "Jun 9, 2024"
  }, {
    date: "Jun 11",
    value: 7.2,
    fullDate: "Jun 11, 2024"
  }, {
    date: "Jun 13",
    value: 8.1,
    fullDate: "Jun 13, 2024"
  }, {
    date: "Jun 15",
    value: 7.7,
    fullDate: "Jun 15, 2024"
  }, {
    date: "Jun 17",
    value: 8.2,
    fullDate: "Jun 17, 2024"
  }, {
    date: "Jun 19",
    value: 7.9,
    fullDate: "Jun 19, 2024"
  }, {
    date: "Jun 21",
    value: 8.4,
    fullDate: "Jun 21, 2024"
  }, {
    date: "Jun 23",
    value: 7.6,
    fullDate: "Jun 23, 2024"
  }, {
    date: "Jun 25",
    value: 8.0,
    fullDate: "Jun 25, 2024"
  }, {
    date: "Jun 27",
    value: 8.2,
    fullDate: "Jun 27, 2024"
  }];

  const detractorsData = [{
    date: "May 28",
    value: 52,
    fullDate: "May 28, 2024"
  }, {
    date: "May 30",
    value: 48,
    fullDate: "May 30, 2024"
  }, {
    date: "Jun 1",
    value: 55,
    fullDate: "Jun 1, 2024"
  }, {
    date: "Jun 3",
    value: 42,
    fullDate: "Jun 3, 2024"
  }, {
    date: "Jun 5",
    value: 45,
    fullDate: "Jun 5, 2024"
  }, {
    date: "Jun 7",
    value: 38,
    fullDate: "Jun 7, 2024"
  }, {
    date: "Jun 9",
    value: 41,
    fullDate: "Jun 9, 2024"
  }, {
    date: "Jun 11",
    value: 47,
    fullDate: "Jun 11, 2024"
  }, {
    date: "Jun 13",
    value: 35,
    fullDate: "Jun 13, 2024"
  }, {
    date: "Jun 15",
    value: 39,
    fullDate: "Jun 15, 2024"
  }, {
    date: "Jun 17",
    value: 32,
    fullDate: "Jun 17, 2024"
  }, {
    date: "Jun 19",
    value: 36,
    fullDate: "Jun 19, 2024"
  }, {
    date: "Jun 21",
    value: 28,
    fullDate: "Jun 21, 2024"
  }, {
    date: "Jun 23",
    value: 40,
    fullDate: "Jun 23, 2024"
  }, {
    date: "Jun 25",
    value: 33,
    fullDate: "Jun 25, 2024"
  }, {
    date: "Jun 27",
    value: 29,
    fullDate: "Jun 27, 2024"
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
          <p className="text-sm font-medium text-foreground">{data.fullDate}</p>
          <p className="text-sm text-foreground-secondary">
            Value: <span className="font-semibold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const metrics = [{
    title: "Total Calls",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: Phone,
    description: "Compared to previous month",
    data: totalCallsData,
    color: "#10b981"
  }, {
    title: "Completed Calls",
    value: "1,089",
    change: "+8%",
    changeType: "positive" as const,
    icon: CheckCircle,
    description: "Compared to previous month",
    data: completedCallsData,
    color: "#3b82f6"
  }, {
    title: "Average NPS",
    value: "7.8",
    change: "+0.3",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Compared to previous month",
    data: npsData,
    color: "#8b5cf6"
  }, {
    title: "Detractors",
    value: "43",
    change: "-5",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "Compared to previous month",
    data: detractorsData,
    color: "#ef4444"
  }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => {
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
                      dataKey="date" 
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
