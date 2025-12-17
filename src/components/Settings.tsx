import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MovingInfo } from "@/pages/Index";
import { BottomNav } from "@/components/BottomNav";
import { ReminderSettingsListItem, ReminderSettingsSheet } from "@/components/ReminderSettings";
import { ExtraInfoSheet } from "@/components/ExtraInfoSheet";
import { MovingSettingsCard } from "@/components/settings/MovingSettingsCard";
import { HouseholdSettingsCard } from "@/components/settings/HouseholdSettingsCard";
import { PersonalInfoCard } from "@/components/settings/PersonalInfoCard";
import { CollaboratorSettingsCard } from "@/components/settings/CollaboratorSettingsCard";
import { LogOut, ChevronRight, Sparkles } from "lucide-react";

type SettingsProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onLogout: () => void;
  onUpdate: (info: MovingInfo) => void;
};

export const Settings = ({ movingInfo, onNavigate, onLogout, onUpdate }: SettingsProps) => {
  const [reminderSheetOpen, setReminderSheetOpen] = useState(false);
  const [extraInfoSheetOpen, setExtraInfoSheetOpen] = useState(false);

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
            <p className="text-sm text-muted-foreground mt-0.5">Instellingen</p>
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

      <div className="px-6 space-y-6">
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
            <p className="font-medium text-foreground">Extra info over je verhuizing</p>
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
