
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Play } from "lucide-react";
import { useState } from "react";

export const CallsTable = () => {
  const [selectedCall, setSelectedCall] = useState<any>(null);

  const calls = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      vehicleNumber: "ABC-123",
      serviceAdvisor: "Mike Torres",
      serviceDetail: "Oil Change & Inspection",
      callDate: "2024-01-15",
      callTime: "2:30 PM",
      npsScore: 9,
      status: "completed",
      overallFeedback: "Very satisfied with the quick service and professional staff. The waiting area was clean and comfortable.",
      positiveMentions: ["Quick service", "Professional staff", "Clean facilities", "Fair pricing"],
      areasToImprove: ["Could use more parking spaces"],
      actionItems: ["Follow up on parking feedback", "Share positive feedback with team"]
    },
    {
      id: 2,
      customerName: "Robert Chen",
      vehicleNumber: "XYZ-789",
      serviceAdvisor: "Lisa Park",
      serviceDetail: "Brake Replacement",
      callDate: "2024-01-15",
      callTime: "11:45 AM",
      npsScore: 4,
      status: "completed",
      overallFeedback: "Service took longer than expected and communication could have been better about delays.",
      positiveMentions: ["Quality of work", "Final result was good"],
      areasToImprove: ["Communication about delays", "Service timeline accuracy", "Update frequency"],
      actionItems: ["Implement better delay communication system", "Contact customer to address concerns", "Review service time estimates"]
    },
    {
      id: 3,
      customerName: "Maria Garcia",
      vehicleNumber: "DEF-456",
      serviceAdvisor: "John Davis",
      serviceDetail: "Tire Rotation",
      callDate: "2024-01-14",
      callTime: "4:15 PM",
      npsScore: 8,
      status: "completed",
      overallFeedback: "Good service overall, staff was friendly and explained everything clearly.",
      positiveMentions: ["Friendly staff", "Clear explanations", "Reasonable price", "Quick completion"],
      areasToImprove: ["Waiting area comfort", "Appointment scheduling flexibility"],
      actionItems: ["Consider waiting area improvements", "Review appointment booking system"]
    },
    {
      id: 4,
      customerName: "David Smith",
      vehicleNumber: "GHI-101",
      serviceAdvisor: "Emma Wilson",
      serviceDetail: "Engine Diagnostic",
      callDate: "2024-01-14",
      callTime: "1:20 PM",
      npsScore: 7,
      status: "completed",
      overallFeedback: "Thorough diagnostic work, though the process took a bit longer than anticipated.",
      positiveMentions: ["Thorough diagnosis", "Detailed explanation", "Expert knowledge"],
      areasToImprove: ["Time management", "Progress updates"],
      actionItems: ["Improve diagnostic time estimates", "Enhance customer communication during service"]
    },
    {
      id: 5,
      customerName: "Jennifer Lee",
      vehicleNumber: "JKL-202",
      serviceAdvisor: "Mike Torres",
      serviceDetail: "AC Repair",
      callDate: "2024-01-13",
      callTime: "10:30 AM",
      npsScore: 6,
      status: "completed",
      overallFeedback: "AC is working better now, but the repair cost was higher than initially quoted.",
      positiveMentions: ["Problem was fixed", "Staff was polite"],
      areasToImprove: ["Pricing transparency", "Initial quote accuracy"],
      actionItems: ["Review pricing communication process", "Improve initial assessment accuracy"]
    }
  ];

  const getNPSBadgeColor = (score: number) => {
    if (score >= 9) return "bg-primary/10 text-primary";
    if (score >= 7) return "bg-secondary/10 text-secondary-foreground";
    return "bg-destructive/10 text-destructive";
  };

  const getNPSCategory = (score: number) => {
    if (score >= 9) return "Promoter";
    if (score >= 7) return "Passive";
    return "Detractor";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-foreground">Recent Completed Calls</CardTitle>
          <Button variant="outline" size="sm">
            View All Calls
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Service Advisor</th>
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Service</th>
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary">NPS Score</th>
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary"></th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-foreground">{call.customerName}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm bg-muted text-foreground px-2 py-1 rounded">
                      {call.vehicleNumber}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-foreground-secondary">{call.serviceAdvisor}</td>
                  <td className="py-4 px-4 text-foreground-secondary">{call.serviceDetail}</td>
                  <td className="py-4 px-4 text-foreground-secondary">
                    <div className="text-sm">
                      <div>{call.callDate}</div>
                      <div className="text-muted-foreground">{call.callTime}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-foreground">{call.npsScore}</span>
                      <Badge className={`text-xs ${getNPSBadgeColor(call.npsScore)}`}>
                        {getNPSCategory(call.npsScore)}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Call Details - {call.customerName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Customer</h4>
                              <p className="text-foreground-secondary">{call.customerName}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">NPS Score</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-foreground">{call.npsScore}</span>
                                <Badge className={`text-xs ${getNPSBadgeColor(call.npsScore)}`}>
                                  {getNPSCategory(call.npsScore)}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Service</h4>
                              <p className="text-foreground-secondary">{call.serviceDetail}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Service Advisor</h4>
                              <p className="text-foreground-secondary">{call.serviceAdvisor}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Overall Feedback</h4>
                            <p className="text-foreground-secondary bg-muted p-3 rounded-lg">{call.overallFeedback}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Positive Mentions</h4>
                            <div className="flex flex-wrap gap-2">
                              {call.positiveMentions.map((mention, index) => (
                                <Badge key={index} className="bg-primary/10 text-primary">
                                  {mention}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Areas to Improve</h4>
                            <div className="flex flex-wrap gap-2">
                              {call.areasToImprove.map((area, index) => (
                                <Badge key={index} className="bg-warning/10 text-warning">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Action Items</h4>
                            <ul className="space-y-1">
                              {call.actionItems.map((item, index) => (
                                <li key={index} className="text-foreground-secondary flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-foreground-secondary">
            Showing 5 of 1,089 completed calls
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
