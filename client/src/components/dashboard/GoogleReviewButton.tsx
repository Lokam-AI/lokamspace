
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

interface GoogleReviewButtonProps {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const GoogleReviewButton = ({ customerName, customerEmail, customerPhone }: GoogleReviewButtonProps) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendReviewLink = async (method: 'email' | 'sms') => {
    setIsSending(true);
    // Simulate sending process
    setTimeout(() => {
      setIsSending(false);
      // In a real app, this would integrate with email/SMS service
      alert(`Google Review link sent via ${method} to ${customerName}`);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Google Review Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Send a Google Review link to {customerName} to collect their feedback.
        </p>
        <div className="flex space-x-3">
          {customerEmail && (
            <Button
              onClick={() => handleSendReviewLink('email')}
              disabled={isSending}
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Send via Email</span>
            </Button>
          )}
          {customerPhone && (
            <Button
              variant="outline"
              onClick={() => handleSendReviewLink('sms')}
              disabled={isSending}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Send via SMS</span>
            </Button>
          )}
        </div>
        {isSending && (
          <p className="text-sm text-blue-600">Sending review link...</p>
        )}
      </CardContent>
    </Card>
  );
};
