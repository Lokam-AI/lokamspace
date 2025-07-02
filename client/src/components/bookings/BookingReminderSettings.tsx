
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, MessageSquare, Save } from "lucide-react";

interface ReminderConfig {
  id: string;
  interval: number;
  intervalType: 'hours' | 'days' | 'weeks';
  enabled: boolean;
  messageTemplate: string;
  label: string;
}

interface BookingReminderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingReminderSettings = ({ isOpen, onClose }: BookingReminderSettingsProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [reminderConfigs, setReminderConfigs] = useState<ReminderConfig[]>([
    {
      id: '1',
      interval: 1,
      intervalType: 'weeks',
      enabled: true,
      label: '1 Week Before',
      messageTemplate: 'Hi [Customer Name], this is a reminder about your upcoming [Service] appointment scheduled for [Date] at [Time]. Please confirm or call us if you need to reschedule.'
    },
    {
      id: '2',
      interval: 1,
      intervalType: 'days',
      enabled: true,
      label: '1 Day Before',
      messageTemplate: 'Hi [Customer Name], your [Service] appointment is tomorrow at [Time]. Please reply to confirm or call us if you need to reschedule.'
    },
    {
      id: '3',
      interval: 4,
      intervalType: 'hours',
      enabled: false,
      label: '4 Hours Before',
      messageTemplate: 'Hi [Customer Name], your [Service] appointment is in 4 hours at [Time]. See you soon!'
    },
    {
      id: '4',
      interval: 1,
      intervalType: 'hours',
      enabled: false,
      label: '1 Hour Before',
      messageTemplate: 'Hi [Customer Name], your [Service] appointment is in 1 hour at [Time]. Please head over when ready.'
    }
  ]);

  const handleToggleReminder = (id: string, enabled: boolean) => {
    setReminderConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, enabled } : config
      )
    );
  };

  const handleUpdateTemplate = (id: string, messageTemplate: string) => {
    setReminderConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, messageTemplate } : config
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    
    toast({
      title: "Settings Saved",
      description: "Reminder configuration has been updated successfully.",
    });
    
    onClose();
  };

  const getIntervalText = (config: ReminderConfig) => {
    const { interval, intervalType } = config;
    return `${interval} ${intervalType.slice(0, -1)}${interval > 1 ? 's' : ''} before`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Reminder Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Configure automated reminders to be sent to customers before their appointments.
          </div>

          <div className="space-y-4">
            {reminderConfigs.map((config) => (
              <Card key={config.id} className={`border ${config.enabled ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {config.label}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`reminder-${config.id}`} className="text-sm">
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id={`reminder-${config.id}`}
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleReminder(config.id, enabled)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send reminder {getIntervalText(config)}
                  </p>
                </CardHeader>
                
                {config.enabled && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Message Template</Label>
                      <Textarea
                        value={config.messageTemplate}
                        onChange={(e) => handleUpdateTemplate(config.id, e.target.value)}
                        rows={3}
                        className="resize-none text-sm"
                        placeholder="Enter reminder message template..."
                      />
                      <div className="text-xs text-muted-foreground">
                        Available placeholders: [Customer Name], [Date], [Time], [Service], [Location]
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-300">Preview</p>
                  <p className="text-amber-700 dark:text-amber-400 mt-1">
                    For John Smith's Oil Change appointment on Dec 15, 2024 at 10:00 AM:
                  </p>
                  <p className="text-amber-600 dark:text-amber-500 mt-2 italic">
                    "Hi John Smith, this is a reminder about your upcoming Oil Change appointment scheduled for Dec 15, 2024 at 10:00 AM. Please confirm or call us if you need to reschedule."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
