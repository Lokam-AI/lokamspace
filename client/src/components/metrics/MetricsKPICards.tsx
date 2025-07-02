
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const MetricsKPICards = () => {
  // Sample data for the charts
  const totalMinutesData = [
    { date: "May 28", value: 128.5 },
    { date: "May 30", value: 132.8 },
    { date: "Jun 1", value: 125.2 },
    { date: "Jun 3", value: 145.1 },
    { date: "Jun 5", value: 138.9 },
    { date: "Jun 7", value: 152.3 },
    { date: "Jun 9", value: 147.8 },
    { date: "Jun 11", value: 134.2 },
    { date: "Jun 13", value: 162.7 },
    { date: "Jun 15", value: 149.5 },
    { date: "Jun 17", value: 171.2 },
    { date: "Jun 19", value: 156.8 },
    { date: "Jun 21", value: 168.4 },
    { date: "Jun 23", value: 145.9 },
    { date: "Jun 25", value: 154.7 },
    { date: "Jun 27", value: 137.21 }
  ];

  const numberOfCallsData = [
    { date: "May 28", value: 142 },
    { date: "May 30", value: 148 },
    { date: "Jun 1", value: 135 },
    { date: "Jun 3", value: 162 },
    { date: "Jun 5", value: 158 },
    { date: "Jun 7", value: 175 },
    { date: "Jun 9", value: 169 },
    { date: "Jun 11", value: 144 },
    { date: "Jun 13", value: 182 },
    { date: "Jun 15", value: 165 },
    { date: "Jun 17", value: 189 },
    { date: "Jun 19", value: 172 },
    { date: "Jun 21", value: 178 },
    { date: "Jun 23", value: 156 },
    { date: "Jun 25", value: 164 },
    { date: "Jun 27", value: 152 }
  ];

  const totalSpentData = [
    { date: "May 28", value: 12.85 },
    { date: "May 30", value: 13.42 },
    { date: "Jun 1", value: 11.98 },
    { date: "Jun 3", value: 15.67 },
    { date: "Jun 5", value: 14.23 },
    { date: "Jun 7", value: 16.89 },
    { date: "Jun 9", value: 15.45 },
    { date: "Jun 11", value: 13.12 },
    { date: "Jun 13", value: 17.34 },
    { date: "Jun 15", value: 15.78 },
    { date: "Jun 17", value: 18.92 },
    { date: "Jun 19", value: 16.55 },
    { date: "Jun 21", value: 17.83 },
    { date: "Jun 23", value: 14.67 },
    { date: "Jun 25", value: 15.89 },
    { date: "Jun 27", value: 14.29 }
  ];

  const avgCostData = [
    { date: "May 28", value: 0.091 },
    { date: "May 30", value: 0.088 },
    { date: "Jun 1", value: 0.095 },
    { date: "Jun 3", value: 0.087 },
    { date: "Jun 5", value: 0.092 },
    { date: "Jun 7", value: 0.085 },
    { date: "Jun 9", value: 0.089 },
    { date: "Jun 11", value: 0.093 },
    { date: "Jun 13", value: 0.082 },
    { date: "Jun 15", value: 0.088 },
    { date: "Jun 17", value: 0.081 },
    { date: "Jun 19", value: 0.086 },
    { date: "Jun 21", value: 0.084 },
    { date: "Jun 23", value: 0.091 },
    { date: "Jun 25", value: 0.087 },
    { date: "Jun 27", value: 0.090 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
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
      value: "137.21",
      data: totalMinutesData,
      color: "hsl(var(--primary))",
      bgColor: "bg-primary/5 border-primary/20"
    },
    {
      title: "Number of Calls",
      value: "152",
      data: numberOfCallsData,
      color: "hsl(var(--warning))",
      bgColor: "bg-warning/5 border-warning/20"
    },
    {
      title: "Total Spent",
      value: "$14.29",
      data: totalSpentData,
      color: "hsl(var(--secondary))",
      bgColor: "bg-secondary/5 border-secondary/20"
    },
    {
      title: "Average Cost per Call",
      value: "$0.09",
      data: avgCostData,
      color: "hsl(var(--accent))",
      bgColor: "bg-accent/5 border-accent/20"
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
