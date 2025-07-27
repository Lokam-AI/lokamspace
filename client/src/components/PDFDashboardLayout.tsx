import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, CheckCircle, TrendingUp, TrendingDown, AlertTriangle, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { CallsSummaryMetricsWithTrends } from '@/types/analytics';

interface PDFDashboardLayoutProps {
  metrics: CallsSummaryMetricsWithTrends;
}

export const PDFDashboardLayout: React.FC<PDFDashboardLayoutProps> = ({ metrics }) => {
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

  const metricsConfig = [{
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

  // Mock data for insights (you can replace with real data later)
  const positiveMentions = [
    { topic: "Professional Service", count: 89, percentage: 45 },
    { topic: "Quick Response", count: 67, percentage: 35 },
    { topic: "Knowledgeable Staff", count: 45, percentage: 24 },
    { topic: "Fair Pricing", count: 38, percentage: 16 },
    { topic: "Clean Facility", count: 29, percentage: 12 }
  ];

  const areasToImprove = [
    { topic: "Wait Time", count: 34, percentage: 45 },
    { topic: "Communication", count: 28, percentage: 35 },
    { topic: "Follow-up", count: 19, percentage: 24 },
    { topic: "Scheduling", count: 15, percentage: 16 },
    { topic: "Pricing Clarity", count: 12, percentage: 12 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-semibold text-gray-900">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-12 space-y-10" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard Report</h1>
        <p className="text-xl text-gray-600">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Metrics Grid - 2x2 Layout */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-8">
          {metricsConfig.map((metric, index) => {
            const Icon = metric.icon;
            const ChangeIcon = getChangeIcon(metric.changeType);
            return (
              <Card key={index} className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col space-y-2">
                    <CardTitle className="text-lg font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {metric.value}
                      </div>
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {metric.hasData ? (
                        <>
                          <ChangeIcon className={`h-4 w-4 ${getChangeColor(metric.changeType)}`} />
                          <span className={`text-base font-medium ${getChangeColor(metric.changeType)}`}>
                            {metric.change}
                          </span>
                        </>
                      ) : (
                        <span className="text-base text-gray-500">
                          No previous data
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {metric.description}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-32 w-full">
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
                            fill: '#6b7280'
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
      </div>

      {/* Insights Section - Side by Side */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Customer Insights</h2>
        <div className="grid grid-cols-2 gap-10">
          {/* Top Positive Mentions */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Top Positive Mentions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {positiveMentions.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900">{item.topic}</span>
                    <span className="text-base text-gray-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Areas to Improve */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Areas to Improve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {areasToImprove.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900">{item.topic}</span>
                    <span className="text-base text-gray-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 