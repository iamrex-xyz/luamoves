import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, generateTasksForRenter } from "@/lib/taskGenerator";
import { MovingInfo } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

export const useTasks = (movingInfo: MovingInfo) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Laad taken uit database en merge met gegenereerde taken
  useEffect(() => {
    loadTasks();
  }, [movingInfo]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);

      // Haal opgeslagen task statuses uit database
      const { data: savedTasks, error } = await supabase
        .from("tasks")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Genereer de complete task list
      const generatedTasks =
        movingInfo.type === "rent" ? generateTasksForRenter(movingInfo) : [];

      // Merge saved statuses met generated tasks
      const mergedTasks = generatedTasks.map((task) => {
        const savedTask = savedTasks?.find((st) => st.task_id === task.id);
        if (savedTask) {
          return {
            ...task,
            status: savedTask.status as "todo" | "in_progress" | "done",
          };
        }
        return task;
      });

      setTasks(mergedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Fout bij laden van taken",
        description: "Probeer de pagina opnieuw te laden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: "todo" | "in_progress" | "done"
  ) => {
    try {
      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Update in database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Gebruiker niet ingelogd");
      }

      const { error } = await supabase.from("tasks").upsert(
        {
          user_id: user.id,
          task_id: taskId,
          status: newStatus,
        },
        {
          onConflict: "user_id,task_id",
        }
      );

      if (error) throw error;

      toast({
        title: newStatus === "done" ? "Taak afgerond!" : "Status bijgewerkt",
        description: "Je voortgang is opgeslagen.",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      
      // Rollback optimistic update
      await loadTasks();
      
      toast({
        title: "Fout bij opslaan",
        description: "De status kon niet worden bijgewerkt. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === "done" ? "todo" : "done";
    updateTaskStatus(taskId, newStatus);
  };

  return {
    tasks,
    isLoading,
    updateTaskStatus,
    toggleTaskStatus,
    refreshTasks: loadTasks,
  };
};
