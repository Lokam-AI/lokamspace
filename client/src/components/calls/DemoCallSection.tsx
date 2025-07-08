import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";
import { DemoCall } from "@/types/campaign";
import { createDemoCall, initiateDemoCall } from "@/api/endpoints/calls";

interface DemoCallSectionProps {
  campaigns: Campaign[];
  onDemoCallCreated?: () => void; // Optional callback for when a demo call is created
}

export const DemoCallSection = ({
  campaigns,
  onDemoCallCreated,
}: DemoCallSectionProps) => {
  const { toast } = useToast();
  const [demoCall, setDemoCall] = useState<DemoCall>({
    customerName: "",
    phoneNumber: "",
    vehicleNumber: "ABC-123", // Default placeholder value
    serviceType: "Feedback Call", // Fixed value
    serviceAdvisorName: "John Smith", // Default placeholder value
    campaignId: "demo", // Always set to demo campaign
  });
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCallId, setCreatedCallId] = useState<string | null>(null);

  const handleInputChange = (field: keyof DemoCall, value: string) => {
    setDemoCall((prev) => ({ ...prev, [field]: value }));
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
        service_type: "Feedback Call", // Always use Feedback Call
        service_advisor_name: demoCall.serviceAdvisorName || undefined,
        // No need to send campaign_id or organization_id, they'll be handled by the backend
      });

      setCreatedCallId(createResponse.call_id);

      // Then initiate the call
      setIsCallInProgress(true);

      // Initiate the actual call
      await initiateDemoCall(createResponse.call_id);

      toast({
        title: "Demo call completed",
        description: "Call transcript is now available for review",
      });

      // Call the callback if provided
      if (onDemoCallCreated) {
        onDemoCallCreated();
      }
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

          <div>
            <Label htmlFor="demo-service-type" className="text-card-foreground">
              Service Type
            </Label>
            <Input
              id="demo-service-type"
              value="Feedback Call"
              readOnly
              className="mt-1 bg-muted text-muted-foreground"
            />
          </div>

          <div>
            <Label
              htmlFor="demo-service-advisor"
              className="text-card-foreground"
            >
              Service Advisor Name
            </Label>
            <Input
              id="demo-service-advisor"
              value={demoCall.serviceAdvisorName}
              onChange={(e) =>
                handleInputChange("serviceAdvisorName", e.target.value)
              }
              placeholder="John Smith"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleInitiateCall}
            disabled={
              isCallInProgress ||
              isCreating ||
              !demoCall.customerName ||
              !demoCall.phoneNumber
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
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
      </CardContent>
    </Card>
  );
};
