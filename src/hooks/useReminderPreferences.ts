import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { calculateReminderDates } from "@/lib/reminderTimings";

export type ReminderPreferences = {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
};

const PUSH_PERMISSION_KEY = "pushNotificationPermission";

export const useReminderPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    email_enabled: true,
    push_enabled: false,
    in_app_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    setPushSupported("serviceWorker" in navigator && "PushManager" in window);
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("reminder_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading preferences:", error);
      }

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          in_app_enabled: data.in_app_enabled,
        });
      }
    } catch (error) {
      console.error("Error loading reminder preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<ReminderPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Niet ingelogd",
          description: "Log in om herinneringen in te stellen.",
          variant: "destructive",
        });
        return false;
      }

      const updatedPrefs = { ...preferences, ...newPreferences };

      // If enabling push, request permission first
      if (newPreferences.push_enabled && !preferences.push_enabled) {
        const granted = await requestPushPermission();
        if (!granted) {
          trackEvent("notificationPermissionDenied");
          return false;
        }
      }

      // Upsert preferences
      const { error } = await supabase
        .from("reminder_preferences")
        .upsert({
          user_id: user.id,
          ...updatedPrefs,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setPreferences(updatedPrefs);
      
      // Track analytics
      Object.entries(newPreferences).forEach(([key, value]) => {
        trackEvent("reminderPreferenceChanged", { preference: key, enabled: value });
      });

      return true;
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Fout",
        description: "Kon voorkeuren niet opslaan.",
        variant: "destructive",
      });
      return false;
    }
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (!pushSupported) {
      toast({
        title: "Niet ondersteund",
        description: "Push notificaties worden niet ondersteund in deze browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);

      // Request notification permission
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);

      if (permission === "granted") {
        localStorage.setItem(PUSH_PERMISSION_KEY, "granted");
        toast({
          title: "Notificaties ingeschakeld",
          description: "Je ontvangt nu push notificaties voor je taken.",
        });
        return true;
      } else {
        localStorage.setItem(PUSH_PERMISSION_KEY, "denied");
        toast({
          title: "Notificaties geweigerd",
          description: "Je kunt dit later wijzigen in je browserinstellingen.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting push permission:", error);
      toast({
        title: "Fout",
        description: "Kon push notificaties niet inschakelen.",
        variant: "destructive",
      });
      return false;
    }
  };

  const scheduleReminders = useCallback(async (taskId: string, deadline: string, taskTitle?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use smart timing based on task type
      const reminderDates = calculateReminderDates(deadline, taskId, taskTitle);

      const remindersToSchedule: Array<{
        user_id: string;
        task_id: string;
        reminder_type: string;
        scheduled_for: string;
      }> = [];

      // Map calculated reminders to database format
      let emailIndex = 0;
      reminderDates.forEach(({ date, type }) => {
        let reminderType: string;
        
        if (type === "email") {
          emailIndex++;
          reminderType = emailIndex === 1 ? "email_7_days" : "email_2_days";
        } else if (type === "push") {
          reminderType = "push_deadline";
        } else {
          reminderType = "in_app";
        }

        // Avoid duplicates for same date + type
        const exists = remindersToSchedule.some(
          r => r.scheduled_for === date && r.reminder_type === reminderType
        );
        
        if (!exists) {
          remindersToSchedule.push({
            user_id: user.id,
            task_id: taskId,
            reminder_type: reminderType,
            scheduled_for: date,
          });
        }
      });

      if (remindersToSchedule.length > 0) {
        // Delete existing reminders for this task first
        await supabase
          .from("scheduled_reminders")
          .delete()
          .eq("user_id", user.id)
          .eq("task_id", taskId)
          .eq("status", "pending");

        // Insert new reminders
        const { error } = await supabase
          .from("scheduled_reminders")
          .insert(remindersToSchedule);

        if (error) {
          console.error("Error scheduling reminders:", error);
        } else {
          trackEvent("reminderScheduled", { taskId, count: remindersToSchedule.length });
        }
      }
    } catch (error) {
      console.error("Error in scheduleReminders:", error);
    }
  }, []);

  const cancelReminders = useCallback(async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("scheduled_reminders")
        .update({ status: "cancelled" })
        .eq("user_id", user.id)
        .eq("task_id", taskId)
        .eq("status", "pending");
    } catch (error) {
      console.error("Error cancelling reminders:", error);
    }
  }, []);

  const disableTaskReminder = useCallback(async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("task_reminder_disabled")
        .upsert({
          user_id: user.id,
          task_id: taskId,
        }, {
          onConflict: "user_id,task_id",
        });

      // Also cancel any pending reminders
      await cancelReminders(taskId);

      toast({
        title: "Herinnering uitgeschakeld",
        description: "Je ontvangt geen herinneringen meer voor deze taak.",
      });
    } catch (error) {
      console.error("Error disabling task reminder:", error);
    }
  }, [cancelReminders, toast]);

  const enableTaskReminder = useCallback(async (taskId: string, deadline: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("task_reminder_disabled")
        .delete()
        .eq("user_id", user.id)
        .eq("task_id", taskId);

      // Schedule new reminders
      await scheduleReminders(taskId, deadline);

      toast({
        title: "Herinnering ingeschakeld",
        description: "Je ontvangt weer herinneringen voor deze taak.",
      });
    } catch (error) {
      console.error("Error enabling task reminder:", error);
    }
  }, [scheduleReminders, toast]);

  return {
    preferences,
    isLoading,
    pushSupported,
    updatePreferences,
    scheduleReminders,
    cancelReminders,
    disableTaskReminder,
    enableTaskReminder,
  };
};
