import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  AlertTriangle,
  CheckCircle,
  Star,
  RefreshCw,
} from "lucide-react";
import { CallFilters } from "@/pages/Calls";
import { useCallStats } from "@/api/queries/calls";
import { Button } from "@/components/ui/button";

interface CallsMetricsProps {
  filters: CallFilters;
  activeTab: string;
}

interface CallStats {
  ready: number;
  missed: number;
  completed: number;
  total: number;
}

export const CallsMetrics = ({ filters, activeTab }: CallsMetricsProps) => {
  const { data: stats, isLoading: loading, error, refetch } = useCallStats(filters);

  const metrics = stats || {
    ready: 0,
    missed: 0,
    completed: 0,
    total: 0,
  };

  // Always show all metrics regardless of active tab
  const metricCards = [
    {
      title: "Ready for Call",
      value: metrics.ready,
      icon: Phone,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Missed Calls",
      value: metrics.missed,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      title: "Completed Calls",
      value: metrics.completed,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      borderColor: "border-green-200 dark:border-green-800",
    },
  ];

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-red-500 mb-4">Failed to load metrics. Please try again.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
