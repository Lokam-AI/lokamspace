import { useState, useEffect } from "react";
import { HelpCircle, LogOut, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getOrganizationSettings, Organization } from "@/api/endpoints/organizations";

const UserDropdown = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { logout, user } = useAuth();
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

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleHelpSupport = () => {
    window.open("http://lokam.ai/", "_blank");
  };

  const handleBuyCredits = () => {
    navigate("/settings");
  };

  const bottomItems = [
    {
      title: "Help & Support",
      icon: HelpCircle,
      onClick: handleHelpSupport,
    },
    {
      title: "Sign out",
      icon: LogOut,
      onClick: handleSignOut,
    },
  ];

  // Utility function to extract first name from full name
  const getFirstName = (fullName: string): string => {
    if (!fullName || typeof fullName !== 'string') {
      return 'User';
    }
    
    // Split by space and take the first part
    const nameParts = fullName.trim().split(' ');
    return nameParts[0] || 'User';
  };

  // Get user display name (first name) and fallback to email if no full name
  const userDisplayName = user?.full_name ? getFirstName(user.full_name) : (user?.email || "User");
  // Get first letter for avatar (use first letter of display name)
  const avatarLetter = userDisplayName.charAt(0).toUpperCase();
  // Get organization name from API or use default
  const orgName = organization?.name || "Organization";

  const avatarButton = (
    <Button
      variant="ghost"
      className={
        collapsed
          ? "w-8 h-8 p-0 flex items-center justify-center"
          : "w-full justify-start bg-accent hover:bg-accent/80 h-auto p-3"
      }
    >
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-primary-foreground font-medium text-sm">
          {avatarLetter}
        </span>
      </div>
      {!collapsed && (
        <div className="flex flex-col items-start min-w-0 ml-2">
          <span className="text-sm font-medium text-foreground truncate">
            {userDisplayName}
          </span>
        </div>
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>{avatarButton}</DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-64 p-3"
                align="center"
                side="right"
                sideOffset={8}
              >
                {/* Organization Info */}
                <DropdownMenuLabel className="px-0 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">
                        {avatarLetter}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">
                        {userDisplayName}
                      </div>
                      <div className="text-xs text-foreground-secondary truncate">
                        {orgName}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Theme Section */}
                <div className="py-2">
                  <div className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-2">
                    THEME
                  </div>
                  <ThemeSelector />
                </div>

                <DropdownMenuSeparator />

                {/* Credits Section */}
                <div className="py-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-success">●</span>
                    <span className="text-foreground-secondary">5 credits</span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-sm py-1 h-8"
                    onClick={handleBuyCredits}
                  >
                    Buy Credits
                  </Button>
                </div>

                <DropdownMenuSeparator />

                {/* Menu Items */}
                <div className="py-1">
                  {bottomItems.map((item) => (
                    <DropdownMenuItem key={item.title} asChild className="px-0">
                      <button
                        onClick={item.onClick}
                        className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-md w-full text-left text-foreground"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </button>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{userDisplayName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{avatarButton}</DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-3"
        align="end"
        side="top"
        sideOffset={8}
      >
        {/* Organization Info */}
        <DropdownMenuLabel className="px-0 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm">
                {avatarLetter}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-foreground text-sm truncate">
                {userDisplayName}
              </div>
              <div className="text-xs text-foreground-secondary truncate">
                {orgName}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Theme Section */}
        <div className="py-2">
          <div className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-2">
            THEME
          </div>
          <ThemeSelector />
        </div>

        <DropdownMenuSeparator />

        {/* Credits Section */}
        <div className="py-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-success">●</span>
            <span className="text-foreground-secondary">5 credits</span>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-sm py-1 h-8"
            onClick={handleBuyCredits}
          >
            Buy Credits
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <div className="py-1">
          {bottomItems.map((item) => (
            <DropdownMenuItem key={item.title} asChild className="px-0">
              <button
                onClick={item.onClick}
                className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-md w-full text-left text-foreground"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.title}
              </button>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UserDropdown };
