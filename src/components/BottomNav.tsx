import { ListChecks, Home, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  currentView: "dashboard" | "tasks" | "extras" | "settings" | "chat";
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
};

export const BottomNav = ({ currentView, onNavigate }: BottomNavProps) => {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "tasks", label: "Taken", icon: ListChecks },
    { id: "extras", label: "Docs", icon: FileText },
    { id: "settings", label: "Account", icon: Settings },
  ] as const;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Hoofdnavigatie"
    >
      <div className="max-w-4xl mx-auto px-1 sm:px-2 py-2">
        <div className="flex items-center justify-around" role="tablist">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1.5 rounded-xl transition-all min-w-[44px] sm:min-w-[50px] relative active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground active:bg-muted/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} aria-hidden="true" />
                <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
