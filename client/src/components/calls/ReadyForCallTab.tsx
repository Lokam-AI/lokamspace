
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, User } from "lucide-react";
import { CallFilters, Call } from "@/pages/Calls";
import { CallsPagination } from "./CallsPagination";

interface ReadyForCallTabProps {
  filters: CallFilters;
  onCallAction: (callId: string, action: 'call' | 'retry') => void;
}

// Updated mock data with Service Type
const mockReadyCalls: Call[] = [
  {
    id: "1",
    customerName: "John Doe",
    vehicleNumber: "VH001",
    serviceAdvisor: "Sarah Johnson",
    serviceType: "Oil Change",
    callDetails: "Oil change reminder - Due in 3 days",
    scheduledDateTime: "2024-06-28T14:00:00",
    status: "ready"
  },
  {
    id: "2",
    customerName: "Jane Smith",
    vehicleNumber: "VH002",
    serviceAdvisor: "Mike Chen",
    serviceType: "Brake Inspection",
    callDetails: "Brake inspection follow-up",
    scheduledDateTime: "2024-06-28T15:30:00",
    status: "ready"
  },
  {
    id: "3",
    customerName: "Robert Brown",
    vehicleNumber: "VH003",
    serviceAdvisor: "Lisa Rodriguez",
    serviceType: "Warranty Service",
    callDetails: "Warranty reminder call",
    scheduledDateTime: "2024-06-28T16:00:00",
    status: "ready"
  },
  {
    id: "4",
    customerName: "Emily Davis",
    vehicleNumber: "VH004",
    serviceAdvisor: "John Smith",
    serviceType: "General Service",
    callDetails: "Service appointment confirmation",
    scheduledDateTime: "2024-06-29T09:00:00",
    status: "ready"
  },
  {
    id: "5",
    customerName: "Michael Wilson",
    vehicleNumber: "VH005",
    serviceAdvisor: "Sarah Johnson",
    serviceType: "Recall Notice",
    callDetails: "Recall notification",
    scheduledDateTime: "2024-06-29T10:30:00",
    status: "ready"
  }
];

export const ReadyForCallTab = ({ filters, onCallAction }: ReadyForCallTabProps) => {
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [callStatuses, setCallStatuses] = useState<Record<string, string>>({});
  const itemsPerPage = 10;

  // Filter calls based on filters
  const filteredCalls = mockReadyCalls.filter(call => {
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCalls(currentCalls.map(call => call.id));
    } else {
      setSelectedCalls([]);
    }
  };

  const handleSelectCall = (callId: string, checked: boolean) => {
    if (checked) {
      setSelectedCalls([...selectedCalls, callId]);
    } else {
      setSelectedCalls(selectedCalls.filter(id => id !== callId));
    }
  };

  const handleBatchCall = () => {
    selectedCalls.forEach(callId => {
      onCallAction(callId, 'call');
      setCallStatuses(prev => ({ ...prev, [callId]: 'in-progress' }));
    });
    setSelectedCalls([]);
  };

  const handleSingleCall = (callId: string) => {
    onCallAction(callId, 'call');
    setCallStatuses(prev => ({ ...prev, [callId]: 'in-progress' }));
  };

  return (
    <div className="space-y-4">
      {/* Batch Actions */}
      {selectedCalls.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedCalls.length} call{selectedCalls.length > 1 ? 's' : ''} selected
          </span>
          <Button onClick={handleBatchCall} size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call Selected ({selectedCalls.length})
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCalls.length === currentCalls.length && currentCalls.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-foreground">Customer Name</TableHead>
              <TableHead className="text-foreground">Vehicle</TableHead>
              <TableHead className="text-foreground">Service Advisor</TableHead>
              <TableHead className="text-foreground">Service Type</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCalls.map((call) => (
              <TableRow key={call.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={selectedCalls.includes(call.id)}
                    onCheckedChange={(checked) => handleSelectCall(call.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">{call.customerName}</TableCell>
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
                  <Badge variant={callStatuses[call.id] === 'in-progress' ? 'default' : 'secondary'}>
                    {callStatuses[call.id] === 'in-progress' ? 'In Progress' : 'Ready'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleSingleCall(call.id)}
                    disabled={callStatuses[call.id] === 'in-progress'}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {callStatuses[call.id] === 'in-progress' ? 'Calling...' : 'Call Now'}
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
