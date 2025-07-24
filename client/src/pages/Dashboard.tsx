
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const Dashboard = () => {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [currentFilter, setCurrentFilter] = useState("This Month");
  
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

  const handleExport = () => {
    console.log("Exporting dashboard data to PDF for:", currentFilter);
    // In a real app, this would generate and download a PDF
    alert(`Exporting dashboard data to PDF for ${currentFilter}`);
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-background -m-4 p-4">
              {/* Dashboard Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between pt-4">
                  <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
                  <DateFilterDropdown 
                    onFilterChange={handleFilterChange} 
                    onExport={handleExport}
                  />
                </div>

                {/* Metrics Grid - Now 4 cards in one row */}
                <MetricsGrid />

                {/* Insights and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2">
                    <InsightsPanels />
                  </div>
                  <div className="h-full">
                    {/* Quick Stats */}
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <div>
                              <p className="font-medium text-sm text-foreground">New Detractor</p>
                              <p className="text-sm text-foreground-secondary">NPS Score: 3</p>
                            </div>
                          </div>
                          <Badge variant="destructive">New</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-success" />
                            <div>
                              <p className="font-medium text-sm text-foreground">Call Completed</p>
                              <p className="text-sm text-foreground-secondary">Customer #1234</p>
                            </div>
                          </div>
                          <Badge variant="secondary">5 min ago</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm text-foreground">Weekly Report</p>
                              <p className="text-sm text-foreground-secondary">85% completion rate</p>
                            </div>
                          </div>
                          <Badge>Ready</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-warning" />
                            <div>
                              <p className="font-medium text-sm text-foreground">New Customer</p>
                              <p className="text-sm text-foreground-secondary">Registration completed</p>
                            </div>
                          </div>
                          <Badge variant="secondary">15 min ago</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-5 w-5 text-success" />
                            <div>
                              <p className="font-medium text-sm text-foreground">Goal Achieved</p>
                              <p className="text-sm text-foreground-secondary">Monthly target reached</p>
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
              <div className="mt-8">
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
