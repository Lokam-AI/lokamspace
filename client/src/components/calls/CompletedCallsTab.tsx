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
import { Calendar, User, Star, Eye, Loader2 } from "lucide-react";
import { CallFilters, Call } from "@/pages/Calls";
import { CallsPagination } from "./CallsPagination";
import { getCallsByStatus } from "@/api/endpoints/calls";

interface CompletedCallsTabProps {
  filters: CallFilters;
  onViewDetails: (call: Call) => void;
}

export const CompletedCallsTab = ({
  filters,
  onViewDetails,
}: CompletedCallsTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
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
          apiFilters.service_advisor_name = filters.advisor;
        }
        if (filters.campaignId && filters.campaignId !== "all") {
          apiFilters.campaign_id = filters.campaignId;
        }
        if (filters.dateRange.start) {
          apiFilters.appointment_date = filters.dateRange.start;
        }

        const data = await getCallsByStatus("completed", apiFilters);
        setCalls(data);
      } catch (err) {
        console.error("Failed to fetch completed calls:", err);
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
        apiFilters.service_advisor_name = filters.advisor;
      }
      if (filters.campaignId && filters.campaignId !== "all") {
        apiFilters.campaign_id = filters.campaignId;
      }
      if (filters.dateRange.start) {
        apiFilters.appointment_date = filters.dateRange.start;
      }

      const data = await getCallsByStatus("completed", apiFilters);
      setCalls(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch completed calls:", err);
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

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleDateString();
  };

  const getNPSBadgeVariant = (score: number) => {
    if (score >= 9) return "default"; // Promoter
    if (score >= 7) return "secondary"; // Passive
    return "destructive"; // Detractor
  };

  const getNPSLabel = (score: number) => {
    if (score >= 9) return "Promoter";
    if (score >= 7) return "Passive";
    return "Detractor";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading completed calls...</span>
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
        <p className="text-muted-foreground">No completed calls available</p>
        <p className="text-sm text-muted-foreground mt-1">
          There are currently no calls with completed status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* NPS Score Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-950/40 rounded-lg border-l-4 border-green-500">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-green-800 dark:text-green-300">
              Promoters
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
              {
                filteredCalls.filter((call) => (call.nps_score || 0) >= 9)
                  .length
              }
            </div>
            <div className="text-xs text-green-700 dark:text-green-400 mt-1">
              NPS Score 9-10
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg border-l-4 border-gray-500">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
              Passives
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">
              {
                filteredCalls.filter(
                  (call) =>
                    (call.nps_score || 0) >= 7 && (call.nps_score || 0) <= 8
                ).length
              }
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">
              NPS Score 7-8
            </div>
          </div>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-lg border-l-4 border-red-500">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-red-800 dark:text-red-300">
              Detractors
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-200">
              {
                filteredCalls.filter((call) => (call.nps_score || 0) <= 6)
                  .length
              }
            </div>
            <div className="text-xs text-red-700 dark:text-red-400 mt-1">
              NPS Score 0-6
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">Customer (Date)</TableHead>
              <TableHead className="text-foreground">Vehicle</TableHead>
              <TableHead className="text-foreground">Service Advisor</TableHead>
              <TableHead className="text-foreground">Call Reason</TableHead>
              <TableHead className="text-foreground">NPS Score</TableHead>
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
                    <div className="text-sm text-foreground-secondary">
                      {formatDateTime(call.end_time || call.callDateTime || "")}
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
                  <Badge variant="outline">
                    {call.service_type ||
                      call.serviceType ||
                      call.call_reason ||
                      "Not specified"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getNPSBadgeVariant(call.nps_score || 0)}>
                      {call.nps_score || "N/A"}/10
                    </Badge>
                    <span className="text-xs text-foreground-secondary">
                      {getNPSLabel(call.nps_score || 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(call)}
                  >
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
