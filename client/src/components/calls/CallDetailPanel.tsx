import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  User,
  Phone,
  Car,
  Clock,
  Target,
  DollarSign,
} from "lucide-react";
import { Call } from "@/pages/Calls";
import { CallTranscriptChat } from "@/components/dashboard/CallTranscriptChat";
import { GoogleReviewButton } from "@/components/dashboard/GoogleReviewButton";
import { getCallDetails } from "@/api/endpoints/calls";
import { Skeleton } from "@/components/ui/skeleton";

import { format } from "date-fns";

interface CallDetailPanelProps {
  call: Call;
  isOpen: boolean;
  onClose: () => void;
}

export const CallDetailPanel = ({
  call,
  isOpen,
  onClose,
}: CallDetailPanelProps) => {
  const [detailedCall, setDetailedCall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && call?.id) {
      setIsLoading(true);
      setError(null);
      getCallDetails(call.id)
        .then((data) => {
          setDetailedCall(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError("Failed to load call details");
          setIsLoading(false);
        });
    }
  }, [isOpen, call?.id]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Feedback Call Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Feedback Call Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6 text-red-500">{error}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Use detailedCall data
  const data = detailedCall;

  // Format date and time separately for better display
  const formatDate = (dateTime: string | Date | null) => {
    if (!dateTime) return "N/A";
    return format(new Date(dateTime), "PPP"); // Just the date part: Oct 3, 2023
  };

  const formatTime = (dateTime: string | Date | null) => {
    if (!dateTime) return "N/A";
    return format(new Date(dateTime), "p"); // Just the time part: 12:34 PM
  };

  const getNPSBadgeVariant = (score: number | null) => {
    if (score === null) return "secondary";
    if (score >= 9) return "default";
    if (score >= 7) return "secondary";
    return "destructive";
  };

  const getNPSLabel = (score: number | null) => {
    if (score === null) return "Not Rated";
    if (score >= 9) return "Promoter";
    if (score >= 7) return "Passive";
    return "Detractor";
  };

  const callDuration = data.call_duration || "N/A";
  const callCost = data.cost ? `$${parseFloat(data.cost).toFixed(2)}` : "N/A";
  const customerEmail = data.customer_email || "N/A";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Feedback Call Details</span>
          </SheetTitle>
          <SheetDescription>
            Comprehensive details about the feedback call with{" "}
            {data.customer_name || "N/A"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">{data.customer_name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Vehicle:</span>
                    <p className="font-medium">{data.vehicle_info || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Service Type:</span>
                    <p className="font-medium">{data.service_type || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">
                      Service Advisor:
                    </span>
                    <p className="font-medium">
                      {data.service_advisor_name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Improved Call Time display */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Call Time:</span>
                    <div className="font-medium flex flex-col">
                      <span>{formatDate(data.start_time)}</span>
                      <span className="text-sm text-gray-500">
                        {formatTime(data.start_time)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Added Appointment Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">
                      Appointment Date:
                    </span>
                    <p className="font-medium">
                      {data.appointment_date
                        ? formatDate(data.appointment_date)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {data.nps_score !== null ? `${data.nps_score}/10` : "N/A"}
                  </div>
                  <Badge
                    variant={getNPSBadgeVariant(data.nps_score)}
                    className="px-3 py-1"
                  >
                    {getNPSLabel(data.nps_score)}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < (data.nps_score || 0)
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Customer rated their satisfaction as{" "}
                {data.nps_score !== null
                  ? `${data.nps_score} out of 10`
                  : "Not rated"}
              </div>
            </CardContent>
          </Card>

          {/* Call Transcript */}
          <CallTranscriptChat
            transcript={data.transcript || []}
            audioUrl={data.recording_url || ""}
          />

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Use the new tags object format */}
                {data.tags?.positives?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      Positive Mentions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.positives.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          {tag.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.tags?.negatives?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">
                      Areas for Improvement
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.negatives.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="destructive"
                          className="bg-red-100 text-red-800"
                        >
                          {tag.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(!data.tags?.positives || data.tags.positives.length === 0) &&
                  (!data.tags?.negatives ||
                    data.tags.negatives.length === 0) && (
                    <p className="text-sm text-gray-500">
                      No tags available for this call.
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* KPI Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KPI Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Call Duration
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {callDuration}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Cost
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {callCost}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Review Request */}
          <GoogleReviewButton
            customerName={data.customer_name || ""}
            customerEmail={customerEmail}
            customerPhone={data.customer_number || ""}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
