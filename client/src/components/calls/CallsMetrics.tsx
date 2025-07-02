
import { Card, CardContent } from "@/components/ui/card";
import { Phone, AlertTriangle, CheckCircle, Star } from "lucide-react";
import { CallFilters } from "@/pages/Calls";

interface CallsMetricsProps {
  filters: CallFilters;
  activeTab: string;
}

export const CallsMetrics = ({ filters, activeTab }: CallsMetricsProps) => {
  // Mock data - in a real app, this would come from filtered API data
  const getFilteredMetrics = () => {
    // Simulate filtering logic
    const baseMetrics = {
      ready: 24,
      missed: 8,
      completed: 156,
      avgNPS: 7.8,
      promoters: 89,
      detractors: 23
    };

    // Apply filter adjustments (simplified for demo)
    let adjustmentFactor = 1;
    if (filters.campaignId !== "all") adjustmentFactor *= 0.6;
    if (filters.searchTerm) adjustmentFactor *= 0.4;
    if (filters.advisor !== "all") adjustmentFactor *= 0.7;

    return {
      ready: Math.floor(baseMetrics.ready * adjustmentFactor),
      missed: Math.floor(baseMetrics.missed * adjustmentFactor),
      completed: Math.floor(baseMetrics.completed * adjustmentFactor),
      avgNPS: baseMetrics.avgNPS,
      promoters: Math.floor(baseMetrics.promoters * adjustmentFactor),
      detractors: Math.floor(baseMetrics.detractors * adjustmentFactor)
    };
  };

  const metrics = getFilteredMetrics();

  // Always show all metrics regardless of active tab
  const metricCards = [
    {
      title: "Ready for Call",
      value: metrics.ready,
      icon: Phone,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Missed Calls",
      value: metrics.missed,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      borderColor: "border-orange-200 dark:border-orange-800"
    },
    {
      title: "Completed Calls",
      value: metrics.completed,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Average NPS",
      value: metrics.avgNPS,
      icon: Star,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      title: "Promoters",
      value: metrics.promoters,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Detractors",
      value: metrics.detractors,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      borderColor: "border-red-200 dark:border-red-800"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={`${metric.bgColor} ${metric.borderColor} border`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </p>
                  <p className={`text-2xl font-bold ${metric.color}`}>
                    {typeof metric.value === 'number' && metric.title === "Average NPS" 
                      ? metric.value.toFixed(1)
                      : metric.value
                    }
                  </p>
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
