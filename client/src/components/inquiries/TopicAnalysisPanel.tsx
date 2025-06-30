
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export const TopicAnalysisPanel = () => {
  const topicData = [
    { topic: "Pricing Questions", count: 23, percentage: 45 },
    { topic: "Appointment Scheduling", count: 18, percentage: 35 },
    { topic: "Service Status", count: 12, percentage: 24 },
    { topic: "Warranty Claims", count: 8, percentage: 16 },
    { topic: "Technical Support", count: 6, percentage: 12 }
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Top Inquiry Topics
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="ghost" size="sm">Week</Button>
            <Button variant="ghost" size="sm">Month</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topicData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{item.topic}</span>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
