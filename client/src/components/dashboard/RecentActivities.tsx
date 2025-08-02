import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Phone, TrendingUp, Users, BarChart3, Clock, CheckCircle, XCircle } from "lucide-react";
import { useRecentActivities } from "@/api/queries/activities";
import { Activity } from "@/api/endpoints/activities";

const RecentActivities = () => {
  const { data: activities, isLoading, error } = useRecentActivities();

  // Icon mapping for different activity types
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ready_calls":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "missed_calls":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "calls_completed":
      case "calls_summary":
        return <Phone className="h-5 w-5 text-success" />;
      case "feedback_received":
      case "feedback_summary":
        return <Users className="h-5 w-5 text-warning" />;
      case "service_records":
      case "service_summary":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "promoter":
        return <Users className="h-5 w-5 text-success" />;
      case "detractor":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <BarChart3 className="h-5 w-5 text-primary" />;
    }
  };

  // Badge variant mapping for different activity types
  const getBadgeVariant = (type: string, count?: number) => {
    switch (type) {
      case "ready_calls":
        return count && count > 0 ? "default" : "secondary";
      case "missed_calls":
        return count && count > 0 ? "destructive" : "secondary";
      case "promoter":
        return "default";
      case "detractor":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Background color mapping for different activity types
  const getBackgroundClass = (type: string) => {
    switch (type) {
      case "ready_calls":
        return "bg-success/10 border-success/20";
      case "missed_calls":
        return "bg-destructive/10 border-destructive/20";
      case "calls_completed":
      case "calls_summary":
        return "bg-success/10 border-success/20";
      case "feedback_received":
      case "feedback_summary":
        return "bg-warning/10 border-warning/20";
      case "service_records":
      case "service_summary":
        return "bg-success/10 border-success/20";
      case "promoter":
        return "bg-success/10 border-success/20";
      case "detractor":
        return "bg-destructive/10 border-destructive/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} min ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return "Recently";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border h-16">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Unable to load recent activities
              </p>
              <p className="text-xs text-muted-foreground">
                Please refresh the page to try again
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <Card className="h-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
              <p className="text-xs text-muted-foreground">
                Activities will appear here as they occur
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-lg transform transition-transform hover:scale-105">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity: Activity, index: number) => (
          <div
            key={`${activity.type}-${index}`}
            className={`flex items-center justify-between p-3 rounded-lg border h-16 shadow-md transform transition-transform hover:scale-105 ${getBackgroundClass(
              activity.type
            )}`}
          >
            <div className="flex items-center space-x-3">
              {getActivityIcon(activity.type)}
              <div>
                <p className="font-medium text-sm text-foreground">
                  {activity.title}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {activity.description}
                </p>
              </div>
            </div>
            <Badge variant={getBadgeVariant(activity.type, activity.count)}>
              {activity.count !== undefined && activity.count !== null 
                ? activity.count.toString()
                : formatTimestamp(activity.timestamp)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivities; 