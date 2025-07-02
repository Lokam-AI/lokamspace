
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MessageSquare, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/pages/Bookings";

interface BookingsTableProps {
  onViewDetails: (booking: Booking) => void;
  onSendReminder?: (bookings: Booking[]) => void;
}

export const BookingsTable = ({ onViewDetails, onSendReminder }: BookingsTableProps) => {
  const { toast } = useToast();
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const bookings: Booking[] = [
    {
      id: "1",
      time: "09:00 AM",
      customerName: "John Smith",
      vehicle: "2022 Honda Civic",
      service: "Oil Change",
      status: "confirmed",
      phone: "(555) 123-4567",
      serviceAdvisor: "Mike Johnson"
    },
    {
      id: "2",
      time: "10:30 AM",
      customerName: "Sarah Wilson",
      vehicle: "2021 Toyota Camry",
      service: "Brake Inspection",
      status: "pending",
      phone: "(555) 987-6543",
      serviceAdvisor: "Lisa Rodriguez"
    },
    {
      id: "3",
      time: "02:00 PM",
      customerName: "David Brown",
      vehicle: "2020 Ford F-150",
      service: "Tire Rotation",
      status: "no-show",
      phone: "(555) 456-7890",
      serviceAdvisor: "Sarah Johnson"
    },
    {
      id: "4",
      time: "03:30 PM",
      customerName: "Emma Davis",
      vehicle: "2023 Subaru Outback",
      service: "Annual Inspection",
      status: "cancelled",
      phone: "(555) 321-0987",
      serviceAdvisor: "Mike Chen"
    }
  ];

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(bookings.map(b => b.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings(prev => [...prev, bookingId]);
    } else {
      setSelectedBookings(prev => prev.filter(id => id !== bookingId));
    }
  };

  const handleBulkAction = async (action: 'confirm' | 'cancel' | 'reminder') => {
    if (selectedBookings.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select bookings to perform this action.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedBookingObjects = bookings.filter(b => selectedBookings.includes(b.id));

    switch (action) {
      case 'confirm':
        toast({
          title: "Bookings Confirmed",
          description: `Successfully confirmed ${selectedBookings.length} booking${selectedBookings.length > 1 ? 's' : ''}`,
        });
        break;
      case 'cancel':
        toast({
          title: "Bookings Cancelled",
          description: `Successfully cancelled ${selectedBookings.length} booking${selectedBookings.length > 1 ? 's' : ''}`,
        });
        break;
      case 'reminder':
        onSendReminder?.(selectedBookingObjects);
        break;
    }

    setIsProcessing(false);
    setSelectedBookings([]);
  };

  return (
    <div className="bg-card rounded-lg shadow-md border border-border">
      {/* Bulk Actions Bar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="rounded border-border bg-background"
              checked={selectedBookings.length === bookings.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="text-sm text-muted-foreground">
              {selectedBookings.length > 0 ? `${selectedBookings.length} selected` : 'Select All'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={isProcessing || selectedBookings.length === 0}
              onClick={() => handleBulkAction('confirm')}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Confirm Selected'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isProcessing || selectedBookings.length === 0}
              onClick={() => handleBulkAction('reminder')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Send Reminder'}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={isProcessing || selectedBookings.length === 0}
              onClick={() => handleBulkAction('cancel')}
            >
              {isProcessing ? 'Processing...' : 'Cancel Selected'}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0">
            <TableRow>
              <TableHead className="w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-border bg-background"
                  checked={selectedBookings.length === bookings.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Vehicle</TableHead>
              <TableHead className="font-semibold">Service</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {bookings.map((booking) => (
              <TableRow 
                key={booking.id} 
                className="hover:bg-muted/50 transition-colors duration-150"
              >
                <TableCell>
                  <input 
                    type="checkbox" 
                    className="rounded border-border bg-background"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={(e) => handleSelectBooking(booking.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {booking.time}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{booking.customerName}</div>
                    <div className="text-sm text-muted-foreground">{booking.phone}</div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{booking.vehicle}</TableCell>
                <TableCell className="text-foreground">{booking.service}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(booking.status)}
                    className="capitalize"
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(booking)}
                    className="flex items-center space-x-1 hover:bg-accent active:scale-95 transition-all duration-150"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Showing 1-4 of 24 bookings</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
