
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const InsightsPanels = () => {
  const positiveInsights = [
    { topic: "Professional Service", count: 89, percentage: 72 },
    { topic: "Quick Response", count: 67, percentage: 54 },
    { topic: "Knowledgeable Staff", count: 45, percentage: 36 },
    { topic: "Fair Pricing", count: 38, percentage: 31 },
    { topic: "Clean Facility", count: 29, percentage: 23 }
  ];

  const improvementAreas = [
    { topic: "Wait Time", count: 34, percentage: 79 },
    { topic: "Communication", count: 28, percentage: 65 },
    { topic: "Follow-up", count: 19, percentage: 44 },
    { topic: "Scheduling", count: 15, percentage: 35 },
    { topic: "Pricing Clarity", count: 12, percentage: 28 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Positive Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Top Positive Mentions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {positiveInsights.map((insight, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{insight.topic}</p>
                <div className="w-full bg-success/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${insight.percentage}%` }}
                  ></div>
                </div>
              </div>
              <Badge variant="secondary" className="ml-3">
                {insight.count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Areas to Improve */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Areas to Improve
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {improvementAreas.map((area, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{area.topic}</p>
                <div className="w-full bg-warning/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{ width: `${area.percentage}%` }}
                  ></div>
                </div>
              </div>
              <Badge variant="destructive" className="ml-3">
                {area.count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
