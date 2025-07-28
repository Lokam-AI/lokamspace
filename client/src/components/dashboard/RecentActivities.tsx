import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, BarChart3, CheckCircle, Phone, TrendingUp, Users, History } from "lucide-react";
import { useRecentActivities } from "@/api/queries/activities";
import { Activity } from "@/api/endpoints/activities";
import { format } from "date-fns";

export const RecentActivities = () => {
  const { data, isLoading, error } = useRecentActivities();

  // Get the appropriate icon for activity type
  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case "ready_calls":
        return <Phone className="h-5 w-5 text-primary" />;
      case "missed_calls":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "promoters":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "detractors":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "feedback":
        return <Users className="h-5 w-5 text-warning" />;
      case "service_records":
        return <BarChart3 className="h-5 w-5 text-info" />;
      case "fallback_dms":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "fallback_weekly_report":
        return <BarChart3 className="h-5 w-5 text-primary" />;
      case "fallback_system":
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <History className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Get the appropriate color for activity type
  const getActivityColorClass = (activity: Activity) => {
    switch (activity.type) {
      case "ready_calls":
        return "bg-primary/10 border-primary/20";
      case "missed_calls":
        return "bg-destructive/10 border-destructive/20";
      case "promoters":
        return "bg-success/10 border-success/20";
      case "detractors":
        return "bg-destructive/10 border-destructive/20";
      case "feedback":
        return "bg-warning/10 border-warning/20";
      case "service_records":
        return "bg-info/10 border-info/20";
      case "fallback_dms":
        return "bg-success/10 border-success/20";
      case "fallback_weekly_report":
        return "bg-primary/10 border-primary/20";
      case "fallback_system":
        return "bg-success/10 border-success/20";
      default:
        return "bg-card/10 border-card/20";
    }
  };

  // Get the appropriate badge variant for activity type
  const getBadgeVariant = (activity: Activity) => {
    switch (activity.type) {
      case "ready_calls":
        return "secondary";
      case "missed_calls":
        return "destructive";
      case "promoters":
        return "default";
      case "detractors":
        return "destructive";
      case "feedback":
        return "secondary";
      case "service_records":
        return "outline";
      default:
        return activity.is_fallback ? "outline" : "secondary";
    }
  };

  // Format date for display
  const formatActivityDate = (date: string) => {
    if (!date) return "";
    const activityDate = new Date(date);
    return format(activityDate, "MMM d, yyyy");
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border animate-pulse h-16">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-muted rounded-full" />
                <div>
                  <div className="h-4 w-24 bg-muted rounded mb-1" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-center">
          <div className="space-y-2">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Unable to load recent activities
            </p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Data loaded successfully
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Recent Activity
          {data.date && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({formatActivityDate(data.date)})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.activities.map((activity, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-3 rounded-lg border h-16 ${getActivityColorClass(activity)}`}
          >
            <div className="flex items-center space-x-3">
              {getActivityIcon(activity)}
              <div>
                <p className="font-medium text-sm text-foreground">{activity.title}</p>
                <p className="text-sm text-foreground-secondary">{activity.description}</p>
              </div>
            </div>
            <Badge variant={getBadgeVariant(activity)}>
              {activity.is_fallback ? "Info" : (activity.count > 0 ? activity.count : "None")}
            </Badge>
          </div>
        ))}

        {data.activities.length === 0 && (
          <div className="flex items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">
              No activities for this date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
