
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, AlertTriangle, Filter, CheckSquare, X, MessageSquare, Settings } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BookingsKPIBar } from "@/components/bookings/BookingsKPIBar";
import { BookingsCalendar } from "@/components/bookings/BookingsCalendar";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsFilters } from "@/components/bookings/BookingsFilters";
import { BookingDetailPanel } from "@/components/bookings/BookingDetailPanel";
import { ReminderModal } from "@/components/bookings/ReminderModal";
import { BookingReminderSettings } from "@/components/bookings/BookingReminderSettings";

export interface Booking {
  id: string;
  time: string;
  customerName: string;
  vehicle: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'no-show';
  phone?: string;
  serviceAdvisor?: string;
  notes?: string;
}

const Bookings = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [reminderModal, setReminderModal] = useState<{
    isOpen: boolean;
    booking?: Booking;
    selectedBookings?: Booking[];
  }>({ isOpen: false });
  const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handleSendReminder = (bookingOrBookings: Booking | Booking[]) => {
    if (Array.isArray(bookingOrBookings)) {
      setReminderModal({
        isOpen: true,
        selectedBookings: bookingOrBookings
      });
    } else {
      setReminderModal({
        isOpen: true,
        booking: bookingOrBookings
      });
    }
  };

  const handleCloseReminderModal = () => {
    setReminderModal({ isOpen: false });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
                     <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
             <div className="flex items-center">
               <span className="text-xl font-bold text-foreground">Lokam Space - Bookings</span>
             </div>
           </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-background -m-4 p-4">
              {/* Top Controls */}
              <div className="flex items-center justify-between mb-8 pt-4">
                <h1 className="text-2xl font-bold text-foreground">Bookings Management</h1>
                <div className="flex items-center space-x-3">
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReminderSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Reminder Settings
                  </Button>
                </div>
              </div>

              {/* KPI Bar */}
              <BookingsKPIBar />

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Filters Sidebar */}
                {showFilters && (
                  <div className="lg:col-span-1">
                    <BookingsFilters />
                  </div>
                )}
                
                {/* Main View */}
                <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
                  {viewMode === 'calendar' ? (
                    <BookingsCalendar onViewDetails={handleViewDetails} />
                  ) : (
                    <BookingsTable 
                      onViewDetails={handleViewDetails} 
                      onSendReminder={handleSendReminder}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>

        {/* Booking Detail Panel */}
        {selectedBooking && (
          <BookingDetailPanel
            booking={selectedBooking}
            isOpen={!!selectedBooking}
            onClose={handleCloseDetails}
            onSendReminder={handleSendReminder}
          />
        )}

        {/* Reminder Modal */}
        <ReminderModal
          isOpen={reminderModal.isOpen}
          onClose={handleCloseReminderModal}
          booking={reminderModal.booking}
          selectedBookings={reminderModal.selectedBookings}
        />

        {/* Reminder Settings Modal */}
        <BookingReminderSettings
          isOpen={reminderSettingsOpen}
          onClose={() => setReminderSettingsOpen(false)}
        />
      </div>
    </SidebarProvider>
  );
};

export default Bookings;
