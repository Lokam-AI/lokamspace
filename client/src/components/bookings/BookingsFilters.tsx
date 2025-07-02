
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Filter } from "lucide-react";

export const BookingsFilters = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              This Week
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              This Month
            </Button>
          </div>
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Service Type
          </label>
          <div className="space-y-1">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-border bg-background mr-2" />
              <span className="text-sm text-foreground">Oil Change</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-border bg-background mr-2" />
              <span className="text-sm text-foreground">Brake Service</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-border bg-background mr-2" />
              <span className="text-sm text-foreground">Inspection</span>
            </label>
          </div>
        </div>

        {/* Service Advisor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Service Advisor
          </label>
          <div className="space-y-1">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-border bg-background mr-2" />
              <span className="text-sm text-foreground">Mike Johnson</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-border bg-background mr-2" />
              <span className="text-sm text-foreground">Lisa Rodriguez</span>
            </label>
          </div>
        </div>

        <Button className="w-full mt-4">Apply Filters</Button>
      </CardContent>
    </Card>
  );
};
