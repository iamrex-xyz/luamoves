import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MovingInfo } from "@/pages/Index";
import { BottomNav } from "@/components/BottomNav";
import { ReminderSettingsListItem, ReminderSettingsSheet } from "@/components/ReminderSettings";
import { MovingSettingsCard } from "@/components/settings/MovingSettingsCard";
import { ProfileOverview } from "@/components/settings/ProfileOverview";
import { CollaboratorSettingsCard } from "@/components/settings/CollaboratorSettingsCard";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { LuaLogo } from "@/components/LuaLogo";
import { useToast } from "@/hooks/use-toast";
import { useBudget } from "@/hooks/useBudget";
import { LogOut, Settings as SettingsIcon } from "lucide-react";

type SettingsProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onLogout: () => void;
  onUpdate: (info: MovingInfo) => void;
  isGuest?: boolean;
  onSignupClick?: () => void;
  onTaskComplete?: (taskId: string) => void;
};

export const Settings = ({ movingInfo, onNavigate, onLogout, onUpdate, isGuest, onSignupClick, onTaskComplete }: SettingsProps) => {
  const [reminderSheetOpen, setReminderSheetOpen] = useState(false);
  const [resetClickCount, setResetClickCount] = useState(0);
  const { toast } = useToast();

  // Use budget hook for deterministic budget management
  const budget = useBudget(
    movingInfo.movingBudget,
    isGuest ?? false,
    (amount) => onUpdate({ ...movingInfo, movingBudget: amount ?? undefined }),
    onTaskComplete
  );

  // Hidden reset function - triple tap on logo to activate
  const handleLogoClick = () => {
    const newCount = resetClickCount + 1;
    setResetClickCount(newCount);
    
    if (newCount >= 3) {
      // Clear all localStorage
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Reset voltooid",
        description: "Alle lokale data is gewist. Ververs de pagina om opnieuw te beginnen.",
      });
      
      setResetClickCount(0);
      
      // Auto refresh after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      // Reset count after 2 seconds of no clicks
      setTimeout(() => setResetClickCount(0), 2000);
    }
  };

  // Guest UI
  if (isGuest) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
        <div className="px-4 pt-4 pb-2">
          <div onClick={handleLogoClick} className="cursor-pointer">
            <LuaLogo size="md" />
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-6">
          {/* Moving Details Card - works for guests */}
          <MovingSettingsCard movingInfo={movingInfo} onUpdate={onUpdate} />

          {/* Signup prompt */}
          <Card className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Nog meer opties ontgrendelen?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Maak gratis een account aan en beheer je huishouden, herinneringen en samenwerkingsopties.
            </p>
            <Button onClick={onSignupClick} className="rounded-xl">
              Account aanmaken
            </Button>
          </Card>
        </div>

        <BottomNav currentView="settings" onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div onClick={handleLogoClick} className="cursor-pointer">
            <LuaLogo size="md" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-10 w-10 rounded-full hover:bg-secondary"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6">
        {/* Budget Progress Bar - always on top, driven by useBudget hook */}
        <BudgetProgressBar
          totalBudget={budget.budgetAmount}
          spentAmount={budget.spentAmount}
          onBudgetUpdate={budget.setBudget}
        />

        {/* Profile Overview - All profile data in collapsible sections */}
        <ProfileOverview movingInfo={movingInfo} onUpdate={onUpdate} />

        {/* Collaborators Card */}
        <CollaboratorSettingsCard />

        {/* Other Settings */}
        <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
          <div className="p-4 space-y-1">
            <ReminderSettingsListItem onClick={() => setReminderSheetOpen(true)} />
          </div>
        </div>

        <ReminderSettingsSheet open={reminderSheetOpen} onOpenChange={setReminderSheetOpen} />
      </div>

      <BottomNav currentView="settings" onNavigate={onNavigate} />
    </div>
  );
};
