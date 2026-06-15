// Self-contained copy of the app's BottomNav, scoped to this page's four tabs.
// Deliberately NOT importing the shared BottomNav so the standalone page stays
// fully independent of the dashboard. Home + Taken are functional; Docs +
// Account are present for design parity (their tab content is visual-only).

import { ListChecks, Home, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabId } from "../types";

type Props = {
  current: TabId;
  onNavigate: (tab: TabId) => void;
};

const NAV_ITEMS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "tasks", label: "Taken", icon: ListChecks },
  { id: "docs", label: "Docs", icon: FileText },
  { id: "account", label: "Account", icon: Settings },
];

export const TasklistBottomNav = ({ current, onNavigate }: Props) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Hoofdnavigatie"
    >
      <div className="max-w-4xl mx-auto px-1 sm:px-2 py-2">
        <div className="flex items-center justify-around" role="tablist">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.id;
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
                    : "text-muted-foreground hover:text-foreground active:bg-muted/50",
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} aria-hidden="true" />
                <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
