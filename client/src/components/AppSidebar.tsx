
import { useState, useEffect } from "react";
import { LayoutDashboard, Phone, Calendar, MessageSquare, Settings, User, LogOut, HelpCircle, Palette, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { getOrganizationSettings, Organization } from "@/api/endpoints/organizations";
import { useAuth } from "@/contexts/AuthContext";
import FullLogo from "../../assets/LOKAM_PRIMARY_FULL_LOGO_BLACK.svg";
import SecondaryLogo from "../../assets/LOKAM_SECONDARY_LOGO_BLACK.svg";

const primaryNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Feedback Calls",
    url: "/calls",
    icon: Phone
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Calendar
  },
  {
    title: "Inquiries",
    url: "/inquiries",
    icon: MessageSquare
  }
];

const secondaryNavItems = [
  {
    title: "Metrics",
    url: "/metrics",
    icon: BarChart3
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  const isActive = (path: string) => currentPath === path;

  // Fetch organization details when user is available
  useEffect(() => {
    if (user && user.organization_id) {
      setLoadingOrg(true);
      getOrganizationSettings()
        .then((orgData) => {
          setOrganization(orgData);
        })
        .catch((error) => {
          console.error('Failed to fetch organization:', error);
        })
        .finally(() => {
          setLoadingOrg(false);
        });
    }
  }, [user]);

  return (
    <Sidebar collapsible="icon" className="w-64 group-data-[collapsible=icon]:w-16 border-r border-border">
      {/* Section 1: Brand & Controls */}
      <SidebarHeader className="border-b border-border">
        <div className={`flex flex-col space-y-3 ${collapsed ? 'p-2' : 'p-4'}`}>
          {/* Logo and Brand */}
          <div className={`flex ${collapsed ? 'justify-center' : 'justify-start'} items-center w-full`}>
            {collapsed ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={SecondaryLogo} alt="Lokam Logo" className="h-8 w-8" />
              </div>
            ) : (
              <img src={FullLogo} alt="Lokam Logo" className="h-7 max-w-full" style={{ objectFit: 'contain', objectPosition: 'left' }} />
            )}
          </div>
          
          {/* Organization Name */}
          {!collapsed && (
            <div className="text-sm text-foreground-secondary truncate">
              {loadingOrg ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                organization?.name || "Organization"
              )}
            </div>
          )}
          
          {/* Trigger Button */}
          <div className={`flex ${collapsed ? 'justify-center' : 'justify-start'}`}>
            <SidebarTrigger className="h-7 w-7 flex-shrink-0" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className={`${collapsed ? 'px-2' : 'px-4'}`}>
        {/* Section 2: Primary Navigation */}
        <div className="pt-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                      className={`w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
                    >
                      <NavLink 
                        to={item.url}
                        onClick={(e) => {
                          // Don't prevent navigation, just ensure it doesn't auto-expand
                          e.stopPropagation();
                        }}
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}
                      >
                        {collapsed ? (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <item.icon className="h-4 w-4" />
                          </div>
                        ) : (
                          <>
                            <item.icon className="h-4 w-4" />
                            <span className="ml-2">{item.title}</span>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Separator */}
        <SidebarSeparator className="my-4" />

        {/* Section 3: Secondary Navigation */}
        <div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                      className={`w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
                    >
                      <NavLink 
                        to={item.url}
                        onClick={(e) => {
                          // Don't prevent navigation, just ensure it doesn't auto-expand
                          e.stopPropagation();
                        }}
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}
                      >
                        {collapsed ? (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <item.icon className="h-4 w-4" />
                          </div>
                        ) : (
                          <>
                            <item.icon className="h-4 w-4" />
                            <span className="ml-2">{item.title}</span>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Separator */}
        <SidebarSeparator className="my-4" />

        {/* Spacer to push footer to bottom */}
        <div className="flex-1" />
      </SidebarContent>

      {/* Section 4: User Menu (Bottom) */}
      <SidebarFooter className="border-t border-border p-3">
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
// comment to test commit
