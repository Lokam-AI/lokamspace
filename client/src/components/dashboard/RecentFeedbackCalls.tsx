import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Star } from "lucide-react";
import { Call } from "@/pages/Calls";

interface RecentFeedbackCallsProps {
  onViewDetails: (call: Call) => void;
}

export const RecentFeedbackCalls = ({ onViewDetails }: RecentFeedbackCallsProps) => {
  // Mock data for recent feedback calls
  const recentFeedbackCalls: Call[] = [
    {
      id: "1",
      customerName: "John Smith",
      vehicleNumber: "ABC123",
      serviceAdvisor: "Sarah Johnson",
      callDetails: "Follow-up on recent brake service",
      callDateTime: "2024-01-15T10:30:00",
      status: "completed",
      npsScore: 9,
      transcript: "Customer was very satisfied with the brake service. Mentioned that the car feels much safer now and appreciated the thorough explanation of the work done.",
      tags: ["positive", "satisfied"]
    },
    {
      id: "2",
      customerName: "Mary Johnson",
      vehicleNumber: "XYZ789",
      serviceAdvisor: "Mike Chen",
      callDetails: "Post-service satisfaction survey",
      callDateTime: "2024-01-15T09:15:00",
      status: "completed",
      npsScore: 4,
      transcript: "Customer expressed concerns about the wait time and felt the service was overpriced. However, acknowledged the quality of work was good.",
      tags: ["negative", "pricing-concern"]
    },
    {
      id: "3",
      customerName: "Robert Davis",
      vehicleNumber: "DEF456",
      serviceAdvisor: "Lisa Rodriguez",
      callDetails: "Feedback on oil change service",
      callDateTime: "2024-01-15T08:45:00",
      status: "completed",
      npsScore: 8,
      transcript: "Customer was pleased with the quick service and professional staff. Mentioned they will definitely return for future services.",
      tags: ["positive", "loyalty"]
    }
  ];

  const getNPSBadgeVariant = (score: number) => {
    if (score >= 9) return 'default';
    if (score >= 7) return 'secondary';
    return 'destructive';
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(score / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
      />
    ));
  };

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
                <TableHead>NPS Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentFeedbackCalls.map((call) => (
                <TableRow key={call.id} className="hover:bg-muted/50 transition-colors duration-150">
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{call.customerName}</div>
                      <div className="text-sm text-foreground-secondary">{new Date(call.callDateTime!).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{call.vehicleNumber}</TableCell>
                  <TableCell className="text-foreground-secondary">{call.serviceAdvisor}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {renderStars(call.npsScore!)}
                      </div>
                      <Badge variant={getNPSBadgeVariant(call.npsScore!)}>
                        {call.npsScore}/10
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(call)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
