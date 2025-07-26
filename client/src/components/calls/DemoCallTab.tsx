import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, User, Eye, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";
import { Call } from "@/pages/Calls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallsPagination } from "./CallsPagination";
import { DemoCallSection } from "./DemoCallSection";
import { getDemoCalls } from "@/api/endpoints/calls";

interface DemoCallTabProps {
  campaigns: Campaign[];
  onViewDetails: (call: Call, isDemo?: boolean) => void;
}

export const DemoCallTab = ({ campaigns, onViewDetails }: DemoCallTabProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [demoCalls, setDemoCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] =
    useState<NodeJS.Timeout | null>(null);

  const fetchDemoCalls = useCallback(async () => {
    const isInitialLoad = isLoading;
    if (!isInitialLoad) setIsRefreshing(true);

    try {
      const filters = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response = await getDemoCalls(filters);

      if (!response || !Array.isArray(response)) {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response format");
      }

      // Transform API response to match Call type
      const formattedCalls = response.map((call: any): Call => {
        const baseCall: Call = {
          id: call.id?.toString() || "",
          customer_name: call.customer_name || "",
          phone_number: call.customer_number || call.phone_number || "",
          vehicle_info: call.vehicle_info || call.vehicle_number || "",
          service_advisor_name: call.service_advisor_name || "",
          service_type: call.service_type || "",
          call_reason: call.call_reason || "",
          campaign_id: call.campaign_id?.toString() || "",
          campaign_name: call.campaign_name || "Demo Campaign",
          status: call.status?.toLowerCase() || "unknown",
          scheduled_time: call.scheduled_time || "",
          start_time: call.start_time || "",
          end_time: call.end_time || "",
          nps_score: call.nps_score || 0,
          transcript:
            call.transcript_snippets?.map((s: any) => s.text).join("\n") ||
            call.transcript ||
            "",
          recording_url: call.audio_url || call.recording_url || "",
          tags: call.tags || [],
          duration: call.duration || 0,
          direction: call.direction || "outbound",
        };

        // UI-specific fields
        baseCall.customerName = call.customer_name || "";
        baseCall.vehicleNumber = call.vehicle_info || call.vehicle_number || "";
        baseCall.serviceAdvisor = call.service_advisor_name || "";
        baseCall.callDetails = call.call_reason || "";
        baseCall.scheduledDateTime = call.scheduled_time || "";
        baseCall.callDateTime =
          call.start_time || call.scheduled_time || new Date().toISOString();
        baseCall.audioUrl = call.audio_url || call.recording_url || "";
        baseCall.serviceType = call.service_type || "";

        return baseCall;
      });

      setDemoCalls(formattedCalls);
      setTotalCount(
        response.length > 0 ? response[0].total_count || response.length : 0
      );

      // Check if there are any calls in progress - if so, schedule a refresh
      const hasInProgressCalls = formattedCalls.some(
        (call) => call.status === "in progress" || call.status === "ringing"
      );

      if (hasInProgressCalls) {
        startAutoRefresh();
      } else if (autoRefreshInterval) {
        stopAutoRefresh();
      }
    } catch (error) {
      console.error("Error fetching demo calls:", error);
      toast({
        title: "Failed to load demo calls",
        description: "There was a problem loading the demo calls",
        variant: "destructive",
      });
      setDemoCalls([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, itemsPerPage, toast, autoRefreshInterval, isLoading]);

  // Setup initial fetch
  useEffect(() => {
    fetchDemoCalls();
  }, [fetchDemoCalls, currentPage]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    };
  }, [autoRefreshInterval]);

  const startAutoRefresh = () => {
    // Don't create a new interval if one already exists
    if (autoRefreshInterval) return;

    const interval = setInterval(() => {
      fetchDemoCalls();
    }, 5000); // Refresh every 5 seconds

    setAutoRefreshInterval(interval);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  };

  const handleManualRefresh = () => {
    fetchDemoCalls();
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "in progress":
      case "ringing":
        return "secondary"; // Changed from 'warning' to 'secondary'
      case "ready":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-2">
      {/* Demo Call Section - for initiating new demo calls */}
      <DemoCallSection
        campaigns={campaigns}
        onDemoCallCreated={fetchDemoCalls}
      />

      {/* Demo Calls Table */}
      <div className="border border-border rounded-lg">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-medium">Demo Calls</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">Customer (Date)</TableHead>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : demoCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-muted-foreground">No demo calls found</p>
                  <p className="text-sm text-muted-foreground">
                    Create a new demo call using the form above
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              demoCalls.map((call) => (
                <TableRow key={call.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">
                        {call.customerName || call.customer_name}
                      </div>
                      <div className="text-sm text-foreground-secondary">
                        {formatDateTime(
                          call.callDateTime ||
                            call.start_time ||
                            call.scheduled_time ||
                            ""
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-muted text-foreground px-2 py-1 rounded">
                      {call.vehicleNumber || call.vehicle_info || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-foreground-secondary" />
                      <span className="text-foreground-secondary">
                        {call.serviceAdvisor ||
                          call.service_advisor_name ||
                          "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {call.serviceType || call.service_type || "Demo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(call.status)}
                      className={
                        call.status.toLowerCase() === "in progress"
                          ? "animate-pulse"
                          : ""
                      }
                    >
                      {call.status === "in progress"
                        ? "In Progress"
                        : call.status.charAt(0).toUpperCase() +
                          call.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(call, true)}
                      disabled={call.status.toLowerCase() !== "completed"} // Only enable for completed calls
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {demoCalls.length > 0 && (
        <CallsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};
