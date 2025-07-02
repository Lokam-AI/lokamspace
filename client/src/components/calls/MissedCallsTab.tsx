
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, User, AlertTriangle } from "lucide-react";
import { CallFilters, Call } from "@/pages/Calls";
import { CallsPagination } from "./CallsPagination";

interface MissedCallsTabProps {
  filters: CallFilters;
  onRetryCall: (callId: string, action: 'call' | 'retry') => void;
}

// Enhanced mock data with more diverse examples and failure reasons
const mockMissedCalls: Call[] = [
  {
    id: "missed-1",
    customerName: "David Thompson",
    vehicleNumber: "VH006",
    serviceAdvisor: "Sarah Johnson",
    serviceType: "Oil Change",
    callDetails: "Maintenance reminder - No answer after 3 rings",
    callDateTime: "2024-06-28T14:00:00",
    status: "missed",
    phoneNumber: "+1 (555) 234-5678"
  },
  {
    id: "missed-2",
    customerName: "Amanda White",
    vehicleNumber: "VH007",
    serviceAdvisor: "Mike Chen",
    serviceType: "Brake Service",
    callDetails: "Follow-up call - Busy signal encountered",
    callDateTime: "2024-06-28T15:30:00",
    status: "failed",
    phoneNumber: "+1 (555) 345-6789"
  },
  {
    id: "missed-3",
    customerName: "Kevin Martinez",
    vehicleNumber: "VH008",
    serviceAdvisor: "Lisa Rodriguez",
    serviceType: "Recall Notice",
    callDetails: "Important recall notification - Went to voicemail",
    callDateTime: "2024-06-28T16:00:00",
    status: "missed",
    phoneNumber: "+1 (555) 456-7890"
  },
  {
    id: "missed-4",
    customerName: "Rachel Green",
    vehicleNumber: "VH009",
    serviceAdvisor: "John Smith",
    serviceType: "General Service",
    callDetails: "Appointment confirmation - No answer",
    callDateTime: "2024-06-27T09:00:00",
    status: "failed",
    phoneNumber: "+1 (555) 567-8901"
  },
  {
    id: "missed-5",
    customerName: "Thomas Wilson",
    vehicleNumber: "VH010",
    serviceAdvisor: "Sarah Johnson",
    serviceType: "Tire Service",
    callDetails: "Tire rotation reminder - Line was busy",
    callDateTime: "2024-06-27T11:30:00",
    status: "missed",
    phoneNumber: "+1 (555) 678-9012"
  },
  {
    id: "missed-6",
    customerName: "Maria Garcia",
    vehicleNumber: "VH011",
    serviceAdvisor: "Mike Chen",
    serviceType: "AC Service",
    callDetails: "Air conditioning check reminder - Voicemail full",
    callDateTime: "2024-06-27T13:15:00",
    status: "failed",
    phoneNumber: "+1 (555) 789-0123"
  },
  {
    id: "missed-7",
    customerName: "James Johnson",
    vehicleNumber: "VH012",
    serviceAdvisor: "Lisa Rodriguez",
    serviceType: "Battery Check",
    callDetails: "Battery inspection reminder - Call dropped",
    callDateTime: "2024-06-26T16:45:00",
    status: "missed",
    phoneNumber: "+1 (555) 890-1234"
  },
  {
    id: "missed-8",
    customerName: "Jennifer Lopez",
    vehicleNumber: "VH013",
    serviceAdvisor: "John Smith",
    serviceType: "Transmission Service",
    callDetails: "Service reminder - Customer phone was off",
    callDateTime: "2024-06-26T10:20:00",
    status: "failed",
    phoneNumber: "+1 (555) 901-2345"
  },
  {
    id: "missed-9",
    customerName: "Robert Taylor",
    vehicleNumber: "VH014",
    serviceAdvisor: "Sarah Johnson",
    serviceType: "Warranty Service",
    callDetails: "Warranty expiration notice - No response",
    callDateTime: "2024-06-25T14:30:00",
    status: "missed",
    phoneNumber: "+1 (555) 012-3456"
  },
  {
    id: "missed-10",
    customerName: "Lisa Anderson",
    vehicleNumber: "VH015",
    serviceAdvisor: "Mike Chen",
    serviceType: "Inspection Due",
    callDetails: "Annual inspection reminder - Network error",
    callDateTime: "2024-06-25T08:45:00",
    status: "failed",
    phoneNumber: "+1 (555) 123-4567"
  },
  {
    id: "missed-11",
    customerName: "Christopher Lee",
    vehicleNumber: "VH016",
    serviceAdvisor: "Lisa Rodriguez",
    serviceType: "Filter Replacement",
    callDetails: "Air filter replacement - Declined call",
    callDateTime: "2024-06-24T12:15:00",
    status: "missed",
    phoneNumber: "+1 (555) 234-5678"
  },
  {
    id: "missed-12",
    customerName: "Patricia Moore",
    vehicleNumber: "VH017",
    serviceAdvisor: "John Smith",
    serviceType: "Coolant Service",
    callDetails: "Coolant system check - Phone disconnected",
    callDateTime: "2024-06-24T17:00:00",
    status: "failed",
    phoneNumber: "+1 (555) 345-6789"
  }
];

export const MissedCallsTab = ({ filters, onRetryCall }: MissedCallsTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [retryStatuses, setRetryStatuses] = useState<Record<string, string>>({});
  const itemsPerPage = 10;

  // Filter calls based on filters
  const filteredCalls = mockMissedCalls.filter(call => {
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!call.customerName.toLowerCase().includes(searchLower) &&
          !call.vehicleNumber.toLowerCase().includes(searchLower) &&
          !call.serviceAdvisor.toLowerCase().includes(searchLower)) {
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

  const handleRetryCall = (callId: string) => {
    onRetryCall(callId, 'retry');
    setRetryStatuses(prev => ({ ...prev, [callId]: 'retrying' }));
    
    // Reset retry status after 3 seconds
    setTimeout(() => {
      setRetryStatuses(prev => {
        const updated = { ...prev };
        delete updated[callId];
        return updated;
      });
    }, 3000);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'failed':
        return 'destructive';
      case 'missed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status === 'failed' ? 'Failed' : 'Missed';
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border-l-4 border-orange-500 dark:border-orange-400">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Missed Calls</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {mockMissedCalls.filter(c => c.status === 'missed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border-l-4 border-red-500 dark:border-red-400">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Failed Calls</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {mockMissedCalls.filter(c => c.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table - Same structure as Ready For Call */}
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service Advisor</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCalls.map((call) => (
              <TableRow key={call.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{call.customerName}</div>
                    <div className="text-sm text-muted-foreground">{formatDateTime(call.callDateTime!)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-muted text-foreground px-2 py-1 rounded">
                    {call.vehicleNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{call.serviceAdvisor}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{call.serviceType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(call.status)}>
                    {retryStatuses[call.id] === 'retrying' ? 'Retrying...' : getStatusLabel(call.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={call.status === 'failed' ? 'destructive' : 'default'}
                    onClick={() => handleRetryCall(call.id)}
                    disabled={retryStatuses[call.id] === 'retrying'}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {retryStatuses[call.id] === 'retrying' ? 'Retrying...' : 'Retry Call'}
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
