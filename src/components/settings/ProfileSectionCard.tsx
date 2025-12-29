import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ProfileSectionCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconBgColor: string;
  isOpen: boolean;
  onToggle: () => void;
  completedFields: number;
  totalFields: number;
  children: ReactNode;
};

export const ProfileSectionCard = ({
  title,
  subtitle,
  icon,
  iconBgColor,
  isOpen,
  onToggle,
  completedFields,
  totalFields,
  children,
}: ProfileSectionCardProps) => {
  const isComplete = completedFields === totalFields && totalFields > 0;
  const hasProgress = completedFields > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBgColor)}>
              {icon}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{title}</h2>
                {isComplete && (
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                    Compleet
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasProgress && !isComplete && (
                <span className="text-xs text-muted-foreground">
                  {completedFields}/{totalFields}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t border-border/50">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
