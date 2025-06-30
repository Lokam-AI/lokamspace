
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, X, MessageSquare, Phone } from "lucide-react";
import { Booking } from "@/pages/Bookings";
import { BookingReminderIndicator } from "./BookingReminderIndicator";

interface BookingDetailPanelProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSendReminder?: (booking: Booking) => void;
}

export const BookingDetailPanel = ({ booking, isOpen, onClose, onSendReminder }: BookingDetailPanelProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'no-show':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Mock reminder data - in real app this would come from the booking data
  const mockReminders = [
    { type: "1 Week Before", scheduled: true, sent: true, scheduledTime: "Dec 8, 2024 9:00 AM" },
    { type: "1 Day Before", scheduled: true, sent: false, scheduledTime: "Dec 14, 2024 9:00 AM" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Booking Details</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={getStatusBadgeVariant(booking.status)}
              className="capitalize"
            >
              {booking.status}
            </Badge>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onSendReminder?.(booking)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                SMS
              </Button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-foreground">Name:</span> <span className="text-muted-foreground">{booking.customerName}</span></p>
              <p><span className="font-medium text-foreground">Phone:</span> <span className="text-muted-foreground">{booking.phone || 'N/A'}</span></p>
              <p><span className="font-medium text-foreground">Vehicle:</span> <span className="text-muted-foreground">{booking.vehicle}</span></p>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-foreground">Time:</span> <span className="text-muted-foreground">{booking.time}</span></p>
              <p><span className="font-medium text-foreground">Service:</span> <span className="text-muted-foreground">{booking.service}</span></p>
              <p><span className="font-medium text-foreground">Advisor:</span> <span className="text-muted-foreground">{booking.serviceAdvisor || 'Unassigned'}</span></p>
            </div>
          </div>

          {/* Reminder Status */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <BookingReminderIndicator reminders={mockReminders} />
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Notes</h3>
            <textarea 
              className="w-full p-3 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground"
              rows={4}
              placeholder="Add internal notes..."
              defaultValue={booking.notes || ''}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-border">
            {booking.status === 'pending' && (
              <Button className="w-full" size="sm">
                <CheckSquare className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            )}
            
            <Button variant="destructive" className="w-full" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
