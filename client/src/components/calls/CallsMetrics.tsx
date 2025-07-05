import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  AlertTriangle,
  CheckCircle,
  Star,
  RefreshCw,
} from "lucide-react";
import { CallFilters } from "@/pages/Calls";
import { useEffect, useState } from "react";
import { getCallSummaryMetrics } from "@/api/endpoints/calls";
import { Button } from "@/components/ui/button";

interface CallsMetricsProps {
  filters: CallFilters;
  activeTab: string;
}

interface CallMetrics {
  ready_count: number;
  missed_count: number;
  completed_count: number;
  avg_nps: number;
  promoters_count: number;
  detractors_count: number;
}

export const CallsMetrics = ({ filters, activeTab }: CallsMetricsProps) => {
  const [metrics, setMetrics] = useState<CallMetrics>({
    ready_count: 0,
    missed_count: 0,
    completed_count: 0,
    avg_nps: 0,
    promoters_count: 0,
    detractors_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCallSummaryMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch call metrics:", err);
      setError("Failed to load metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Always show all metrics regardless of active tab
  const metricCards = [
    {
      title: "Ready for Call",
      value: metrics.ready_count,
      icon: Phone,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Missed Calls",
      value: metrics.missed_count,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      title: "Completed Calls",
      value: metrics.completed_count,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Average NPS",
      value: metrics.avg_nps,
      icon: Star,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Promoters",
      value: metrics.promoters_count,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Detractors",
      value: metrics.detractors_count,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      borderColor: "border-red-200 dark:border-red-800",
    },
  ];

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card
            key={index}
            className={`${metric.bgColor} ${metric.borderColor} border`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className={`text-2xl font-bold ${metric.color}`}>
                      {typeof metric.value === "number" &&
                      metric.title === "Average NPS"
                        ? metric.value.toFixed(1)
                        : metric.value}
                    </p>
                  )}
                </div>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
