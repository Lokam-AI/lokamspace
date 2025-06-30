
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, AlertTriangle, FileText, Phone, User, Calendar, Clock, MessageSquare, Save } from "lucide-react";
import { Inquiry } from "@/pages/Inquiries";
import { CallTranscriptChat } from "@/components/dashboard/CallTranscriptChat";
import { useState } from "react";
import { toast } from "sonner";

interface InquiryDetailPanelProps {
  inquiry: Inquiry;
  isOpen: boolean;
  onClose: () => void;
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
  author: string;
}

export const InquiryDetailPanel = ({ inquiry, isOpen, onClose }: InquiryDetailPanelProps) => {
  const [currentNote, setCurrentNote] = useState(inquiry.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Customer was very satisfied with the service explanation provided.',
      timestamp: '2024-01-15T10:35:00',
      author: 'John Smith'
    }
  ]);

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

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const handleSaveNote = async () => {
    if (!currentNote.trim()) {
      toast.error("Please enter a note before saving");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote,
      timestamp: new Date().toISOString(),
      author: 'Current User'
    };

    setSavedNotes(prev => [newNote, ...prev]);
    setCurrentNote('');
    setIsLoading(false);
    
    toast.success("Note saved successfully");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto bg-background border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2 text-foreground">
            <Phone className="h-5 w-5" />
            <span>Inquiry Details</span>
          </SheetTitle>
          <SheetDescription className="text-foreground-secondary">
            Comprehensive details about the inquiry from {inquiry.caller}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Customer Information */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-foreground-secondary" />
                  <div>
                    <span className="text-sm text-foreground-secondary">Name:</span>
                    <p className="font-medium text-foreground">{inquiry.caller}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-foreground-secondary" />
                  <div>
                    <span className="text-sm text-foreground-secondary">Phone:</span>
                    <p className="font-medium text-foreground">{inquiry.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-foreground-secondary" />
                  <div>
                    <span className="text-sm text-foreground-secondary">Topic:</span>
                    <p className="font-medium text-foreground">{inquiry.topic}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-foreground-secondary" />
                  <div>
                    <span className="text-sm text-foreground-secondary">Duration:</span>
                    <p className="font-medium text-foreground">{inquiry.duration || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Calendar className="h-4 w-4 text-foreground-secondary" />
                  <div>
                    <span className="text-sm text-foreground-secondary">Received Time:</span>
                    <p className="font-medium text-foreground">{formatDateTime(inquiry.receivedTime)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inquiry Status */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Inquiry Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Badge className={`capitalize ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </Badge>
                <div className="text-sm text-foreground-secondary">
                  Current status of the inquiry
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Summary */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Call Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-secondary leading-relaxed">
                {inquiry.topic === "Pricing Questions" && "Customer inquired about brake service pricing and warranty information. Provided comprehensive pricing details and warranty terms."}
                {inquiry.topic === "Appointment Scheduling" && "Customer requested to schedule an oil change appointment. Discussed availability and preferred time slots."}
                {inquiry.topic === "Service Status" && "Customer called regarding delayed vehicle service. Issue was escalated to service manager for immediate resolution."}
                {inquiry.topic === "Warranty Claims" && "Customer submitted warranty claim for transmission work. Claim was processed and approved successfully."}
              </p>
            </CardContent>
          </Card>

          {/* Call Transcript */}
          {inquiry.transcript && (
            <CallTranscriptChat transcript={inquiry.transcript} />
          )}

          {/* Internal Notes */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                <MessageSquare className="h-5 w-5" />
                <span>Internal Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Note */}
              <div className="space-y-3">
                <Textarea 
                  className="w-full bg-background border-input text-foreground"
                  rows={4}
                  placeholder="Add internal notes about this inquiry..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-secondary">
                    {currentNote.length}/500 characters
                  </span>
                  <Button 
                    onClick={handleSaveNote}
                    disabled={isLoading || !currentNote.trim()}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Note'}</span>
                  </Button>
                </div>
              </div>

              {/* Notes History */}
              {savedNotes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Previous Notes</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {savedNotes.map((note) => (
                      <div key={note.id} className="bg-muted p-3 rounded-lg border border-border">
                        <p className="text-sm text-foreground mb-2">{note.content}</p>
                        <div className="text-xs text-foreground-secondary flex items-center space-x-2">
                          <span>{note.author}</span>
                          <span>•</span>
                          <span>{formatDateTime(note.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inquiry.status === 'open' && (
                <Button className="w-full" size="sm">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
              
              {inquiry.status !== 'escalated' && (
                <Button variant="destructive" className="w-full" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate Inquiry
                </Button>
              )}
              
              <Button variant="outline" className="w-full" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Create CRM Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
