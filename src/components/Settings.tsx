import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MovingInfo } from "@/pages/Index";
import { BottomNav } from "@/components/BottomNav";
import { ReminderSettingsListItem, ReminderSettingsSheet } from "@/components/ReminderSettings";
import { MovingSettingsCard } from "@/components/settings/MovingSettingsCard";
import { ProfileOverview } from "@/components/settings/ProfileOverview";
import { CollaboratorSettingsCard } from "@/components/settings/CollaboratorSettingsCard";
import { HouseholdMembersSettingsCard } from "@/components/settings/HouseholdMembersSettingsCard";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { LuaLogo } from "@/components/LuaLogo";
import { useToast } from "@/hooks/use-toast";
import { useBudget } from "@/hooks/useBudget";
import { useGuestStorage } from "@/hooks/useGuestStorage";
import { LogOut, Settings as SettingsIcon, Phone as PhoneIcon } from "lucide-react";

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
  const guestStorage = useGuestStorage();

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
          {/* Phone number card - if captured */}
          {guestStorage.capturedPhone && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefoonnummer</p>
                  <p className="font-medium">{guestStorage.capturedPhone}</p>
                </div>
              </div>
            </Card>
          )}

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
        <div onClick={handleLogoClick} className="cursor-pointer">
          <LuaLogo size="md" />
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

        {/* Household Members Card - medeverhuizers from WhatsApp invites */}
        <HouseholdMembersSettingsCard />

        {/* Collaborators Card - email invites */}
        <CollaboratorSettingsCard />

        {/* Other Settings */}
        <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
          <div className="p-4 space-y-1">
            <ReminderSettingsListItem onClick={() => setReminderSheetOpen(true)} />
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full rounded-xl h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Uitloggen
        </Button>

        <ReminderSettingsSheet open={reminderSheetOpen} onOpenChange={setReminderSheetOpen} />
      </div>

      <BottomNav currentView="settings" onNavigate={onNavigate} />
    </div>
  );
};
