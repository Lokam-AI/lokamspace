import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Calendar,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { getScheduleConfig, updateScheduleConfig } from "@/api/endpoints/calls";

interface ScheduleConfig {
  start_time: string;
  end_time: string;
  active_days: string[];
  auto_call_enabled: boolean;
  timezone: string;
}

export const ScheduleSettings = () => {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialConfig: ScheduleConfig = {
    start_time: "09:00",
    end_time: "17:00",
    active_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    auto_call_enabled: true,
    timezone: "America/New_York",
  };

  const [scheduleConfig, setScheduleConfig] =
    useState<ScheduleConfig>(initialConfig);
  const [originalConfig, setOriginalConfig] =
    useState<ScheduleConfig>(initialConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const daysOfWeek = [
    { id: "monday", label: "Mon" },
    { id: "tuesday", label: "Tue" },
    { id: "wednesday", label: "Wed" },
    { id: "thursday", label: "Thu" },
    { id: "friday", label: "Fri" },
    { id: "saturday", label: "Sat" },
    { id: "sunday", label: "Sun" },
  ];

  const timezones = [
    // US Timezones
    { value: "America/New_York", label: "Eastern Time (EST/EDT)" },
    { value: "America/Chicago", label: "Central Time (CST/CDT)" },
    { value: "America/Denver", label: "Mountain Time (MST/MDT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PST/PDT)" },
    { value: "America/Phoenix", label: "Arizona Time (MST)" },
    { value: "America/Anchorage", label: "Alaska Time (AKST/AKDT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
    
    // UK Timezones
    { value: "Europe/London", label: "Greenwich Mean Time (GMT/BST)" },
    
    // Indian Timezones
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  ];

  // Fetch schedule config from API
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getScheduleConfig();
        console.log("Received config from API:", data);

        // Transform data to match our interface if necessary
        const config: ScheduleConfig = {
          start_time: data.start_time || "09:00",
          end_time: data.end_time || "17:00",
          active_days: Array.isArray(data.active_days)
            ? [...data.active_days]
            : ["monday", "tuesday", "wednesday", "thursday", "friday"],
          auto_call_enabled:
            data.auto_call_enabled !== undefined
              ? data.auto_call_enabled
              : true,
          timezone: data.timezone || "America/New_York",
        };

        console.log("Transformed config:", config);

        setScheduleConfig({ ...config });
        setOriginalConfig({ ...config }); // Create a deep copy to avoid reference issues
      } catch (err) {
        console.error("Failed to fetch schedule config:", err);
        setError(
          "Failed to load schedule configuration. Using default settings."
        );
        // Keep using default config
        toast({
          title: "Using Default Settings",
          description:
            "Could not load custom settings. Using default schedule configuration.",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [toast]);

  const handleRetryFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getScheduleConfig();
      console.log("Retry fetch - received data:", data);

      // Transform data to match our interface if necessary
      const config: ScheduleConfig = {
        start_time: data.start_time || "09:00",
        end_time: data.end_time || "17:00",
        active_days: Array.isArray(data.active_days)
          ? [...data.active_days]
          : ["monday", "tuesday", "wednesday", "thursday", "friday"],
        auto_call_enabled:
          data.auto_call_enabled !== undefined ? data.auto_call_enabled : true,
        timezone: data.timezone || "America/New_York",
      };

      console.log("Retry fetch - transformed config:", config);

      setScheduleConfig(config);
      setOriginalConfig({ ...config });

      toast({
        title: "Configuration Loaded",
        description: "Schedule configuration has been loaded successfully.",
      });
    } catch (err) {
      console.error("Failed to fetch schedule config:", err);
      setError(
        "Failed to load schedule configuration. Using default settings."
      );

      // Create a default config if we can't load one
      const defaultConfig = { ...initialConfig };
      setScheduleConfig(defaultConfig);
      setOriginalConfig({ ...defaultConfig });

      toast({
        title: "Error Loading Configuration",
        description:
          "Could not load schedule settings. Using defaults instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for changes whenever config updates
  useEffect(() => {
    const sortedOriginalDays = [...originalConfig.active_days].sort();
    const sortedCurrentDays = [...scheduleConfig.active_days].sort();

    const configsAreEqual =
      scheduleConfig.start_time === originalConfig.start_time &&
      scheduleConfig.end_time === originalConfig.end_time &&
      scheduleConfig.auto_call_enabled === originalConfig.auto_call_enabled &&
      scheduleConfig.timezone === originalConfig.timezone &&
      JSON.stringify(sortedCurrentDays) === JSON.stringify(sortedOriginalDays);

    setHasChanges(!configsAreEqual);
  }, [scheduleConfig, originalConfig]);

  const handleDayToggle = (dayId: string, checked: boolean) => {
    setScheduleConfig((prev) => {
      // Create a new array to avoid mutating the original
      const newActiveDays = checked
        ? [...prev.active_days, dayId]
        : prev.active_days.filter((day) => day !== dayId);

      return {
        ...prev,
        active_days: newActiveDays,
      };
    });
  };

  // Save configuration to API
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      console.log("Saving schedule config:", scheduleConfig);

      // Prepare data for API
      const configToSave = {
        start_time: scheduleConfig.start_time,
        end_time: scheduleConfig.end_time,
        timezone: scheduleConfig.timezone,
        active_days: scheduleConfig.active_days,
        auto_call_enabled: scheduleConfig.auto_call_enabled,
      };

      // Call API to update config
      const updatedConfig = await updateScheduleConfig(configToSave);
      console.log("Received updated config:", updatedConfig);

      // Update local state with server response
      setScheduleConfig({
        start_time: updatedConfig.start_time,
        end_time: updatedConfig.end_time,
        timezone: updatedConfig.timezone,
        active_days: updatedConfig.active_days,
        auto_call_enabled: updatedConfig.auto_call_enabled,
      });

      // Update original config to match current (for change detection)
      setOriginalConfig({ ...scheduleConfig });
      setHasChanges(false);

      toast({
        title: "Settings Saved",
        description: "Your call schedule settings have been updated.",
      });
    } catch (err) {
      console.error("Failed to save schedule config:", err);
      setError("Failed to save settings. Please try again.");
      toast({
        title: "Error Saving Settings",
        description: "Could not save your schedule configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Auto Call Switch - Always visible */}
      <CardContent className="pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-sm">Loading configuration...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Automatic Calling
              </Label>
              <p className="text-sm text-gray-600">
                Enable automatic calling for "Ready for Call" status during
                scheduled hours
              </p>
            </div>
            <Switch
              checked={scheduleConfig.auto_call_enabled}
              onCheckedChange={(checked) =>
                setScheduleConfig((prev) => ({
                  ...prev,
                  auto_call_enabled: checked,
                }))
              }
            />
          </div>
        )}
      </CardContent>

      {!isMinimized && (
        <CardContent className="space-y-6 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading configuration...</span>
            </div>
          ) : (
            <>
              {/* Timezone Selection */}
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={scheduleConfig.timezone}
                  onValueChange={(value) =>
                    setScheduleConfig((prev) => ({ ...prev, timezone: value }))
                  }
                >
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
                  <Label
                    htmlFor="start-time"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Start Time</span>
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={scheduleConfig.start_time}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        start_time: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="end-time"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="h-4 w-4" />
                    <span>End Time</span>
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={scheduleConfig.end_time}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        end_time: e.target.value,
                      }))
                    }
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
                        checked={scheduleConfig.active_days.includes(day.id)}
                        onCheckedChange={(checked) =>
                          handleDayToggle(day.id, !!checked)
                        }
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
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Schedule Information
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Calls will be automatically initiated for customers with
                      "Ready for Call" status during the specified time window
                      on selected days. Current timezone:{" "}
                      {timezones.find(
                        (tz) => tz.value === scheduleConfig.timezone
                      )?.label || scheduleConfig.timezone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className={
                    hasChanges
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryFetch}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <Loader2
                        className={`h-3 w-3 mr-2 ${
                          isLoading ? "animate-spin" : "hidden"
                        }`}
                      />
                      {isLoading ? "Retrying..." : "Try Again"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};
