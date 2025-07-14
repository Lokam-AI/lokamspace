import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Plus, Filter } from "lucide-react";
import { CallsFilters } from "@/components/calls/CallsFilters";
import { CallsMetrics } from "@/components/calls/CallsMetrics";
import { ScheduleSettings } from "@/components/calls/ScheduleSettings";
import { ReadyForCallTab } from "@/components/calls/ReadyForCallTab";
import { MissedCallsTab } from "@/components/calls/MissedCallsTab";
import { CompletedCallsTab } from "@/components/calls/CompletedCallsTab";
import { CallDetailPanel } from "@/components/calls/CallDetailPanel";
import { BulkUploadModal } from "@/components/calls/BulkUploadModal";
import { DemoCallTab } from "@/components/calls/DemoCallTab";
import { Campaign } from "@/types/campaign";

export interface CallFilters {
  dateRange: { start: string; end: string };
  status: string;
  advisor: string;
  searchTerm: string;
  campaignId: string;
  scheduledTimeRange: { start: string; end: string };
  scheduledDays: string[];
}

export interface Call {
  id: string;
  customer_name: string;
  vehicle_info?: string;
  service_advisor_name?: string;
  call_reason?: string;
  scheduled_time?: string;
  start_time?: string;
  end_time?: string;
  status: string;
  nps_score?: number;
  transcript?: string;
  recording_url?: string;
  tags?: string[];
  campaign_id?: string;
  campaign_name?: string;
  service_type?: string;
  phone_number: string;
  duration?: number;
  direction?: string;
  feedback_summary?: string;
  positive_mentions?: string[];
  areas_to_improve?: string[];

  // UI-specific fields (camelCase)
  customerName?: string; // For backward compatibility
  vehicleNumber?: string; // For backward compatibility
  serviceAdvisor?: string; // For backward compatibility
  callDetails?: string; // For backward compatibility
  scheduledDateTime?: string; // For backward compatibility
  callDateTime?: string; // For backward compatibility
  audioUrl?: string; // For backward compatibility
  serviceType?: string; // For backward compatibility with service_type
}

// Mock campaigns data
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Spring Service Reminders",
    organizationId: "org1",
    dateCreated: "2024-03-01",
    callCount: 45,
  },
  {
    id: "2",
    name: "Oil Change Follow-ups",
    organizationId: "org1",
    dateCreated: "2024-03-15",
    callCount: 32,
  },
  {
    id: "3",
    name: "Brake Inspection Campaign",
    organizationId: "org1",
    dateCreated: "2024-03-20",
    callCount: 28,
  },
  {
    id: "4",
    name: "Imported - 2024-03-25",
    organizationId: "org1",
    dateCreated: "2024-03-25",
    callCount: 156,
  },
  {
    id: "5",
    name: "Winter Maintenance Check",
    organizationId: "org1",
    dateCreated: "2024-03-10",
    callCount: 67,
  },
  {
    id: "demo",
    name: "Demo Campaign",
    organizationId: "org1",
    dateCreated: "2024-03-01",
    callCount: 12,
  },
];

const Calls = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ready");
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isDMSFetching, setIsDMSFetching] = useState(false);

  const [filters, setFilters] = useState<CallFilters>({
    dateRange: { start: "", end: "" },
    status: "all",
    advisor: "all",
    searchTerm: "",
    campaignId: "all",
    scheduledTimeRange: { start: "", end: "" },
    scheduledDays: [],
  });

  const handleCallAction = (callId: string, action: "call" | "retry") => {
    const actionText =
      action === "call" ? "Call initiated" : "Call retry initiated";
    toast({
      title: actionText,
      description: `Starting ${action} for call ID: ${callId}`,
    });
  };

  const handleViewDetails = (call: Call) => {
    setSelectedCall(call);
  };

  const handleCloseDetails = () => {
    setSelectedCall(null);
  };

  const handleDMSFetch = () => {
    setIsDMSFetching(true);

    // Simulate DMS fetch
    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: `DMS Import - ${today}`,
        organizationId: "org1",
        dateCreated: today,
        callCount: Math.floor(Math.random() * 100) + 50,
      };

      setCampaigns((prev) => [...prev, newCampaign]);
      setIsDMSFetching(false);

      toast({
        title: "DMS fetch completed",
        description: `${newCampaign.callCount} calls fetched from DMS and added to "${newCampaign.name}"`,
      });
    }, 3000);
  };

  const handleCampaignCreated = (name: string) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name,
      organizationId: "org1",
      dateCreated: new Date().toISOString().split("T")[0],
      callCount: 0,
    };
    setCampaigns((prev) => [...prev, newCampaign]);
  };

  const activeCampaign = campaigns.find(
    (c) => c.id === filters.campaignId && filters.campaignId !== "all"
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Feedback Calls Management
                  </h1>
                  <p className="text-muted-foreground">
                    Manage customer feedback calls, track progress, and review
                    completed interactions
                  </p>
                  {activeCampaign && (
                    <div className="mt-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-md inline-block">
                      Campaign: {activeCampaign.name}
                    </div>
                  )}
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setIsBulkUploadOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>

                  <Button
                    onClick={handleDMSFetch}
                    disabled={isDMSFetching}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDMSFetching ? "Fetching from DMS..." : "Fetch from DMS"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-background">
              <div className="p-6 space-y-6">
                {/* Schedule Settings */}
                <ScheduleSettings />

                {/* Filters Section */}
                <div className="bg-card rounded-lg shadow-sm border border-border">
                  <CallsFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    campaigns={campaigns}
                  />
                </div>

                {/* Dynamic Metrics */}
                <CallsMetrics filters={filters} activeTab={activeTab} />

                {/* Tab Navigation */}
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <div className="border-b border-border bg-muted/30 px-6">
                      <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-transparent h-12">
                        <TabsTrigger
                          value="ready"
                          className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary transition-all duration-150"
                        >
                          Ready for Call
                        </TabsTrigger>
                        <TabsTrigger
                          value="missed"
                          className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary transition-all duration-150"
                        >
                          Missed Calls
                        </TabsTrigger>
                        <TabsTrigger
                          value="completed"
                          className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary transition-all duration-150"
                        >
                          Completed Calls
                        </TabsTrigger>
                        <TabsTrigger
                          value="demo"
                          className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary transition-all duration-150"
                        >
                          Demo Calls
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-6 bg-background">
                      <TabsContent value="ready" className="mt-0">
                        <ReadyForCallTab
                          filters={filters}
                          onCallAction={handleCallAction}
                        />
                      </TabsContent>

                      <TabsContent value="missed" className="mt-0">
                        <MissedCallsTab
                          filters={filters}
                          onRetryCall={handleCallAction}
                        />
                      </TabsContent>

                      <TabsContent value="completed" className="mt-0">
                        <CompletedCallsTab
                          filters={filters}
                          onViewDetails={handleViewDetails}
                        />
                      </TabsContent>

                      <TabsContent value="demo" className="mt-0">
                        <DemoCallTab
                          campaigns={campaigns}
                          onViewDetails={handleViewDetails}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          {selectedCall && (
            <CallDetailPanel
              call={selectedCall}
              isOpen={!!selectedCall}
              onClose={handleCloseDetails}
            />
          )}

          {/* Modals */}
          <BulkUploadModal
            isOpen={isBulkUploadOpen}
            onClose={() => setIsBulkUploadOpen(false)}
            campaigns={campaigns}
            onCampaignCreated={handleCampaignCreated}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Calls;
