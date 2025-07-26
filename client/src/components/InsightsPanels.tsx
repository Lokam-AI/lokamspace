
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

// Interface for feedback insight data
interface FeedbackInsight {
  topic: string;
  count: number;
  percentage: number;
}

// Props interface for the component
interface InsightsPanelsProps {
  positiveInsights: FeedbackInsight[];
  improvementAreas: FeedbackInsight[];
  isLoading?: boolean;
  error?: string;
}

export const InsightsPanels = ({ 
  positiveInsights, 
  improvementAreas, 
  isLoading = false,
  error 
}: InsightsPanelsProps) => {

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Insights Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Top Positive Mentions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20 h-16">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-6 w-8 ml-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Areas to Improve Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20 h-16">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-6 w-8 ml-3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Top Positive Mentions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 text-center">
            <div className="space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Unable to load insights
              </p>
              <p className="text-xs text-muted-foreground">
                {error}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 text-center">
            <div className="space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Unable to load insights
              </p>
              <p className="text-xs text-muted-foreground">
                {error}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {positiveInsights.length > 0 ? (
            positiveInsights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20 h-16">
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
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-center">
              <p className="text-sm text-muted-foreground">
                No positive feedback data available yet
              </p>
            </div>
          )}
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
          {improvementAreas.length > 0 ? (
            improvementAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20 h-16">
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
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-center">
              <p className="text-sm text-muted-foreground">
                No improvement areas data available yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
