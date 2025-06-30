
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Phone, Car, Clock, Target } from "lucide-react";
import { Call } from "@/pages/Calls";
import { CallTranscriptChat } from "@/components/dashboard/CallTranscriptChat";
import { GoogleReviewButton } from "@/components/dashboard/GoogleReviewButton";

interface CallDetailPanelProps {
  call: Call;
  isOpen: boolean;
  onClose: () => void;
}

export const CallDetailPanel = ({ call, isOpen, onClose }: CallDetailPanelProps) => {
  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getNPSBadgeVariant = (score: number) => {
    if (score >= 9) return 'default';
    if (score >= 7) return 'secondary';
    return 'destructive';
  };

  const getNPSLabel = (score: number) => {
    if (score >= 9) return 'Promoter';
    if (score >= 7) return 'Passive';
    return 'Detractor';
  };

  // Enhanced call data with additional fields
  const enhancedCall = {
    ...call,
    serviceType: "Brake Service & Inspection",
    callDuration: "4:32",
    attemptCount: 1,
    customerEmail: "john.smith@email.com",
    customerPhone: "+1 (555) 123-4567",
    overallFeedback: "Customer expressed high satisfaction with the brake service. Appreciated the thorough explanation of the work performed and felt the pricing was fair. Would definitely recommend the service to others and plans to return for future maintenance.",
    positiveTags: ["excellent-service", "professional-staff", "fair-pricing", "thorough-explanation"],
    detractorTags: []
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Feedback Call Details</span>
          </SheetTitle>
          <SheetDescription>
            Comprehensive details about the feedback call with {call.customerName}
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
                    <p className="font-medium">{enhancedCall.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Vehicle:</span>
                    <p className="font-medium">{enhancedCall.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Service Type:</span>
                    <p className="font-medium">{enhancedCall.serviceType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Service Advisor:</span>
                    <p className="font-medium">{enhancedCall.serviceAdvisor}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Call Time:</span>
                    <p className="font-medium">{formatDateTime(call.callDateTime!)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{enhancedCall.overallFeedback}</p>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          {call.npsScore && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-gray-900">{call.npsScore}/10</div>
                    <Badge variant={getNPSBadgeVariant(call.npsScore)} className="px-3 py-1">
                      {getNPSLabel(call.npsScore)}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < call.npsScore ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Customer rated their satisfaction as {call.npsScore} out of 10
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call Transcript */}
          {call.transcript && (
            <CallTranscriptChat transcript={call.transcript} audioUrl={call.audioUrl} />
          )}

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enhancedCall.positiveTags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Positive Mentions</h4>
                    <div className="flex flex-wrap gap-2">
                      {enhancedCall.positiveTags.map((tag) => (
                        <Badge key={tag} variant="default" className="bg-green-100 text-green-800">
                          {tag.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {enhancedCall.detractorTags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">Areas for Improvement</h4>
                    <div className="flex flex-wrap gap-2">
                      {enhancedCall.detractorTags.map((tag) => (
                        <Badge key={tag} variant="destructive" className="bg-red-100 text-red-800">
                          {tag.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {enhancedCall.positiveTags.length === 0 && enhancedCall.detractorTags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags available for this call.</p>
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
                    <span className="text-sm font-medium text-blue-800">Call Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{enhancedCall.callDuration}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Attempts</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{enhancedCall.attemptCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Review Request */}
          <GoogleReviewButton 
            customerName={enhancedCall.customerName}
            customerEmail={enhancedCall.customerEmail}
            customerPhone={enhancedCall.customerPhone}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
