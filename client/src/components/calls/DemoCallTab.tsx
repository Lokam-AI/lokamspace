import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, User, Eye, Loader2 } from "lucide-react";
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
  onViewDetails: (call: Call) => void;
}

export const DemoCallTab = ({ campaigns, onViewDetails }: DemoCallTabProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [demoCalls, setDemoCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchDemoCalls();
  }, [currentPage]);

  const fetchDemoCalls = async () => {
    setIsLoading(true);
    try {
      const filters = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response = await getDemoCalls(filters);

      // Transform API response to match Call type
      const formattedCalls = response.map((call: any) => ({
        id: call.id.toString(),
        customerName: call.customer_name || "",
        phoneNumber: call.customer_number || "",
        vehicleNumber: call.vehicle_info || "",
        serviceAdvisor: call.service_advisor_name || "",
        serviceType: call.service_type || "",
        callDetails: call.call_reason || "",
        campaignId: call.campaign_id?.toString() || "",
        campaignName: "Demo Campaign",
        status: call.status.toLowerCase(),
        callDateTime:
          call.start_time || call.scheduled_time || new Date().toISOString(),
        npsScore: call.nps_score || 0,
        transcript:
          call.transcript_snippets?.map((s: any) => s.text).join("\n") || "",
        audioUrl: call.audio_url || "",
        tags: call.tags || [],
      }));

      setDemoCalls(formattedCalls);
      setTotalCount(
        response.length > 0 ? response[0].total_count || response.length : 0
      );
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
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  const getNPSBadgeVariant = (score: number) => {
    if (score >= 9) return "default";
    if (score >= 7) return "secondary";
    return "destructive";
  };

  const getNPSLabel = (score: number) => {
    if (score >= 9) return "Promoter";
    if (score >= 7) return "Passive";
    return "Detractor";
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
                        {call.customerName}
                      </div>
                      <div className="text-sm text-foreground-secondary">
                        {formatDateTime(call.callDateTime!)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-muted text-foreground px-2 py-1 rounded">
                      {call.vehicleNumber || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-foreground-secondary" />
                      <span className="text-foreground-secondary">
                        {call.serviceAdvisor || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {call.serviceType || "Demo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        call.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {call.status.charAt(0).toUpperCase() +
                        call.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(call)}
                      disabled={call.status !== "completed"} // Only enable for completed calls
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
