import { useState, useEffect } from "react";
import { Settings, CreditCard, Users, Plug, User, Cog } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrganizationSettings, Organization } from "@/api/endpoints/organizations";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const orgSettingsItems = [
  { id: "org-settings", title: "Org Settings", icon: Settings },
  { id: "configuration", title: "Configuration", icon: Cog },
  {
    id: "billing",
    title: "Billing & Add-Ons",
    icon: CreditCard,
  },
  { id: "members", title: "Members", icon: Users },
  { id: "integrations", title: "Integrations", icon: Plug, disabled: true },
];

const accountSettingsItems = [{ id: "profile", title: "Profile", icon: User }];

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Fetch organization details when user is available
  useEffect(() => {
    if (user && user.organization_id) {
      getOrganizationSettings()
        .then((orgData) => {
          setOrganization(orgData);
        })
        .catch((error) => {
          console.error('Failed to fetch organization:', error);
        });
    }
  }, [user]);
  return (
    <div className="w-80 border-r border-border bg-background p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="h-5 w-5 text-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>
        <div className="flex items-center text-sm text-foreground-secondary">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-medium text-foreground">
              {organization?.name ? organization.name.charAt(0).toUpperCase() : "O"}
            </span>
          </div>
          {organization?.name || "Organization"}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-3">
            ORG SETTINGS
          </h3>
          <div className="space-y-1">
            {orgSettingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-3">
            ACCOUNT SETTINGS
          </h3>
          <div className="space-y-1">
            {accountSettingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
