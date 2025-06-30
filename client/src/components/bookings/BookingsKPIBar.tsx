
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, X, AlertTriangle } from "lucide-react";

export const BookingsKPIBar = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Bookings */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-150">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Bookings</p>
              <p className="text-3xl font-bold text-foreground">24</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">85% capacity</p>
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>
          {/* Simple capacity ring indicator */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Bookings (24h) */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-150">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Bookings (24h)</p>
              <p className="text-3xl font-bold text-foreground">12</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+8% vs yesterday</p>
            </div>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          {/* Simple sparkline representation */}
          <div className="mt-4 flex items-end space-x-1 h-8">
            {[3, 5, 4, 7, 6, 8, 12].map((height, i) => (
              <div 
                key={i}
                className="bg-green-500/20 rounded-sm flex-1"
                style={{ height: `${(height / 12) * 100}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancellations */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-150">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cancellations</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">3</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">12.5% rate</p>
            </div>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-red-600 dark:bg-red-400 h-2 rounded-full" style={{ width: '12.5%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No-Shows */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-150">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">No-Shows (7-day)</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">2</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">8.3% rate</p>
            </div>
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-yellow-600 dark:bg-yellow-400 h-2 rounded-full" style={{ width: '8.3%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
