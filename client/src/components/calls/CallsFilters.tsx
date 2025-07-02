
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, X } from "lucide-react";
import { CallFilters } from "@/pages/Calls";
import { Campaign } from "@/types/campaign";

interface CallsFiltersProps {
  filters: CallFilters;
  onFiltersChange: (filters: CallFilters) => void;
  campaigns: Campaign[];
}

export const CallsFilters = ({ filters, onFiltersChange, campaigns }: CallsFiltersProps) => {
  const updateFilter = (key: keyof CallFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: "", end: "" },
      status: "all",
      advisor: "all",
      searchTerm: "",
      campaignId: "all",
      scheduledTimeRange: { start: "", end: "" },
      scheduledDays: []
    });
  };

  const hasActiveFilters = (filters.advisor && filters.advisor !== "all") || 
                          filters.searchTerm || 
                          filters.dateRange.start || 
                          filters.dateRange.end ||
                          (filters.campaignId && filters.campaignId !== "all") ||
                          filters.scheduledTimeRange.start ||
                          filters.scheduledTimeRange.end;

  // Show latest 5 campaigns by default
  const latestCampaigns = campaigns
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    .slice(0, 5);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
          {/* Enhanced Search - Supports customer name, meeting ID, contact number */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, meeting ID, or phone..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10 transition-all duration-150 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Campaign Filter */}
          <Select value={filters.campaignId || "all"} onValueChange={(value) => updateFilter('campaignId', value)}>
            <SelectTrigger className="transition-all duration-150 focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {latestCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.callCount || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="w-full text-sm transition-all duration-150 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Advisor Filter */}
          <Select value={filters.advisor || "all"} onValueChange={(value) => updateFilter('advisor', value)}>
            <SelectTrigger className="transition-all duration-150 focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="All Advisors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Advisors</SelectItem>
              <SelectItem value="john-smith">John Smith</SelectItem>
              <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
              <SelectItem value="mike-chen">Mike Chen</SelectItem>
              <SelectItem value="lisa-rodriguez">Lisa Rodriguez</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters - Positioned at the end */}
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="transition-all duration-150 hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
