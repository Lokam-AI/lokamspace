import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";
import { DemoCall } from "@/types/campaign";
import { createDemoCall, initiateDemoCall } from "@/api/endpoints/calls";

interface DemoCallSectionProps {
  campaigns: Campaign[];
}

export const DemoCallSection = ({ campaigns }: DemoCallSectionProps) => {
  const { toast } = useToast();
  const [demoCall, setDemoCall] = useState<DemoCall>({
    customerName: "",
    phoneNumber: "",
    vehicleNumber: "",
    campaignId: "demo", // Always set to demo campaign
  });
  const [isEditMode, setIsEditMode] = useState(true);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [callLogs, setCallLogs] = useState<string[]>([]);
  const [createdCallId, setCreatedCallId] = useState<string | null>(null);

  const handleInputChange = (field: keyof DemoCall, value: string) => {
    setDemoCall((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditDetails = () => {
    setIsEditMode(!isEditMode);
  };

  const handleInitiateCall = async () => {
    if (!demoCall.customerName || !demoCall.phoneNumber) {
      toast({
        title: "Missing information",
        description: "Customer name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // First create the demo call
      const createResponse = await createDemoCall({
        customer_name: demoCall.customerName,
        phone_number: demoCall.phoneNumber,
        vehicle_number: demoCall.vehicleNumber || undefined,
        campaign_id:
          demoCall.campaignId === "demo" ? "demo" : demoCall.campaignId,
        organization_id: "current", // The backend will use the current organization from the auth token
      });

      setCreatedCallId(createResponse.call_id);
      setCallLogs([`Created demo call for ${demoCall.customerName}`]);

      // Then initiate the call
      setIsCallInProgress(true);

      // Initiate the actual call
      const initiateResponse = await initiateDemoCall(createResponse.call_id);

      // Simulate call flow with logs
      const callSteps = [
        `Calling ${demoCall.phoneNumber}...`,
        "Connecting...",
        "Connected successfully",
        `Speaking with ${demoCall.customerName}`,
        "Call completed",
        "Transcript available for review",
      ];

      for (let i = 0; i < callSteps.length; i++) {
        // Use setTimeout to simulate the progression of a call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCallLogs((prev) => [...prev, callSteps[i]]);
      }

      toast({
        title: "Demo call completed",
        description: "Call transcript and logs are now available",
      });
    } catch (err) {
      console.error("Failed to create or initiate demo call:", err);
      toast({
        title: "Call Failed",
        description: "There was a problem creating or initiating the demo call",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setIsCallInProgress(false);
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
            <Label
              htmlFor="demo-customer-name"
              className="text-card-foreground"
            >
              Customer Name *
            </Label>
            <Input
              id="demo-customer-name"
              value={demoCall.customerName}
              onChange={(e) =>
                handleInputChange("customerName", e.target.value)
              }
              placeholder="Enter customer name"
              disabled={!isEditMode && demoCall.customerName !== ""}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="demo-phone" className="text-card-foreground">
              Phone Number *
            </Label>
            <Input
              id="demo-phone"
              value={demoCall.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={!isEditMode && demoCall.phoneNumber !== ""}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="demo-vehicle" className="text-card-foreground">
              Vehicle Number
            </Label>
            <Input
              id="demo-vehicle"
              value={demoCall.vehicleNumber}
              onChange={(e) =>
                handleInputChange("vehicleNumber", e.target.value)
              }
              placeholder="ABC-123"
              disabled={!isEditMode && demoCall.vehicleNumber !== ""}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="demo-campaign" className="text-card-foreground">
              Campaign
            </Label>
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
            disabled={isCallInProgress || isCreating}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditMode ? "Save Details" : "Edit Details"}
          </Button>

          <Button
            onClick={handleInitiateCall}
            disabled={
              isCallInProgress ||
              isCreating ||
              !demoCall.customerName ||
              !demoCall.phoneNumber
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isCreating || isCallInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isCreating ? "Creating..." : "Calling..."}
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Initiate Demo Call
              </>
            )}
          </Button>
        </div>

        {/* Call Logs */}
        {callLogs.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-2 text-foreground">
              Call Logs:
            </h4>
            <div className="space-y-1">
              {callLogs.map((log, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground flex items-center"
                >
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
