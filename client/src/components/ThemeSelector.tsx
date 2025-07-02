
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Bright', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="flex items-center bg-background-card dark:bg-card rounded-lg p-1 gap-1 w-full max-w-full overflow-hidden border border-border/30">
      {themes.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(id)}
          className={cn(
            "flex-1 h-8 px-2 text-xs font-medium transition-smooth min-w-0 flex items-center justify-center",
            theme === id
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover"
              : "text-foreground-secondary hover:text-foreground hover:bg-accent"
          )}
          title={label}
        >
          <Icon className="h-3 w-3 flex-shrink-0" />
        </Button>
      ))}
    </div>
  );
}
