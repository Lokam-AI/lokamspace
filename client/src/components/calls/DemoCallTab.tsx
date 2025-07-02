import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, User, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";
import { Call } from "@/pages/Calls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CallsPagination } from "./CallsPagination";
import { DemoCallSection } from "./DemoCallSection";

interface DemoCallTabProps {
  campaigns: Campaign[];
  onViewDetails: (call: Call) => void;
}

export const DemoCallTab = ({
  campaigns,
  onViewDetails
}: DemoCallTabProps) => {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Enhanced demo calls with realistic data for CallDetailPanel
  const [demoCalls] = useState<Call[]>([{
    id: "demo-1",
    customerName: "John Smith",
    phoneNumber: "+1 (555) 123-4567",
    vehicleNumber: "ABC-123",
    serviceAdvisor: "Mike Torres",
    serviceType: "Oil Change",
    callDetails: "Routine maintenance reminder - Customer very satisfied with service",
    campaignId: "demo",
    campaignName: "Demo Campaign",
    status: "completed",
    callDateTime: "2024-06-28T10:30:00",
    npsScore: 9,
    transcript: "Thank you for calling about my recent oil change. I was very impressed with the service. The technician explained everything clearly and the work was completed quickly. I'll definitely be back for future maintenance.",
    audioUrl: "demo-audio-1.mp3",
    tags: ["positive", "satisfied", "will-return"]
  }, {
    id: "demo-2",
    customerName: "Sarah Johnson",
    phoneNumber: "+1 (555) 987-6543",
    vehicleNumber: "XYZ-789",
    serviceAdvisor: "Lisa Park",
    serviceType: "Brake Inspection",
    callDetails: "Follow up on brake service - Customer appreciated thorough explanation",
    campaignId: "demo",
    campaignName: "Demo Campaign",
    status: "completed",
    callDateTime: "2024-06-27T14:15:00",
    npsScore: 8,
    transcript: "The brake inspection was very thorough. I appreciated that the technician showed me exactly what needed to be done and provided a clear estimate. The work was done on time and within budget.",
    audioUrl: "demo-audio-2.mp3",
    tags: ["positive", "thorough", "on-time"]
  }, {
    id: "demo-3",
    customerName: "Robert Wilson",
    phoneNumber: "+1 (555) 456-7890",
    vehicleNumber: "DEF-456",
    serviceAdvisor: "John Smith",
    serviceType: "Tire Rotation",
    callDetails: "Tire service follow-up - Minor concerns about scheduling",
    campaignId: "demo",
    campaignName: "Demo Campaign",
    status: "completed",
    callDateTime: "2024-06-26T16:45:00",
    npsScore: 7,
    transcript: "The tire rotation service was good overall. My only complaint was that I had to wait longer than expected. The work quality was fine, but better scheduling would improve the experience.",
    audioUrl: "demo-audio-3.mp3",
    tags: ["neutral", "scheduling-issue", "good-quality"]
  }, {
    id: "demo-4",
    customerName: "Emily Davis",
    phoneNumber: "+1 (555) 321-6540",
    vehicleNumber: "GHI-789",
    serviceAdvisor: "Sarah Johnson",
    serviceType: "AC Service",
    callDetails: "Air conditioning repair follow-up - Customer had billing concerns",
    campaignId: "demo",
    campaignName: "Demo Campaign",
    status: "completed",
    callDateTime: "2024-06-25T11:20:00",
    npsScore: 4,
    transcript: "I'm not happy with the AC service. The repair seems fine, but I was charged more than the original estimate without proper explanation. I expected better communication about additional costs.",
    audioUrl: "demo-audio-4.mp3",
    tags: ["negative", "billing-issue", "poor-communication"]
  }, {
    id: "demo-5",
    customerName: "Michael Brown",
    phoneNumber: "+1 (555) 654-3210",
    vehicleNumber: "JKL-012",
    serviceAdvisor: "Mike Chen",
    serviceType: "General Service",
    callDetails: "Routine maintenance - Customer extremely satisfied",
    campaignId: "demo",
    campaignName: "Demo Campaign",
    status: "completed",
    callDateTime: "2024-06-24T09:15:00",
    npsScore: 10,
    transcript: "Outstanding service! The team went above and beyond. They completed the work ahead of schedule, found and fixed an additional issue at no extra charge, and the facility was clean and professional. Highly recommend!",
    audioUrl: "demo-audio-5.mp3",
    tags: ["positive", "exceeded-expectations", "professional", "highly-recommend"]
  }]);
  const totalPages = Math.ceil(demoCalls.length / itemsPerPage);
  const currentCalls = demoCalls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };
  const getNPSBadgeVariant = (score: number) => {
    if (score >= 9) return 'default';
    if (score >= 7) return 'secondary';
    return 'destructive';
  };
  const getNPSLabel = (score: number) => {
    if (score >= 9) return 'Promoter';
    if (score >= 7) return 'Passive';
    return 'Detractor';
  };
  return (
    <div className="space-y-2">
      {/* Demo Call Section - for initiating new demo calls */}
      <DemoCallSection campaigns={campaigns} />

      {/* Demo Calls Table - Same format as Completed Calls */}
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">Customer (Date)</TableHead>
              <TableHead className="text-foreground">Vehicle</TableHead>
              <TableHead className="text-foreground">Service Advisor</TableHead>
              <TableHead className="text-foreground">Service Type</TableHead>
              <TableHead className="text-foreground">NPS Score</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCalls.map(call => (
              <TableRow key={call.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{call.customerName}</div>
                    <div className="text-sm text-foreground-secondary">{formatDateTime(call.callDateTime!)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-muted text-foreground px-2 py-1 rounded">
                    {call.vehicleNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-foreground-secondary" />
                    <span className="text-foreground-secondary">{call.serviceAdvisor}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{call.serviceType}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getNPSBadgeVariant(call.npsScore!)}>
                      {call.npsScore}/10
                    </Badge>
                    <span className="text-xs text-foreground-secondary">
                      {getNPSLabel(call.npsScore!)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onViewDetails(call)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <CallsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={demoCalls.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};
