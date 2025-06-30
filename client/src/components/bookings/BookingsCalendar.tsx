
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { Booking } from "@/pages/Bookings";

interface BookingsCalendarProps {
  onViewDetails: (booking: Booking) => void;
}

export const BookingsCalendar = ({ onViewDetails }: BookingsCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const mockBookings: Booking[] = [
    {
      id: "1",
      time: "09:00 AM",
      customerName: "John Smith",
      vehicle: "Honda Civic",
      service: "Oil Change",
      status: "confirmed",
      phone: "(555) 123-4567"
    },
    {
      id: "2",
      time: "10:30 AM",
      customerName: "Sarah Wilson",
      vehicle: "Toyota Camry",
      service: "Brake Inspection",
      status: "pending",
      phone: "(555) 987-6543"
    },
    {
      id: "3",
      time: "02:00 PM",
      customerName: "Mike Johnson",
      vehicle: "Ford F-150",
      service: "Tire Rotation",
      status: "confirmed",
      phone: "(555) 456-7890"
    },
    {
      id: "4",
      time: "03:30 PM",
      customerName: "Emma Davis",
      vehicle: "Subaru Outback",
      service: "Annual Inspection",
      status: "cancelled",
      phone: "(555) 321-0987"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const weekStart = startOfWeek(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBookingsForDay = (date: Date) => {
    // For demo purposes, show bookings on weekdays
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return []; // Weekend
    
    // Distribute bookings across weekdays
    const bookingsPerDay = Math.floor(mockBookings.length / 5);
    const startIndex = (dayOfWeek - 1) * bookingsPerDay;
    return mockBookings.slice(startIndex, startIndex + bookingsPerDay);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Weekly Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayBookings = getBookingsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={index} className="min-h-[200px]">
                <div className={`text-center p-2 mb-2 rounded-lg ${
                  isToday ? 'bg-blue-100 text-blue-900' : 'bg-gray-50 text-gray-700'
                }`}>
                  <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                </div>
                
                <div className="space-y-1">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-2 rounded border-l-4 border-blue-400 bg-white hover:bg-blue-50 cursor-pointer transition-colors duration-150 text-xs"
                      onClick={() => onViewDetails(booking)}
                    >
                      <div className="font-medium text-gray-900 mb-1">
                        {booking.time}
                      </div>
                      <div className="text-gray-600 mb-1">
                        {booking.customerName}
                      </div>
                      <div className="text-gray-500 mb-1">
                        {booking.service}
                      </div>
                      <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
