
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, Save, ChevronDown, ChevronUp } from "lucide-react";

interface ScheduleConfig {
  startTime: string;
  endTime: string;
  activeDays: string[];
  autoCallEnabled: boolean;
  timezone: string;
}

export const ScheduleSettings = () => {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const initialConfig: ScheduleConfig = {
    startTime: "09:00",
    endTime: "17:00",
    activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    autoCallEnabled: true,
    timezone: "America/New_York"
  };

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(initialConfig);
  const [originalConfig, setOriginalConfig] = useState<ScheduleConfig>(initialConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (EST/EDT)" },
    { value: "America/Chicago", label: "Central Time (CST/CDT)" },
    { value: "America/Denver", label: "Mountain Time (MST/MDT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PST/PDT)" },
    { value: "America/Phoenix", label: "Arizona Time (MST)" },
    { value: "America/Anchorage", label: "Alaska Time (AKST/AKDT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" }
  ];

  // Check for changes whenever config updates
  useEffect(() => {
    const configsAreEqual = (
      scheduleConfig.startTime === originalConfig.startTime &&
      scheduleConfig.endTime === originalConfig.endTime &&
      scheduleConfig.autoCallEnabled === originalConfig.autoCallEnabled &&
      scheduleConfig.timezone === originalConfig.timezone &&
      JSON.stringify(scheduleConfig.activeDays.sort()) === JSON.stringify(originalConfig.activeDays.sort())
    );
    
    setHasChanges(!configsAreEqual);
  }, [scheduleConfig, originalConfig]);

  const handleDayToggle = (dayId: string, checked: boolean) => {
    setScheduleConfig(prev => ({
      ...prev,
      activeDays: checked 
        ? [...prev.activeDays, dayId]
        : prev.activeDays.filter(day => day !== dayId)
    }));
  };

  const handleSaveSchedule = () => {
    if (!hasChanges) {
      toast({
        title: "No Changes Detected",
        description: "The schedule configuration has not been modified.",
        variant: "default"
      });
      return;
    }

    setOriginalConfig({ ...scheduleConfig });
    setHasChanges(false);
    
    toast({
      title: "Schedule Updated",
      description: "Call schedule settings have been saved successfully.",
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Call Schedule Configuration</span>
            {hasChanges && (
              <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                Unsaved Changes
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="space-y-6">
          {/* Auto Call Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Automatic Calling</Label>
              <p className="text-sm text-gray-600">
                Enable automatic calling for "Ready for Call" status during scheduled hours
              </p>
            </div>
            <Switch
              checked={scheduleConfig.autoCallEnabled}
              onCheckedChange={(checked) => 
                setScheduleConfig(prev => ({ ...prev, autoCallEnabled: checked }))
              }
            />
          </div>

          {/* Timezone Selection */}
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={scheduleConfig.timezone} onValueChange={(value) => 
              setScheduleConfig(prev => ({ ...prev, timezone: value }))
            }>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Start Time</span>
              </Label>
              <Input
                id="start-time"
                type="time"
                value={scheduleConfig.startTime}
                onChange={(e) => setScheduleConfig(prev => ({ 
                  ...prev, 
                  startTime: e.target.value 
                }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="end-time" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>End Time</span>
              </Label>
              <Input
                id="end-time"
                type="time"
                value={scheduleConfig.endTime}
                onChange={(e) => setScheduleConfig(prev => ({ 
                  ...prev, 
                  endTime: e.target.value 
                }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Active Days */}
          <div className="space-y-3">
            <Label>Active Days</Label>
            <div className="flex flex-wrap gap-4">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={scheduleConfig.activeDays.includes(day.id)}
                    onCheckedChange={(checked) => handleDayToggle(day.id, !!checked)}
                  />
                  <Label htmlFor={day.id} className="text-sm font-medium">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Schedule Information</p>
                <p className="text-sm text-blue-700 mt-1">
                  Calls will be automatically initiated for customers with "Ready for Call" status during the specified time window on selected days. 
                  Current timezone: {timezones.find(tz => tz.value === scheduleConfig.timezone)?.label || scheduleConfig.timezone}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSchedule} 
              disabled={!hasChanges}
              className={hasChanges ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}
            >
              <Save className="h-4 w-4 mr-2" />
              {hasChanges ? "Save Schedule" : "No Changes to Save"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
