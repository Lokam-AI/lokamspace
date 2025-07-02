
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";
import { Booking } from "@/pages/Bookings";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking;
  selectedBookings?: Booking[];
}

export const ReminderModal = ({ isOpen, onClose, booking, selectedBookings }: ReminderModalProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState(
    `Hi [Customer Name], this is a friendly reminder about your upcoming appointment at [Time] for [Service]. Please reply to confirm or call us if you need to reschedule. Thank you!`
  );
  const [isSending, setIsSending] = useState(false);

  const recipients = booking ? [booking] : selectedBookings || [];
  const recipientCount = recipients.length;

  const handleSend = async () => {
    setIsSending(true);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSending(false);
    
    toast({
      title: "Reminder Sent Successfully",
      description: `Reminder sent to ${recipientCount} customer${recipientCount > 1 ? 's' : ''}`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Send Reminder</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {recipientCount === 1 ? (
              <p>Sending reminder to: <strong className="text-foreground">{recipients[0]?.customerName}</strong></p>
            ) : (
              <p>Sending reminder to <strong className="text-foreground">{recipientCount} customers</strong></p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Message Template
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Note: [Customer Name], [Time], and [Service] will be automatically replaced for each customer.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
