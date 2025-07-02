
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { Inquiry } from "@/pages/Inquiries";

interface InquiriesTableProps {
  activeTab: 'all' | 'open' | 'resolved' | 'escalated';
  onViewDetails: (inquiry: Inquiry) => void;
}

export const InquiriesTable = ({ activeTab, onViewDetails }: InquiriesTableProps) => {
  const allInquiries: Inquiry[] = [
    {
      id: "1",
      receivedTime: "2024-01-15T10:30:00",
      caller: "Alice Johnson",
      topic: "Pricing Questions",
      status: "resolved",
      phone: "(555) 123-4567",
      duration: "5:30",
      transcript: "Customer: Hi, I'm calling to ask about your pricing for the brake service. Agent: Of course! Our brake service starts at $299 for a complete brake pad replacement. Customer: That sounds reasonable. Can you also tell me about the warranty? Agent: Absolutely! We offer a 12-month warranty on all brake services."
    },
    {
      id: "2",
      receivedTime: "2024-01-15T11:15:00",
      caller: "Bob Smith",
      topic: "Appointment Scheduling",
      status: "open",
      phone: "(555) 987-6543",
      duration: "3:45",
      transcript: "Customer: I need to schedule an appointment for my car's oil change. Agent: I'd be happy to help you with that. What's your preferred date and time? Customer: How about this Friday afternoon? Agent: Let me check our availability for Friday afternoon slots."
    },
    {
      id: "3",
      receivedTime: "2024-01-15T12:00:00",
      caller: "Carol Williams",
      topic: "Service Status",
      status: "escalated",
      phone: "(555) 456-7890",
      duration: "8:20",
      transcript: "Customer: I'm calling to check on my car that was supposed to be ready yesterday. Agent: I apologize for the delay. Let me check the status of your vehicle right away. Customer: This is very inconvenient. I need my car for work tomorrow. Agent: I understand your frustration. Let me escalate this to our service manager immediately."
    },
    {
      id: "4",
      receivedTime: "2024-01-15T14:30:00",
      caller: "David Brown",
      topic: "Warranty Claims",
      status: "resolved",
      phone: "(555) 321-0987",
      duration: "6:15",
      transcript: "Customer: I have a warranty claim for the transmission work done last month. Agent: I'll be glad to help you with your warranty claim. Can you provide me with your service order number? Customer: Yes, it's SO-2024-001234. Agent: Thank you. I can see your service record here and will process your warranty claim right away."
    }
  ];

  // Filter inquiries based on active tab
  const filteredInquiries = activeTab === 'all' 
    ? allInquiries 
    : allInquiries.filter(inquiry => inquiry.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      case 'escalated':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 border-border">
          <TableRow className="border-border">
            <TableHead className="w-12">
              <input type="checkbox" className="rounded border-input bg-background" />
            </TableHead>
            <TableHead className="font-semibold text-foreground">Received Time</TableHead>
            <TableHead className="font-semibold text-foreground">Caller</TableHead>
            <TableHead className="font-semibold text-foreground">Topic</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {filteredInquiries.map((inquiry) => (
            <TableRow 
              key={inquiry.id} 
              className="hover:bg-muted/50 transition-smooth border-border"
            >
              <TableCell>
                <input type="checkbox" className="rounded border-input bg-background" />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">
                    {new Date(inquiry.receivedTime).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    {new Date(inquiry.receivedTime).toLocaleTimeString()}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">{inquiry.caller}</div>
                  <div className="text-sm text-foreground-secondary">{inquiry.phone}</div>
                </div>
              </TableCell>
              <TableCell className="text-foreground-secondary">{inquiry.topic}</TableCell>
              <TableCell>
                <Badge className={`capitalize ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(inquiry)}
                  className="flex items-center space-x-1 hover:bg-primary/10 hover:text-primary hover:border-primary/20 active:scale-95 transition-all duration-150"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Show empty state if no results */}
      {filteredInquiries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-foreground-secondary">No {activeTab} inquiries found.</p>
        </div>
      )}
    </div>
  );
};
