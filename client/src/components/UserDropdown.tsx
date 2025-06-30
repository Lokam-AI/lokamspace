
import { useState } from "react";
import { HelpCircle, LogOut, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const bottomItems = [
  {
    title: "Help & Support",
    icon: HelpCircle,
    onClick: () => {
      console.log("Help & Support clicked");
    }
  },
  {
    title: "Sign out",
    icon: LogOut,
    onClick: () => {
      console.log("Sign out clicked");
    }
  }
];

export function UserDropdown() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const avatarButton = (
    <Button
      variant="ghost"
      className={collapsed 
        ? "w-8 h-8 p-0 flex items-center justify-center" 
        : "w-full justify-start bg-accent hover:bg-accent/80 h-auto p-3"
      }
    >
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-primary-foreground font-medium text-sm">R</span>
      </div>
      {!collapsed && (
        <div className="flex flex-col items-start min-w-0 ml-2">
          <span className="text-sm font-medium text-foreground truncate">raoof@lokam.ai</span>
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
              <DropdownMenuTrigger asChild>
                {avatarButton}
              </DropdownMenuTrigger>
              
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
                      <span className="text-primary-foreground font-medium text-sm">R</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">raoof@lokam.ai</div>
                      <div className="text-xs text-foreground-secondary truncate">raoof@lokam.ai's Org</div>
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
                  <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-sm py-1 h-8">
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
            <p>raoof@lokam.ai</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {avatarButton}
      </DropdownMenuTrigger>
      
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
              <span className="text-primary-foreground font-medium text-sm">R</span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-foreground text-sm truncate">raoof@lokam.ai</div>
              <div className="text-xs text-foreground-secondary truncate">raoof@lokam.ai's Org</div>
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
          <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-sm py-1 h-8">
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
}
