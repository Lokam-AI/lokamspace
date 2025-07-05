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
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, User, AlertTriangle, Loader2 } from "lucide-react";
import { CallFilters, Call } from "@/pages/Calls";
import { CallsPagination } from "./CallsPagination";
import { getCallsByStatus } from "@/api/endpoints/calls";

interface MissedCallsTabProps {
  filters: CallFilters;
  onRetryCall: (callId: string, action: "call" | "retry") => void;
}

export const MissedCallsTab = ({
  filters,
  onRetryCall,
}: MissedCallsTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [retryStatuses, setRetryStatuses] = useState<Record<string, string>>(
    {}
  );
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

        const data = await getCallsByStatus("missed", apiFilters);
        setCalls(data);
      } catch (err) {
        console.error("Failed to fetch missed calls:", err);
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

      const data = await getCallsByStatus("missed", apiFilters);
      setCalls(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch missed calls:", err);
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

  const handleRetryCall = (callId: string) => {
    onRetryCall(callId, "retry");
    setRetryStatuses((prev) => ({ ...prev, [callId]: "retrying" }));

    // Reset retry status after 3 seconds
    setTimeout(() => {
      setRetryStatuses((prev) => {
        const updated = { ...prev };
        delete updated[callId];
        return updated;
      });
    }, 3000);
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "failed":
        return "destructive";
      case "missed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading missed calls...</span>
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
        <p className="text-muted-foreground">No missed or failed calls</p>
        <p className="text-sm text-muted-foreground mt-1">
          There are currently no calls with missed or failed status.
        </p>
      </div>
    );
  }

  // Count failed and missed calls
  const missedCount = filteredCalls.filter((c) => c.status === "missed").length;
  const failedCount = filteredCalls.filter((c) => c.status === "failed").length;

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border-l-4 border-orange-500 dark:border-orange-400">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Missed Calls
              </p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {missedCount}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border-l-4 border-red-500 dark:border-red-400">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Failed Calls
              </p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {failedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">Customer Name</TableHead>
              <TableHead className="text-foreground">Vehicle</TableHead>
              <TableHead className="text-foreground">Service Advisor</TableHead>
              <TableHead className="text-foreground">Scheduled Time</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCalls.map((call) => (
              <TableRow key={call.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-foreground">
                  <div>
                    <div>{call.customer_name || call.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {call.phone_number || call.phoneNumber}
                    </div>
                  </div>
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
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-foreground-secondary" />
                    <span className="text-foreground-secondary">
                      {formatDateTime(
                        call.scheduled_time || call.scheduledDateTime || ""
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(call.status)}>
                    {getStatusLabel(call.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRetryCall(call.id)}
                    disabled={retryStatuses[call.id] === "retrying"}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {retryStatuses[call.id] === "retrying"
                      ? "Retrying..."
                      : "Retry Call"}
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
