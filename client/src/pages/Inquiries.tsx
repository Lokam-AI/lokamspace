
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Clock, AlertTriangle, Filter, Eye } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { InquiriesKPIBar } from "@/components/inquiries/InquiriesKPIBar";
import { TopicAnalysisPanel } from "@/components/inquiries/TopicAnalysisPanel";
import { InquiriesTable } from "@/components/inquiries/InquiriesTable";
import { InquiryDetailPanel } from "@/components/inquiries/InquiryDetailPanel";
import { DateFilterDropdown } from "@/components/dashboard/DateFilterDropdown";

export interface Inquiry {
  id: string;
  receivedTime: string;
  caller: string;
  topic: string;
  status: 'open' | 'resolved' | 'escalated';
  nps?: number;
  transcript?: string;
  notes?: string;
  phone?: string;
  duration?: string;
}

const Inquiries = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'resolved' | 'escalated'>('all');
  const [currentFilter, setCurrentFilter] = useState("This Month");

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
  };

  const handleCloseDetails = () => {
    setSelectedInquiry(null);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    console.log("Inquiries filter changed to:", filter);
  };

  const handleExport = () => {
    console.log("Exporting inquiries data to PDF for:", currentFilter);
    alert(`Exporting inquiries data to PDF for ${currentFilter}`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
                     <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
             <div className="flex items-center">
               <span className="text-xl font-bold text-foreground">Lokam Space - Inquiries</span>
             </div>
           </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-background -m-4 p-4">
              {/* Top Controls */}
              <div className="flex items-center justify-between mb-8 pt-4">
                <h1 className="text-2xl font-bold text-foreground">Inquiries Management</h1>
                <DateFilterDropdown 
                  onFilterChange={handleFilterChange} 
                  onExport={handleExport}
                />
              </div>

              {/* KPI Bar */}
              <InquiriesKPIBar />

              {/* Topic Analysis */}
              <div className="mb-8">
                <TopicAnalysisPanel />
              </div>

              {/* Inquiries Table with Tabs */}
              <Card className="shadow-md border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">Inquiry Management</CardTitle>
                    <div className="flex space-x-1 bg-muted rounded-lg p-1">
                      {(['all', 'open', 'resolved', 'escalated'] as const).map((tab) => (
                        <Button
                          key={tab}
                          variant={activeTab === tab ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveTab(tab)}
                          className={`capitalize ${
                            activeTab === tab 
                              ? 'bg-primary text-primary-foreground hover:bg-primary-hover' 
                              : 'text-foreground-secondary hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          {tab}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <InquiriesTable 
                    activeTab={activeTab}
                    onViewDetails={handleViewDetails} 
                  />
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>

        {/* Inquiry Detail Panel */}
        {selectedInquiry && (
          <InquiryDetailPanel
            inquiry={selectedInquiry}
            isOpen={!!selectedInquiry}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Inquiries;
