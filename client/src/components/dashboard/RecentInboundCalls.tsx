
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Phone } from "lucide-react";
import { Call } from "@/pages/Calls";

interface RecentInboundCallsProps {
  onViewDetails: (call: Call) => void;
}

export const RecentInboundCalls = ({ onViewDetails }: RecentInboundCallsProps) => {
  // Mock data for recent inbound calls
  const recentInboundCalls: Call[] = [
    {
      id: "4",
      customerName: "Jennifer Wilson",
      vehicleNumber: "GHI789",
      serviceAdvisor: "Sarah Johnson",
      callDetails: "Inquiry about brake inspection pricing",
      callDateTime: "2024-01-15T11:20:00",
      status: "completed",
      transcript: "Customer called to inquire about brake inspection costs and availability. Provided pricing information and scheduled an appointment for next week.",
      tags: ["inquiry", "scheduling"]
    },
    {
      id: "5",
      customerName: "David Brown",
      vehicleNumber: "JKL012",
      serviceAdvisor: "Mike Chen",
      callDetails: "Emergency towing request",
      callDateTime: "2024-01-15T10:55:00",
      status: "completed",
      transcript: "Customer's vehicle broke down on highway. Arranged emergency towing service and provided estimated repair timeline.",
      tags: ["emergency", "towing"]
    },
    {
      id: "6",
      customerName: "Susan Miller",
      vehicleNumber: "MNO345",
      serviceAdvisor: "Lisa Rodriguez",
      callDetails: "Appointment rescheduling request",
      callDateTime: "2024-01-15T09:30:00",
      status: "completed",
      transcript: "Customer needed to reschedule their oil change appointment due to work conflict. Successfully moved to later in the week.",
      tags: ["scheduling", "reschedule"]
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'missed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Inbound Calls</CardTitle>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInboundCalls.map((call) => (
                <TableRow key={call.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{call.customerName}</div>
                      <div className="text-sm text-gray-500">{new Date(call.callDateTime!).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{call.vehicleNumber}</TableCell>
                  <TableCell className="text-gray-600">{call.serviceAdvisor}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(call.status)} className="capitalize">
                      {call.status}
                    </Badge>
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
