import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, BellRing, Info } from "lucide-react";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ReminderSettings = () => {
  const { preferences, isLoading, pushSupported, updatePreferences } = useReminderPreferences();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold">Herinneringen</h2>
      </div>

      <div className="space-y-4">
        {/* Email Reminders */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-muted rounded-lg shrink-0">
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">E-mail herinneringen</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                7 en 2 dagen voor deadline
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.email_enabled}
            onCheckedChange={(checked) => updatePreferences({ email_enabled: checked })}
          />
        </div>

        <Separator />

        {/* Browser Push */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-muted rounded-lg shrink-0">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm flex items-center gap-1">
                Browser notificaties
                {!pushSupported && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Niet beschikbaar in deze browser</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Op de dag van de deadline
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.push_enabled}
            onCheckedChange={(checked) => updatePreferences({ push_enabled: checked })}
            disabled={!pushSupported}
          />
        </div>

        <Separator />

        {/* In-app Alerts */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-muted rounded-lg shrink-0">
              <BellRing className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">In-app meldingen</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Banner met deadline taken
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.in_app_enabled}
            onCheckedChange={(checked) => updatePreferences({ in_app_enabled: checked })}
          />
        </div>

        <Separator />

        {/* Info section */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Slimme herinneringen</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Timing is afgestemd op taaktype:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li><strong>Energie/internet:</strong> 10, 6 en 2 dagen voor</li>
            <li><strong>Verhuisbedrijf:</strong> 14, 7 en 2 dagen voor</li>
            <li><strong>Inspectie:</strong> 7, 3 en 1 dag voor</li>
            <li><strong>Overige:</strong> 7 en 2 dagen voor deadline</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Je kunt per taak herinneringen uitschakelen via de taakdetails.
          </p>
        </div>
      </div>
    </Card>
  );
};
