
import { useState, useEffect } from "react";
import { LayoutDashboard, Phone, Calendar, MessageSquare, Settings, User, LogOut, HelpCircle, Palette, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { getOrganizationSettings, Organization } from "@/api/endpoints/organizations";
import { useAuth } from "@/contexts/AuthContext";

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
        <div className="flex flex-col space-y-3 p-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-xl text-foreground truncate">Autopulse</span>
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
          <div className="flex justify-start">
            <SidebarTrigger className="h-7 w-7 flex-shrink-0" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
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
                      className="w-full justify-start"
                    >
                      <NavLink 
                        to={item.url}
                        onClick={(e) => {
                          // Don't prevent navigation, just ensure it doesn't auto-expand
                          e.stopPropagation();
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
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
                      className="w-full justify-start"
                    >
                      <NavLink 
                        to={item.url}
                        onClick={(e) => {
                          // Don't prevent navigation, just ensure it doesn't auto-expand
                          e.stopPropagation();
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
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
