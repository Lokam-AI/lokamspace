
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";
import { DemoCall } from "@/types/campaign";

interface DemoCallSectionProps {
  campaigns: Campaign[];
}

export const DemoCallSection = ({ campaigns }: DemoCallSectionProps) => {
  const { toast } = useToast();
  const [demoCall, setDemoCall] = useState<DemoCall>({
    customerName: "",
    phoneNumber: "",
    vehicleNumber: "",
    campaignId: "demo" // Always set to demo campaign
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [callLogs, setCallLogs] = useState<string[]>([]);

  const handleInputChange = (field: keyof DemoCall, value: string) => {
    setDemoCall(prev => ({ ...prev, [field]: value }));
  };

  const handleEditDetails = () => {
    setIsEditMode(!isEditMode);
  };

  const handleInitiateCall = async () => {
    if (!demoCall.customerName || !demoCall.phoneNumber) {
      toast({
        title: "Missing information",
        description: "Customer name and phone number are required",
        variant: "destructive"
      });
      return;
    }

    setIsCallInProgress(true);
    setCallLogs([]);

    // Simulate call flow
    const callSteps = [
      `Calling ${demoCall.phoneNumber}...`,
      "Connecting...",
      "Connected successfully",
      `Speaking with ${demoCall.customerName}`,
      "Call completed",
      "Transcript available for review"
    ];

    for (let i = 0; i < callSteps.length; i++) {
      setTimeout(() => {
        setCallLogs(prev => [...prev, callSteps[i]]);
        if (i === callSteps.length - 1) {
          setIsCallInProgress(false);
          toast({
            title: "Demo call completed",
            description: "Call transcript and logs are now available",
          });
        }
      }, (i + 1) * 1000);
    }
  };

  return (
    <Card className="mt-6 mb-12 bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <Phone className="h-5 w-5 mr-2" />
          Demo Call Section
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="demo-customer-name" className="text-card-foreground">Customer Name *</Label>
            <Input
              id="demo-customer-name"
              value={demoCall.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Enter customer name"
              disabled={!isEditMode && demoCall.customerName !== ""}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="demo-phone" className="text-card-foreground">Phone Number *</Label>
            <Input
              id="demo-phone"
              value={demoCall.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={!isEditMode && demoCall.phoneNumber !== ""}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="demo-vehicle" className="text-card-foreground">Vehicle Number</Label>
            <Input
              id="demo-vehicle"
              value={demoCall.vehicleNumber}
              onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
              placeholder="ABC-123"
              disabled={!isEditMode && demoCall.vehicleNumber !== ""}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="demo-campaign" className="text-card-foreground">Campaign</Label>
            <Input
              id="demo-campaign"
              value="Demo Campaign"
              readOnly
              className="mt-1 bg-muted text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleEditDetails}
            disabled={isCallInProgress}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditMode ? "Save Details" : "Edit Details"}
          </Button>

          <Button
            onClick={handleInitiateCall}
            disabled={isCallInProgress || !demoCall.customerName || !demoCall.phoneNumber}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Phone className="h-4 w-4 mr-2" />
            {isCallInProgress ? "Calling..." : "Initiate Demo Call"}
          </Button>
        </div>

        {/* Call Logs */}
        {callLogs.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-2 text-foreground">Call Logs:</h4>
            <div className="space-y-1">
              {callLogs.map((log, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-center">
                  <span className="text-primary mr-2">•</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
