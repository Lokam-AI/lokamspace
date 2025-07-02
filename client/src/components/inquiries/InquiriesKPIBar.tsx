
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Target, Clock, AlertTriangle } from "lucide-react";

export const InquiriesKPIBar = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Inbound Calls */}
      <Card className="shadow-md hover:shadow-lg transition-smooth border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">Total Inbound Calls</p>
              <p className="text-3xl font-bold text-foreground">47</p>
              <p className="text-sm text-success mt-1">+12% vs yesterday</p>
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Phone className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* First-Call Resolution */}
      <Card className="shadow-md hover:shadow-lg transition-smooth border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">First-Call Resolution</p>
              <p className="text-3xl font-bold text-success">78%</p>
              <p className="text-sm text-success mt-1">Above target</p>
            </div>
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-success" />
            </div>
          </div>
          {/* Gauge representation */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Handle Time */}
      <Card className="shadow-md hover:shadow-lg transition-smooth border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">Avg Handle Time</p>
              <p className="text-3xl font-bold text-foreground">4:32</p>
              <p className="text-sm text-success mt-1">-15s vs target</p>
            </div>
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-secondary" />
            </div>
          </div>
          {/* Sparkline representation */}
          <div className="mt-4 flex items-end space-x-1 h-8">
            {[5, 4, 6, 4, 3, 4, 5].map((height, i) => (
              <div 
                key={i}
                className="bg-secondary/30 rounded-sm flex-1"
                style={{ height: `${(height / 6) * 100}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Open Tickets */}
      <Card className="shadow-md hover:shadow-lg transition-smooth border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">Open Tickets</p>
              <p className="text-3xl font-bold text-destructive">8</p>
              <p className="text-sm text-destructive mt-1">Needs attention</p>
            </div>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center relative">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-xs text-destructive-foreground font-bold">8</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
