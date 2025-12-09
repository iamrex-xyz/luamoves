import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";
import { trackEvent } from "@/lib/analytics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const ACCOUNT_CREATED_KEY = "lua_account_created_at";
const REMINDER_TIME_KEY = "lua_reminder_time";
const REMINDER_FREQUENCY_KEY = "lua_reminder_frequency";

type TimePreference = "morning" | "afternoon" | "evening";
type FrequencyPreference = "daily" | "deadlines_only";

export const ReminderSettingsListItem = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/50 transition-colors rounded-lg px-2 -mx-2"
    >
      <div>
        <p className="font-medium text-sm">Herinneringen beheren</p>
        <p className="text-xs text-muted-foreground mt-0.5">Houd je netjes op schema</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
};

export const ReminderSettingsSheet = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = useReminderPreferences();
  
  // Local state for the form
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [timePreference, setTimePreference] = useState<TimePreference>("morning");
  const [frequencyPreference, setFrequencyPreference] = useState<FrequencyPreference>("deadlines_only");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user is within first 2 weeks
  const isWithinTwoWeeks = useMemo(() => {
    const createdAt = localStorage.getItem(ACCOUNT_CREATED_KEY);
    if (!createdAt) {
      // If no creation date stored, store it now and consider them new
      localStorage.setItem(ACCOUNT_CREATED_KEY, new Date().toISOString());
      return true;
    }
    const createdDate = new Date(createdAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return createdDate > twoWeeksAgo;
  }, []);

  // Load preferences when sheet opens
  useEffect(() => {
    if (open) {
      trackEvent("reminder_settings_viewed");
      
      // Load from preferences
      const allEnabled = preferences.email_enabled || preferences.in_app_enabled;
      setRemindersEnabled(allEnabled);
      
      // Load local preferences
      const savedTime = localStorage.getItem(REMINDER_TIME_KEY) as TimePreference | null;
      const savedFrequency = localStorage.getItem(REMINDER_FREQUENCY_KEY) as FrequencyPreference | null;
      
      if (savedTime) setTimePreference(savedTime);
      if (savedFrequency) setFrequencyPreference(savedFrequency);
      
      setHasChanges(false);
    }
  }, [open, preferences]);

  const handleToggleReminders = (checked: boolean) => {
    if (!checked && isWithinTwoWeeks) {
      // Show confirmation dialog for users trying to disable within 2 weeks
      trackEvent("reminder_disabled_attempt_blocked");
      setShowDisableConfirm(true);
    } else {
      setRemindersEnabled(checked);
      setHasChanges(true);
    }
  };

  const handleConfirmDisable = () => {
    setRemindersEnabled(false);
    setHasChanges(true);
    setShowDisableConfirm(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to Supabase
      await updatePreferences({
        email_enabled: remindersEnabled,
        in_app_enabled: remindersEnabled,
      });
      
      // Save local preferences
      localStorage.setItem(REMINDER_TIME_KEY, timePreference);
      localStorage.setItem(REMINDER_FREQUENCY_KEY, frequencyPreference);
      
      trackEvent("reminder_settings_changed", {
        enabled: remindersEnabled,
        time: timePreference,
        frequency: frequencyPreference,
      });
      
      toast({
        title: "Opgeslagen",
        description: "Je herinneringsinstellingen zijn bijgewerkt.",
      });
      
      setHasChanges(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan. Probeer opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl h-auto max-h-[85vh]">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>Herinneringen beheren</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 pb-6">
            {/* Main toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminders-toggle" className="text-base font-medium">
                  Herinneringen ontvangen
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Lua helpt je alles op tijd te regelen
                </p>
              </div>
              <Switch
                id="reminders-toggle"
                checked={remindersEnabled}
                onCheckedChange={handleToggleReminders}
              />
            </div>

            {remindersEnabled && (
              <>
                {/* Time preference */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tijdvoorkeur</Label>
                  <Select 
                    value={timePreference} 
                    onValueChange={(val: TimePreference) => {
                      setTimePreference(val);
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="w-full h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[60]">
                      <SelectItem value="morning">Ochtend (8:00 - 10:00)</SelectItem>
                      <SelectItem value="afternoon">Middag (12:00 - 14:00)</SelectItem>
                      <SelectItem value="evening">Avond (18:00 - 20:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency preference */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Frequentie</Label>
                  <Select 
                    value={frequencyPreference} 
                    onValueChange={(val: FrequencyPreference) => {
                      setFrequencyPreference(val);
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="w-full h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[60]">
                      <SelectItem value="deadlines_only">Alleen bij deadlines</SelectItem>
                      <SelectItem value="daily">Dagelijks overzicht</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Save button */}
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className="w-full h-12 rounded-xl text-base font-medium"
            >
              {isSaving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation dialog for disabling within 2 weeks */}
      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Zeker weten?</AlertDialogTitle>
            <AlertDialogDescription>
              We helpen je graag alles op tijd te regelen. Je kunt dit later altijd uitzetten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={handleConfirmDisable}
              className="w-full"
            >
              Toch uitzetten
            </AlertDialogAction>
            <AlertDialogCancel className="w-full mt-0">
              Annuleren
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Legacy export for backwards compatibility
export const ReminderSettings = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  
  return (
    <>
      <ReminderSettingsListItem onClick={() => setSheetOpen(true)} />
      <ReminderSettingsSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
};
