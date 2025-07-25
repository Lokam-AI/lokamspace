import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, User, Loader2, RefreshCw } from "lucide-react";
import { CallFilters, Call } from "@/pages/Calls";
import { CallsPagination } from "./CallsPagination";
import { getCallsByStatus, getCallDetails } from "@/api/endpoints/calls";
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

interface ReadyForCallTabProps {
  filters: CallFilters;
  onCallAction: (callId: string, action: "call" | "retry", isDemo?: boolean) => void;
}

export const ReadyForCallTab = ({
  filters,
  onCallAction,
}: ReadyForCallTabProps) => {
  const { toast } = useToast();
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [callStatuses, setCallStatuses] = useState<Record<string, string>>({});
  const [pollingCalls, setPollingCalls] = useState<Record<string, boolean>>({});
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const itemsPerPage = 10;

  const {
    data: calls = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['readyCalls', filters],
    queryFn: async () => {
      const apiFilters: Record<string, string> = {};
      if (filters.searchTerm) apiFilters.search = filters.searchTerm;
      if (filters.advisor && filters.advisor !== 'all') apiFilters.service_advisor_name = filters.advisor;
      if (filters.campaignId && filters.campaignId !== 'all') apiFilters.campaign_id = filters.campaignId;
      if (filters.dateRange.start) apiFilters.appointment_date = filters.dateRange.start;
      return getCallsByStatus('ready', apiFilters);
    },
  });

  // Poll for call status updates
  const startStatusPolling = useCallback((callId: string) => {
    // Add this call to polling list
    setPollingCalls(prev => ({ ...prev, [callId]: true }));
    
    // If we're not already polling, start the interval
    if (!pollingInterval) {
      const interval = setInterval(async () => {
        // Check all calls that we're polling
        const callsToCheck = Object.keys(pollingCalls).filter(id => pollingCalls[id]);
        
        for (const id of callsToCheck) {
          try {
            const callDetails = await getCallDetails(id);
            setCallStatuses(prev => ({ ...prev, [id]: callDetails.status.toLowerCase() }));
            
            // If the call is completed or failed, stop polling for this call
            if (
              callDetails.status.toLowerCase() === "completed" ||
              callDetails.status.toLowerCase() === "failed"
            ) {
              setPollingCalls(prev => ({ ...prev, [id]: false }));
              
              // Show appropriate toast
              if (callDetails.status.toLowerCase() === "completed") {
                toast({
                  title: "Call completed",
                  description: "Call transcript is now available for review",
                });
              } else {
                toast({
                  title: "Call failed",
                  description: "There was a problem with the call",
                  variant: "destructive",
                });
              }
              
              // Refresh the calls list
              refetch();
            }
          } catch (error) {
            console.error(`Error polling status for call ${id}:`, error);
          }
        }
        
        // If no calls are being polled anymore, clear the interval
        if (Object.values(pollingCalls).every(polling => !polling)) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }, 3000); // Poll every 3 seconds
      
      setPollingInterval(interval);
    }
  }, [pollingCalls, pollingInterval, toast, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Filter calls client-side for additional filtering if needed
  const filteredCalls = calls;
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const currentCalls = filteredCalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCalls(currentCalls.map((call) => call.id));
    } else {
      setSelectedCalls([]);
    }
  };

  const handleSelectCall = (callId: string, checked: boolean) => {
    if (checked) {
      setSelectedCalls([...selectedCalls, callId]);
    } else {
      setSelectedCalls(selectedCalls.filter((id) => id !== callId));
    }
  };

  const handleBatchCall = () => {
    selectedCalls.forEach((callId) => {
      onCallAction(callId, "call");
      setCallStatuses((prev) => ({ ...prev, [callId]: "in progress" }));
      startStatusPolling(callId);
    });
    setSelectedCalls([]);
  };

  const handleSingleCall = (callId: string) => {
    onCallAction(callId, "call");
    setCallStatuses((prev) => ({ ...prev, [callId]: "in progress" }));
    startStatusPolling(callId);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading calls...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <p className="text-destructive font-medium">{(error as Error).message || 'Failed to load calls. Please try again later.'}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (filteredCalls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No ready calls available</p>
        <p className="text-sm text-muted-foreground mt-1">
          There are currently no calls in the ready status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions */}
      {selectedCalls.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedCalls.length} call{selectedCalls.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <Button onClick={handleBatchCall} size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call Selected ({selectedCalls.length})
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-medium">Ready for Call</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedCalls.length === currentCalls.length &&
                    currentCalls.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-foreground">Customer Name</TableHead>
              <TableHead className="text-foreground">Vehicle</TableHead>
              <TableHead className="text-foreground">Service Advisor</TableHead>
              <TableHead className="text-foreground">Service Type</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCalls.map((call) => {
              const status = callStatuses[call.id] || call.status;
              const isInProgress = status === "in progress" || status === "ringing";
              const isCompleted = status === "completed";
              const isFailed = status === "failed";
              
              return (
                <TableRow key={call.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedCalls.includes(call.id)}
                      onCheckedChange={(checked) =>
                        handleSelectCall(call.id, !!checked)
                      }
                      disabled={isInProgress || isCompleted || isFailed}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {call.customer_name || call.customerName}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-muted text-foreground px-2 py-1 rounded">
                      {call.vehicle_info || call.vehicleNumber || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-foreground-secondary" />
                      <span className="text-foreground-secondary">
                        {call.service_advisor_name ||
                          call.serviceAdvisor ||
                          "Unassigned"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {call.service_type ||
                        call.serviceType ||
                        call.call_reason ||
                        "Not specified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        isInProgress
                          ? "secondary"
                          : isCompleted
                          ? "default"
                          : isFailed
                          ? "destructive"
                          : "secondary"
                      }
                      className={isInProgress ? "animate-pulse" : ""}
                    >
                      {status === "in progress"
                        ? "In Progress"
                        : status.charAt(0).toUpperCase() +
                          status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleSingleCall(call.id)}
                      disabled={isInProgress || isCompleted || isFailed}
                    >
                      {isInProgress ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Calling...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Now
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
