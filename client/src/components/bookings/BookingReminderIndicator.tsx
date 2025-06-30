
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";

interface ReminderStatus {
  type: string;
  scheduled: boolean;
  sent: boolean;
  scheduledTime: string;
}

interface BookingReminderIndicatorProps {
  reminders: ReminderStatus[];
}

export const BookingReminderIndicator = ({ reminders }: BookingReminderIndicatorProps) => {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No automated reminders configured
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Automated Reminders</h4>
      <div className="space-y-1">
        {reminders.map((reminder, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {reminder.sent ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <Clock className="h-3 w-3 text-amber-500" />
              )}
              <span className="text-gray-600">{reminder.type}</span>
            </div>
            <Badge 
              variant={reminder.sent ? "default" : "secondary"}
              className="text-xs"
            >
              {reminder.sent ? "Sent" : "Scheduled"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
