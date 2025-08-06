import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CitySearch } from "@/components/CitySearch";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from "@/api/endpoints/organizations";

export function OrganizationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    google_review_link: "",
    id: "",
    call_concurrency_limit: 1,
  });
  const [selectedCity, setSelectedCity] = useState<{
    value: string;
    label: string;
  } | null>(null);

  // Load organization data
  useEffect(() => {
    const loadOrgData = async () => {
      try {
        setLoading(true);
        const data = await getOrganizationSettings();
        setOrgData({
          name: data.name || "",
          email: data.email || "",
          google_review_link: data.google_review_link || "",
          id: data.id || "",
          call_concurrency_limit: data.call_concurrency_limit || 1,
        });

        // Set city if available
        if (data.location_value && data.location_city) {
          setSelectedCity({
            value: data.location_value,
            label: data.location_city,
          });
        } else if (data.location) {
          // Fallback to legacy location field
          setSelectedCity({
            value: data.location.toLowerCase().replace(/\s+/g, "-"),
            label: data.location,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load organization data:", error);
        toast({
          title: "Error",
          description: "Failed to load organization data. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadOrgData();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setOrgData((prev) => ({
      ...prev,
      [id.replace("org-", "")]: value,
    }));
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied to clipboard",
      description: "Organization ID has been copied to your clipboard.",
    });
  };

  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);

      await updateOrganizationSettings({
        name: orgData.name,
        email: orgData.email,
        location_city: selectedCity?.label,
        location_value: selectedCity?.value,
        google_review_link: orgData.google_review_link,
      });

      toast({
        title: "Configuration Saved",
        description: "Organization settings have been saved successfully.",
      });

      setSaving(false);
    } catch (error) {
      console.error("Failed to save organization settings:", error);
      toast({
        title: "Error",
        description: "Failed to save organization settings. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  const handleDeleteOrg = () => {
    if (deleteConfirmText === orgData.name) {
      toast({
        title: "Organization Deleted",
        description: "Your organization has been permanently deleted.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invalid confirmation",
        description:
          "Please type the exact organization name to confirm deletion.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading organization settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Organization Settings
        </h1>
        <p className="text-foreground-secondary mt-1">
          Your organization's basic information and system settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={orgData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-email">Organization Email</Label>
            <Input
              id="org-email"
              value={orgData.email}
              onChange={handleInputChange}
            />
          </div>

          <CitySearch
            label="Organization Location"
            onChange={setSelectedCity}
            placeholder="Search for a city..."
            defaultValue={selectedCity}
          />

          <div className="space-y-2">
            <Label htmlFor="google_review_link">Google Review Link</Label>
            <Input
              id="google_review_link"
              type="url"
              placeholder="https://g.page/your-business/review"
              value={orgData.google_review_link}
              onChange={handleInputChange}
            />
            <div className="text-sm text-foreground-secondary">
              Link to your Google Business profile for customer reviews.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-id">Organization ID</Label>
            <div className="flex space-x-2">
              <Input
                id="org-id"
                value={orgData.id}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyId(orgData.id)}
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
              value={orgData.call_concurrency_limit.toString()}
              readOnly
              className="bg-muted"
            />
            <div className="text-sm text-foreground-secondary">
              Maximum number of concurrent outbound calls allowed for this
              organization.
            </div>
          </div>

          <Button onClick={handleSaveConfiguration} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">
            Delete Organization
          </CardTitle>
          <CardDescription>
            Permanently remove your organization and all its contents. This
            action cannot be undone, so please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              To confirm, please type your organization name:{" "}
              <strong>{orgData.name}</strong>
            </Label>
            <Input
              placeholder="Enter organization name"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteOrg}
            disabled={deleteConfirmText !== orgData.name}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
