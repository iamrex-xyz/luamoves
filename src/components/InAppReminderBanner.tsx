import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

type Task = {
  id: string;
  title: string;
  deadline: string;
};

type InAppReminderBannerProps = {
  onFilterDeadlineTasks: () => void;
};

export const InAppReminderBanner = ({ onFilterDeadlineTasks }: InAppReminderBannerProps) => {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUpcomingDeadlines();
  }, []);

  const loadUpcomingDeadlines = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if user has in-app reminders enabled
      const { data: preferences } = await supabase
        .from("reminder_preferences")
        .select("in_app_enabled")
        .eq("user_id", user.id)
        .single();

      if (preferences?.in_app_enabled === false) {
        setIsLoading(false);
        return;
      }

      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const todayStr = today.toISOString().split("T")[0];
      const endOfWeekStr = endOfWeek.toISOString().split("T")[0];

      // Get custom tasks with deadlines this week
      const { data: customTasks } = await supabase
        .from("custom_tasks")
        .select("task_id, title, deadline")
        .eq("user_id", user.id)
        .gte("deadline", todayStr)
        .lte("deadline", endOfWeekStr);

      // Get task deadlines this week
      const { data: taskDeadlines } = await supabase
        .from("task_deadlines")
        .select("task_id, deadline")
        .eq("user_id", user.id)
        .gte("deadline", todayStr)
        .lte("deadline", endOfWeekStr);

      // Get completed tasks to filter out
      const { data: completedTasks } = await supabase
        .from("tasks")
        .select("task_id")
        .eq("user_id", user.id)
        .eq("status", "done");

      const completedTaskIds = new Set(completedTasks?.map(t => t.task_id) || []);

      const tasks: Task[] = [];

      // Add custom tasks
      customTasks?.forEach(task => {
        if (!completedTaskIds.has(task.task_id)) {
          tasks.push({
            id: task.task_id,
            title: task.title,
            deadline: task.deadline,
          });
        }
      });

      // Add tasks with deadlines (using task_id as title placeholder)
      taskDeadlines?.forEach(task => {
        if (!completedTaskIds.has(task.task_id) && !tasks.find(t => t.id === task.task_id)) {
          tasks.push({
            id: task.task_id,
            title: task.task_id.replace(/-/g, " "),
            deadline: task.deadline,
          });
        }
      });

      // Sort by deadline
      tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

      setUpcomingTasks(tasks);
    } catch (error) {
      console.error("Error loading upcoming deadlines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    trackEvent("reminderClicked", { source: "in_app_banner" });
    onFilterDeadlineTasks();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isLoading || isDismissed || upcomingTasks.length === 0) {
    return null;
  }

  const taskCount = upcomingTasks.length;
  const firstDeadline = upcomingTasks[0];
  const deadlineDate = new Date(firstDeadline.deadline);
  const isToday = deadlineDate.toDateString() === new Date().toDateString();
  const isTomorrow = deadlineDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  let urgencyText = "";
  if (isToday) {
    urgencyText = "vandaag";
  } else if (isTomorrow) {
    urgencyText = "morgen";
  } else {
    urgencyText = "deze week";
  }

  return (
    <div className="bg-gradient-to-r from-primary-light to-primary-light/80 dark:from-primary/10 dark:to-primary/5 border border-primary/20 dark:border-primary/30 rounded-lg p-3 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary-light dark:bg-primary/20 rounded-full shrink-0">
            <Bell className="w-4 h-4 text-primary dark:text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground dark:text-foreground">
              {taskCount === 1 
                ? `1 taak met deadline ${urgencyText}`
                : `${taskCount} taken met deadlines ${urgencyText}`
              }
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5 truncate">
              {firstDeadline.title}
              {taskCount > 1 && ` en ${taskCount - 1} andere${taskCount > 2 ? "n" : ""}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="text-primary dark:text-primary hover:bg-primary-light dark:hover:bg-primary/20 h-8 px-2"
          >
            <span className="text-xs">Bekijk</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="text-primary dark:text-primary hover:bg-primary-light dark:hover:bg-primary/20 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const useUpcomingDeadlineCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const todayStr = today.toISOString().split("T")[0];
        const endOfWeekStr = endOfWeek.toISOString().split("T")[0];

        // Count task deadlines this week
        const { count: deadlineCount } = await supabase
          .from("task_deadlines")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("deadline", todayStr)
          .lte("deadline", endOfWeekStr);

        setCount(deadlineCount || 0);
      } catch (error) {
        console.error("Error loading deadline count:", error);
      }
    };

    loadCount();
  }, []);

  return count;
};
