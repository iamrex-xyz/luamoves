import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MovingInfo } from "@/pages/Index";
import { BottomNav } from "@/components/BottomNav";
import { ReminderSettingsListItem, ReminderSettingsSheet } from "@/components/ReminderSettings";
import { ExtraInfoSheet } from "@/components/ExtraInfoSheet";
import { MovingSettingsCard } from "@/components/settings/MovingSettingsCard";
import { HouseholdSettingsCard } from "@/components/settings/HouseholdSettingsCard";
import { PersonalInfoCard } from "@/components/settings/PersonalInfoCard";
import { CollaboratorSettingsCard } from "@/components/settings/CollaboratorSettingsCard";
import { LuaLogo } from "@/components/LuaLogo";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ChevronRight, Sparkles, Settings as SettingsIcon, RotateCcw } from "lucide-react";

type SettingsProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onLogout: () => void;
  onUpdate: (info: MovingInfo) => void;
  isGuest?: boolean;
  onSignupClick?: () => void;
};

export const Settings = ({ movingInfo, onNavigate, onLogout, onUpdate, isGuest, onSignupClick }: SettingsProps) => {
  const [reminderSheetOpen, setReminderSheetOpen] = useState(false);
  const [extraInfoSheetOpen, setExtraInfoSheetOpen] = useState(false);
  const [resetClickCount, setResetClickCount] = useState(0);
  const { toast } = useToast();

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
        {/* Moving Details Card */}
        <MovingSettingsCard movingInfo={movingInfo} onUpdate={onUpdate} />

        {/* Household Card */}
        <HouseholdSettingsCard />

        {/* Personal Info Card */}
        <PersonalInfoCard />

        {/* Extra Info Button */}
        <button
          onClick={() => setExtraInfoSheetOpen(true)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">Personaliseer je verhuizing</p>
            <p className="text-xs text-muted-foreground">Energie, woning, internet & meer</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Collaborators Card */}
        <CollaboratorSettingsCard />

        {/* Other Settings */}
        <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
          <div className="p-4 space-y-1">
            <ReminderSettingsListItem onClick={() => setReminderSheetOpen(true)} />
          </div>
        </div>

        <ReminderSettingsSheet open={reminderSheetOpen} onOpenChange={setReminderSheetOpen} />
        <ExtraInfoSheet 
          open={extraInfoSheetOpen} 
          onOpenChange={setExtraInfoSheetOpen}
          movingInfo={movingInfo}
          onUpdate={onUpdate}
        />
      </div>

      <BottomNav currentView="settings" onNavigate={onNavigate} />
    </div>
  );
};
