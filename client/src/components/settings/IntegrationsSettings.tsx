
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const integrations = [
  {
    name: "Google Calendar",
    description: "Sync your feedback calls and bookings with Google Calendar",
    icon: "📅",
    status: "disconnected",
    color: "bg-blue-500"
  },
  {
    name: "Outlook Calendar",
    description: "Sync your feedback calls and bookings with Outlook Calendar",
    icon: "📆",
    status: "disconnected",
    color: "bg-blue-600"
  }
];

export function IntegrationsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-foreground-secondary mt-1">Connect your favorite tools and services to streamline your workflow.</p>
      </div>

      <div className="grid gap-6">
        {integrations.map((integration, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center text-white`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                    {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                  </Badge>
                  <Button 
                    variant={integration.status === 'connected' ? 'destructive' : 'default'}
                    className={integration.status === 'connected' ? '' : 'bg-primary hover:bg-primary-hover'}
                  >
                    {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {integration.status === 'connected' && (
              <CardContent>
                <div className="text-sm text-foreground-secondary">
                  Last synced: 2 hours ago
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>Configure how integrations behave with your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Auto-sync new bookings</div>
              <div className="text-sm text-foreground-secondary">Automatically create calendar events for new bookings</div>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Sync feedback call results</div>
              <div className="text-sm text-foreground-secondary">Update calendar events with call outcomes and notes</div>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
