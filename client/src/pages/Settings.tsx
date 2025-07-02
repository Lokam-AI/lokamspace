
import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { OrganizationSettings } from "@/components/settings/OrganizationSettings";
import { ConfigurationSettings } from "@/components/settings/ConfigurationSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { MembersSettings } from "@/components/settings/MembersSettings";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("org-settings");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "org-settings":
        return <OrganizationSettings />;
      case "configuration":
        return <ConfigurationSettings />;
      case "billing":
        return <BillingSettings />;
      case "members":
        return <MembersSettings />;
      case "integrations":
        return <IntegrationsSettings />;
      case "profile":
        return <ProfileSettings />;
      default:
        return <OrganizationSettings />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 min-h-screen">
            <SettingsSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
            <main className="flex-1 p-8 bg-background">
              <div className="max-w-4xl mx-auto">
                {renderActiveSection()}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
