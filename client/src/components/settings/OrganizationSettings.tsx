
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OrganizationSettings() {
  const { toast } = useToast();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied to clipboard",
      description: "Organization ID has been copied to your clipboard.",
    });
  };

  const handleSaveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: "Organization settings have been saved successfully.",
    });
  };

  const handleDeleteOrg = () => {
    if (deleteConfirmText === "raoof@lokam.ai's Org") {
      toast({
        title: "Organization Deleted",
        description: "Your organization has been permanently deleted.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invalid confirmation",
        description: "Please type the exact organization name to confirm deletion.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>
        <p className="text-foreground-secondary mt-1">Your organization's basic information and system settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input id="org-name" defaultValue="raoof@lokam.ai's Org" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-email">Organization Email</Label>
            <Input id="org-email" defaultValue="raoof@lokam.ai" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-agent-number">Customer Feedback Agent Number</Label>
            <Input 
              id="feedback-agent-number" 
              type="tel" 
              placeholder="+1 (555) 123-4567"
            />
            <div className="text-sm text-foreground-secondary">
              Phone number for the AI agent handling customer feedback calls.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-agent-number">Booking Agent Number</Label>
            <Input 
              id="booking-agent-number" 
              type="tel" 
              placeholder="+1 (555) 123-4568"
            />
            <div className="text-sm text-foreground-secondary">
              Phone number for the AI agent handling appointment bookings.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiry-agent-number">Inquiry Agent Number</Label>
            <Input 
              id="inquiry-agent-number" 
              type="tel" 
              placeholder="+1 (555) 123-4569"
            />
            <div className="text-sm text-foreground-secondary">
              Phone number for the AI agent handling general inquiries.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-id">Organization ID</Label>
            <div className="flex space-x-2">
              <Input
                id="org-id"
                value="79cad7e1-c048-45c5-af26-6228d06ad29a"
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyId("79cad7e1-c048-45c5-af26-6228d06ad29a")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="call-limit">Call Concurrency Limit</Label>
            <Input 
              id="call-limit" 
              type="number" 
              value="10" 
              readOnly 
              className="bg-muted"
            />
            <div className="text-sm text-foreground-secondary">
              Maximum number of concurrent outbound calls allowed for this organization.
            </div>
          </div>

          <Button onClick={handleSaveConfiguration}>Save Configuration</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Organization</CardTitle>
          <CardDescription>
            Permanently remove your organization and all its contents. This action cannot be undone, so please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>To confirm, please type your organization name: <strong>raoof@lokam.ai's Org</strong></Label>
            <Input
              placeholder="Enter organization name"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteOrg}
            disabled={deleteConfirmText !== "raoof@lokam.ai's Org"}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
