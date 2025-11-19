import { ListChecks, Home, Settings, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

type BottomNavProps = {
  currentView: "dashboard" | "tasks" | "extras" | "settings";
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
};

export const BottomNav = ({ currentView, onNavigate }: BottomNavProps) => {
  const unreadCount = useUnreadMessages(currentView);
  
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "tasks", label: "Taken", icon: ListChecks },
    { id: "extras", label: "Extra", icon: Grid3x3 },
    { id: "settings", label: "Instellingen", icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="max-w-4xl mx-auto px-2 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showBadge = item.id === "extras" && unreadCount > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[70px] relative",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-xs font-medium">{item.label}</span>
                {showBadge && (
                  <span className="absolute top-1 right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};