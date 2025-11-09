import { useState, useEffect, createElement } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, generateTasksForRenter } from "@/lib/taskGenerator";
import { MovingInfo } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Haal opgeslagen task statuses uit database (inclusief assigned info)
      const { data: savedTasks, error } = await supabase
        .from("tasks")
        .select("*, assigned_to, assigned_to_email, notes")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Haal custom deadlines op
      const { data: customDeadlines, error: deadlineError } = await supabase
        .from("task_deadlines")
        .select("*");

      if (deadlineError) throw deadlineError;

      // Haal custom tasks op
      const { data: customTasksData, error: customError } = await supabase
        .from("custom_tasks")
        .select("*")
        .order("deadline", { ascending: true });

      if (customError) throw customError;

      // Genereer de complete task list
      const generatedTasks =
        movingInfo.type === "rent" ? generateTasksForRenter(movingInfo) : [];

      // Merge saved statuses met generated tasks and apply custom deadlines
      const mergedTasks = generatedTasks.map((task) => {
        const savedTask = savedTasks?.find((st) => st.task_id === task.id);
        const customDeadline = customDeadlines?.find((cd) => cd.task_id === task.id);
        
        const deadline = customDeadline 
          ? new Date(customDeadline.deadline)
          : task.deadline;

        return {
          ...task,
          deadline,
          deadlineLabel: deadline.toLocaleDateString("nl-NL"),
          status: (savedTask?.status as "todo" | "in_progress" | "done") || task.status,
          assignedTo: savedTask?.assigned_to || null,
          assignedToEmail: savedTask?.assigned_to_email || null,
          notes: savedTask?.notes || null,
        };
      });

      // Add custom tasks
      const customTasks: Task[] = (customTasksData || []).map((ct) => {
        const savedTask = savedTasks?.find((st) => st.task_id === ct.task_id);
        return {
          id: ct.task_id,
          title: ct.title,
          category: ct.category,
          description: ct.description || "",
          deadline: new Date(ct.deadline),
          deadlineLabel: new Date(ct.deadline).toLocaleDateString("nl-NL"),
          phase: ct.phase,
          status: (savedTask?.status as "todo" | "in_progress" | "done") || "todo",
          icon: createElement(Package, { className: "w-4 h-4" }),
          priority: 2,
          assignedTo: savedTask?.assigned_to || null,
          assignedToEmail: savedTask?.assigned_to_email || null,
          notes: savedTask?.notes || null,
        };
      });

      setTasks([...mergedTasks, ...customTasks]);
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
