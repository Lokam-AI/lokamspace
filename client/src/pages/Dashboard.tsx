
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MetricsGrid } from "@/components/MetricsGrid";
import { InsightsPanels } from "@/components/InsightsPanels";
import { RecentFeedbackCalls } from "@/components/dashboard/RecentFeedbackCalls";
import { CallDetailPanel } from "@/components/calls/CallDetailPanel";
import { DateFilterDropdown } from "@/components/dashboard/DateFilterDropdown";
import { Call } from "@/pages/Calls";
import { exportDashboardToPDF } from "@/utils/pdfExport";
import { useToast } from "@/hooks/use-toast";
import { useCallsSummaryMetricsWithTrends } from "@/api/queries/calls";
import { getFeedbackInsights, FeedbackInsights } from "@/api/endpoints/analytics";
import { toast } from "sonner";

const Dashboard = () => {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [currentFilter, setCurrentFilter] = useState("This Month");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  // Get the metrics data for PDF export
  const { data: summaryData } = useCallsSummaryMetricsWithTrends();
  
  // Feedback insights state
  const [feedbackInsights, setFeedbackInsights] = useState<FeedbackInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  
  const handleViewDetails = (call: Call) => {
    setSelectedCall(call);
  };
  
  const handleCloseDetails = () => {
    setSelectedCall(null);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    console.log("Dashboard filter changed to:", filter);
    // In a real app, this would trigger data refetch
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      console.log("Exporting dashboard data to PDF for:", currentFilter);
      
      if (!summaryData) {
        toast({
          title: "Export Failed",
          description: "No data available for export. Please wait for data to load.",
          variant: "destructive",
        });
        return;
      }
      
      await exportDashboardToPDF(currentFilter, summaryData);
      toast({
        title: "PDF Generated Successfully",
        description: `Dashboard report for ${currentFilter} has been downloaded.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch feedback insights
  useEffect(() => {
    const fetchFeedbackInsights = async () => {
      try {
        setIsLoadingInsights(true);
        setInsightsError(null);
        
        const data = await getFeedbackInsights();
        setFeedbackInsights(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch feedback insights';
        setInsightsError(errorMessage);
        console.error('Failed to fetch feedback insights:', error);
        
        // Show error toast - Fix: Use the useToast hook instead of toast.error()
        toast({
          title: "Failed to load feedback insights",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchFeedbackInsights();
  }, [currentFilter]); // Re-fetch when filter changes (for future date filtering support)
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-background -m-4 p-4" data-dashboard-content>
              {/* Dashboard Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between pt-4">
                  <h1 className="text-2xl font-bold text-foreground">Overview</h1>
                  <DateFilterDropdown 
                    onFilterChange={handleFilterChange} 
                    onExport={handleExport}
                    isExporting={isExporting}
                  />
                </div>

                {/* Metrics Grid - Now 4 cards in one row */}
                <MetricsGrid />

                {/* Insights and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2">
                    <InsightsPanels 
                      positiveInsights={feedbackInsights?.positive_mentions || []}
                      improvementAreas={feedbackInsights?.areas_to_improve || []}
                      isLoading={isLoadingInsights}
                      error={insightsError}
                    />
                  </div>
                  <div className="h-full">
                    {/* Quick Stats */}
                    <Card className="h-full shadow-lg transform transition-transform hover:scale-105">
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20 h-16 shadow-md transform transition-transform hover:scale-105">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <div>
                              <p className="font-medium text-sm text-foreground">New Detractor</p>
                              <p className="text-sm text-foreground-secondary">NPS Score: 3</p>
                            </div>
                          </div>
                          <Badge variant="destructive">New</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20 h-16 shadow-md transform transition-transform hover:scale-105">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-success" />
                            <div>
                              <p className="font-medium text-sm text-foreground">Call Completed</p>
                              <p className="text-sm text-foreground-secondary">Customer #1234</p>
                            </div>
                          </div>
                          <Badge variant="secondary">5 min ago</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 h-16 shadow-md transform transition-transform hover:scale-105">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm text-foreground">Weekly Report</p>
                              <p className="text-sm text-foreground-secondary">85% completion rate</p>
                            </div>
                          </div>
                          <Badge>Ready</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20 h-16 shadow-md transform transition-transform hover:scale-105">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-warning" />
                            <div>
                              <p className="font-medium text-sm text-foreground">New Promoter</p>
                              <p className="text-sm text-foreground-secondary">NPS Score: 9</p>
                            </div>
                          </div>
                          <Badge variant="secondary">15 min ago</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20 h-16 shadow-md transform transition-transform hover:scale-105">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-5 w-5 text-success" />
                            <div>
                              <p className="font-medium text-sm text-foreground">DMS Integration</p>
                              <p className="text-sm text-foreground-secondary">14 service records fetched</p>
                            </div>
                          </div>
                          <Badge variant="outline">1 hour ago</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Recent Feedback Calls Table - Inbound Calls section removed */}
              <div className="mt-8" data-no-pdf>
                <RecentFeedbackCalls onViewDetails={handleViewDetails} />
              </div>
            </div>
          </main>
        </SidebarInset>

        {/* Call Detail Panel */}
        {selectedCall && (
          <CallDetailPanel 
            call={selectedCall} 
            isOpen={!!selectedCall} 
            onClose={handleCloseDetails} 
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
