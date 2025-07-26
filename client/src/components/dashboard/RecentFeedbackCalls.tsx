import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Star } from "lucide-react";
import { Call } from "@/pages/Calls";
import { useRecentCalls } from "@/api/queries/calls";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentFeedbackCallsProps {
  onViewDetails: (call: Call) => void;
}

export const RecentFeedbackCalls = ({ onViewDetails }: RecentFeedbackCallsProps) => {
  const { data: recentCalls, isLoading, error } = useRecentCalls(6);

  const getNPSBadgeVariant = (score: number | undefined) => {
    if (!score) return 'secondary';
    if (score >= 9) return 'default';
    if (score >= 7) return 'secondary';
    return 'destructive';
  };

  const renderStars = (score: number | undefined) => {
    const starCount = score ? Math.floor(score / 2) : 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < starCount ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
      />
    ));
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'default';
    if (statusLower === 'ready' || statusLower === 'scheduled') return 'secondary';
    if (statusLower === 'missed' || statusLower === 'failed') return 'destructive';
    return 'outline';
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Feedback Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>NPS Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Feedback Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-destructive">
            Error loading recent calls. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Feedback Calls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NPS Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCalls && recentCalls.length > 0 ? (
                recentCalls.map((call) => (
                  <TableRow key={call.id} className="hover:bg-muted/50 transition-colors duration-150">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{call.customer_name}</div>
                        <div className="text-sm text-foreground-secondary">
                          {call.start_time ? new Date(call.start_time).toLocaleDateString() : 'Not started'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{call.vehicle_info}</TableCell>
                    <TableCell className="text-foreground-secondary">{call.service_advisor_name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(call.status)}>
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {renderStars(call.nps_score)}
                        </div>
                        <Badge variant={getNPSBadgeVariant(call.nps_score)}>
                          {call.nps_score ? `${call.nps_score}/10` : 'N/A'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(call)}
                        className="flex items-center space-x-1"
                        disabled={call.status.toLowerCase() !== 'completed'}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No recent calls found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
