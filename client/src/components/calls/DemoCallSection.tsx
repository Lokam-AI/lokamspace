import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Loader2,
  Calendar,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";
import { DemoCall } from "@/types/campaign";
import {
  createDemoCall,
  initiateDemoCall,
  getCallDetails,
} from "@/api/endpoints/calls";

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
    serviceType: "Oil Change", // Changed from "Feedback Call" to "Oil Change"
    serviceAdvisorName: "John Smith", // Default placeholder value
    campaignId: "demo", // Always set to demo campaign
    appointmentDate: new Date().toISOString().split("T")[0], // Default to today's date in YYYY-MM-DD format
  });
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCallId, setCreatedCallId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Clean up polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  // Poll for call status updates
  const startStatusPolling = (callId: string) => {
    // Clear any existing polling
    if (pollingInterval) clearInterval(pollingInterval);

    const interval = setInterval(async () => {
      try {
        const callDetails = await getCallDetails(callId);
        setCallStatus(callDetails.status);

        // If the call is completed or failed, stop polling
        if (
          callDetails.status === "Completed" ||
          callDetails.status === "Failed"
        ) {
          clearInterval(interval);
          setPollingInterval(null);
          setIsCallInProgress(false);

          // Show appropriate toast
          if (callDetails.status === "Completed") {
            toast({
              title: "Demo call completed",
              description: "Call transcript is now available for review",
              variant: "default",
            });
          } else {
            toast({
              title: "Call failed",
              description: "There was a problem with the demo call",
              variant: "destructive",
            });
          }

          // Refresh the calls list
          if (onDemoCallCreated) {
            onDemoCallCreated();
          }
        }
      } catch (error) {
        console.error("Error polling call status:", error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  };

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
        service_type: demoCall.serviceType || "Oil Change", // Use the service type from state or default to "Oil Change"
        service_advisor_name: demoCall.serviceAdvisorName || undefined,
        appointment_date: demoCall.appointmentDate || undefined, // Include appointment date
        // No need to send campaign_id or organization_id, they'll be handled by the backend
      });

      const callId = createResponse.call_id.toString();
      setCreatedCallId(callId);
      setCallStatus("Ready");

      toast({
        title: "Demo call created",
        description: "Call created with Ready status",
      });

      // Refresh the calls list immediately after creating the call
      if (onDemoCallCreated) {
        onDemoCallCreated();
      }

      // Then initiate the call
      setIsCallInProgress(true);

      // Initiate the actual call
      await initiateDemoCall(callId);

      // Start polling for status updates
      setCallStatus("In Progress");
      startStatusPolling(callId);

      toast({
        title: "Demo call initiated",
        description: "Call is now in progress",
      });

      // Refresh the calls list again after initiating the call
      if (onDemoCallCreated) {
        onDemoCallCreated();
      }

      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create or initiate demo call:", err);
      toast({
        title: "Call Failed",
        description: "There was a problem creating or initiating the demo call",
        variant: "destructive",
      });
      setIsCreating(false);
      setIsCallInProgress(false);
      // Still call the callback so the list refreshes with the failed call
      if (onDemoCallCreated) {
        onDemoCallCreated();
      }
    }
  };

  // Reset function to clear the state and allow starting a new demo call
  const handleReset = () => {
    // Reset all state variables
    setCallStatus(null);
    setCreatedCallId(null);
    setIsCallInProgress(false);
    setIsCreating(false);

    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    // Optionally reset the form fields or keep them for convenience
    // Uncomment the following line if you want to clear the form fields too
    // setDemoCall({
    //   customerName: "",
    //   phoneNumber: "",
    //   vehicleNumber: "ABC-123",
    //   serviceType: "Oil Change",
    //   serviceAdvisorName: "John Smith",
    //   campaignId: "demo",
    //   appointmentDate: new Date().toISOString().split("T")[0],
    // });

    toast({
      title: "Demo call reset",
      description: "You can now initiate a new demo call",
    });
  };

  const renderCallStatus = () => {
    if (!callStatus) return null;

    switch (callStatus) {
      case "Ready":
        return (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-2">
            <Phone className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">
                Call Ready
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Call has been created and is ready to initiate
              </p>
            </div>
          </div>
        );
      case "In Progress":
        return (
          <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mt-2">
            <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-300">
                Call In Progress
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Your demo call is currently active
              </p>
            </div>
          </div>
        );
      case "Completed":
        return (
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mt-2">
            <Check className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-300">
                Call Completed
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Demo call has finished successfully
              </p>
            </div>
          </div>
        );
      case "Failed":
        return (
          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mt-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                Call Failed
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                There was an issue with the demo call
              </p>
            </div>
          </div>
        );
      default:
        return null;
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
        {renderCallStatus()}

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
              disabled={isCreating}
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
              disabled={isCreating}
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
              disabled={isCreating}
            />
          </div>

          <div>
            <Label
              htmlFor="demo-appointment-date"
              className="text-card-foreground"
            >
              Appointment Date
            </Label>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                id="demo-appointment-date"
                type="date"
                value={demoCall.appointmentDate}
                onChange={(e) =>
                  handleInputChange("appointmentDate", e.target.value)
                }
                className="mt-0"
                disabled={isCreating}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="demo-service-type" className="text-card-foreground">
              Service Type
            </Label>
            <Input
              id="demo-service-type"
              value={demoCall.serviceType}
              onChange={(e) => handleInputChange("serviceType", e.target.value)}
              className="mt-1"
              disabled={isCreating}
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
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          {callStatus === "Completed" || callStatus === "Failed" ? (
            <Button
              onClick={handleReset}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Demo Call
            </Button>
          ) : (
            <Button
              onClick={handleInitiateCall}
              disabled={
                isCreating || !demoCall.customerName || !demoCall.phoneNumber
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : isCallInProgress ? (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Initiate Another Call
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Initiate Demo Call
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
