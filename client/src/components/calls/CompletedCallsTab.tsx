import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Star, Eye } from "lucide-react";
import { CallFilters, Call } from "@/pages/Calls";
import { CallsPagination } from "./CallsPagination";

interface CompletedCallsTabProps {
  filters: CallFilters;
  onViewDetails: (call: Call) => void;
}

// Updated mock data to match Dashboard format
const mockCompletedCalls: Call[] = [{
  id: "10",
  customerName: "Jennifer Adams",
  vehicleNumber: "VH010",
  serviceAdvisor: "Sarah Johnson",
  serviceType: "Oil Change",
  callDetails: "Oil change reminder - Scheduled appointment",
  callDateTime: "2024-06-25T14:00:00",
  status: "completed",
  npsScore: 9,
  transcript: "Customer was very satisfied with the service reminder...",
  audioUrl: "audio1.mp3",
  tags: ["positive", "scheduled"]
}, {
  id: "11",
  customerName: "William Clark",
  vehicleNumber: "VH011",
  serviceAdvisor: "Mike Chen",
  serviceType: "Brake Service",
  callDetails: "Brake inspection follow-up - Customer satisfied",
  callDateTime: "2024-06-25T15:30:00",
  status: "completed",
  npsScore: 8,
  transcript: "Customer confirmed the brake service was excellent...",
  audioUrl: "audio2.mp3",
  tags: ["positive", "satisfied"]
}, {
  id: "12",
  customerName: "Patricia Lewis",
  vehicleNumber: "VH012",
  serviceAdvisor: "Lisa Rodriguez",
  serviceType: "Warranty Service",
  callDetails: "Warranty reminder - Customer had concerns",
  callDateTime: "2024-06-24T16:00:00",
  status: "completed",
  npsScore: 4,
  transcript: "Customer expressed concerns about warranty coverage...",
  audioUrl: "audio3.mp3",
  tags: ["negative", "concerns"]
}, {
  id: "13",
  customerName: "Christopher Hall",
  vehicleNumber: "VH013",
  serviceAdvisor: "John Smith",
  serviceType: "General Service",
  callDetails: "Service appointment confirmation - Rescheduled",
  callDateTime: "2024-06-24T09:00:00",
  status: "completed",
  npsScore: 7,
  transcript: "Customer needed to reschedule but was understanding...",
  audioUrl: "audio4.mp3",
  tags: ["neutral", "rescheduled"]
}, {
  id: "14",
  customerName: "Barbara Young",
  vehicleNumber: "VH014",
  serviceAdvisor: "Sarah Johnson",
  serviceType: "Recall Notice",
  callDetails: "Recall notification - Customer very unhappy",
  callDateTime: "2024-06-23T10:30:00",
  status: "completed",
  npsScore: 2,
  transcript: "Customer was frustrated about the recall timing...",
  audioUrl: "audio5.mp3",
  tags: ["negative", "frustrated"]
}];
export const CompletedCallsTab = ({
  filters,
  onViewDetails
}: CompletedCallsTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter calls based on filters
  const filteredCalls = mockCompletedCalls.filter(call => {
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!call.customerName.toLowerCase().includes(searchLower) && !call.vehicleNumber.toLowerCase().includes(searchLower) && !call.serviceAdvisor.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.advisor && filters.advisor !== "all" && !call.serviceAdvisor.toLowerCase().includes(filters.advisor.toLowerCase())) {
      return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const currentCalls = filteredCalls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };
  const getNPSBadgeVariant = (score: number) => {
    if (score >= 9) return 'default'; // Promoter
    if (score >= 7) return 'secondary'; // Passive
    return 'destructive'; // Detractor
  };
  const getNPSLabel = (score: number) => {
    if (score >= 9) return 'Promoter';
    if (score >= 7) return 'Passive';
    return 'Detractor';
  };
  const renderStars = (score: number) => {
    return Array.from({
      length: 5
    }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.floor(score / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />);
  };

  // Calculate stats
  const promoters = filteredCalls.filter(c => c.npsScore && c.npsScore >= 9).length;
  const detractors = filteredCalls.filter(c => c.npsScore && c.npsScore <= 6).length;
  const avgNPS = filteredCalls.reduce((sum, call) => sum + (call.npsScore || 0), 0) / filteredCalls.length;
  return (
    <div className="space-y-4">
      {/* Table */}
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
        totalItems={filteredCalls.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};
