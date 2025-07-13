import { useState, useEffect } from "react";
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
import { Phone, Calendar, User, Loader2 } from "lucide-react";
import { CallFilters, Call } from "@/pages/Calls";
import { CallsPagination } from "./CallsPagination";
import { getCallsByStatus } from "@/api/endpoints/calls";

interface ReadyForCallTabProps {
  filters: CallFilters;
  onCallAction: (callId: string, action: "call" | "retry") => void;
}

export const ReadyForCallTab = ({
  filters,
  onCallAction,
}: ReadyForCallTabProps) => {
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [callStatuses, setCallStatuses] = useState<Record<string, string>>({});
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch calls from API
  useEffect(() => {
    const fetchCalls = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Convert filters to query params
        const apiFilters: Record<string, string> = {};
        if (filters.searchTerm) {
          apiFilters.search = filters.searchTerm;
        }
        if (filters.advisor && filters.advisor !== "all") {
          apiFilters.advisor = filters.advisor;
        }

        const data = await getCallsByStatus("ready", apiFilters);
        setCalls(data);
      } catch (err) {
        console.error("Failed to fetch ready calls:", err);
        setError("Failed to load calls. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, [filters]);

  const handleRetryFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert filters to query params
      const apiFilters: Record<string, string> = {};
      if (filters.searchTerm) {
        apiFilters.search = filters.searchTerm;
      }
      if (filters.advisor && filters.advisor !== "all") {
        apiFilters.advisor = filters.advisor;
      }

      const data = await getCallsByStatus("ready", apiFilters);
      setCalls(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch ready calls:", err);
      setError("Failed to load calls. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

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
      setCallStatuses((prev) => ({ ...prev, [callId]: "in-progress" }));
    });
    setSelectedCalls([]);
  };

  const handleSingleCall = (callId: string) => {
    onCallAction(callId, "call");
    setCallStatuses((prev) => ({ ...prev, [callId]: "in-progress" }));
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
        <p className="text-destructive font-medium">{error}</p>
        <Button onClick={handleRetryFetch} variant="outline" className="mt-2">
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
            {currentCalls.map((call) => (
              <TableRow key={call.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={selectedCalls.includes(call.id)}
                    onCheckedChange={(checked) =>
                      handleSelectCall(call.id, !!checked)
                    }
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
                      callStatuses[call.id] === "in-progress"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {callStatuses[call.id] === "in-progress"
                      ? "In Progress"
                      : "Ready"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleSingleCall(call.id)}
                    disabled={callStatuses[call.id] === "in-progress"}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {callStatuses[call.id] === "in-progress"
                      ? "Calling..."
                      : "Call Now"}
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
