import { useState, useEffect, createElement } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, generateTasksForRenter, generateTasksForBuyer, HouseholdInfo } from "@/lib/taskGenerator";
import { MovingInfo } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Package } from "lucide-react";

const GUEST_TASKS_KEY = "lua_guest_tasks";

export const useTasks = (movingInfo: MovingInfo) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, [movingInfo]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Guest mode - generate tasks locally
        setIsGuest(true);
        loadGuestTasks();
        return;
      }

      setIsGuest(false);

      // Haal profiel op voor household info
      const { data: profile } = await supabase
        .from("profiles")
        .select("children, pets, housing_property_type, has_garden, has_parking, is_vve, has_job")
        .eq("user_id", user.id)
        .single();

      const householdInfo: HouseholdInfo = {
        children: profile?.children || 0,
        pets: profile?.pets || 0,
        propertyType: (profile?.housing_property_type as "apartment" | "house" | "studio") || undefined,
        hasGarden: profile?.has_garden || false,
        hasParking: profile?.has_parking || false,
        isVve: profile?.is_vve || false,
        hasJob: profile?.has_job !== false,
      };

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

      // Genereer de complete task list op basis van type
      const generatedTasks = movingInfo.type === "rent" 
        ? generateTasksForRenter(movingInfo, householdInfo)
        : generateTasksForBuyer(movingInfo, householdInfo);

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

  const loadGuestTasks = () => {
    try {
      // Check if we have saved guest task statuses (localStorage = persists across sessions)
      const savedStatuses = localStorage.getItem(GUEST_TASKS_KEY);
      const statusMap: Record<string, "todo" | "in_progress" | "done"> = savedStatuses 
        ? JSON.parse(savedStatuses) 
        : {};

      // Guest mode: use movingInfo fields for household info
      const householdInfo: HouseholdInfo = {
        children: movingInfo.children || 0,
        pets: movingInfo.pets || 0,
        propertyType: movingInfo.propertyType,
        hasGarden: movingInfo.hasGarden || false,
        hasParking: movingInfo.hasParking || false,
        isVve: movingInfo.isVve || false,
        hasJob: movingInfo.hasJob !== false,
      };

      // Generate tasks
      const generatedTasks = movingInfo.type === "rent" 
        ? generateTasksForRenter(movingInfo, householdInfo)
        : generateTasksForBuyer(movingInfo, householdInfo);

      // Apply saved statuses
      const tasksWithStatus = generatedTasks.map((task) => ({
        ...task,
        status: statusMap[task.id] || task.status,
      }));

      setTasks(tasksWithStatus);
    } catch (error) {
      console.error("Error loading guest tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: "todo" | "in_progress" | "done",
    showUndo: boolean = true
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    const previousStatus = task?.status || "todo";

    try {
      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      if (isGuest) {
        // Save to localStorage for guests (persists across sessions)
        const savedStatuses = localStorage.getItem(GUEST_TASKS_KEY);
        const statusMap: Record<string, string> = savedStatuses 
          ? JSON.parse(savedStatuses) 
          : {};
        
        statusMap[taskId] = newStatus;
        localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(statusMap));
        
        // Show toast with undo option when completing a task
        if (newStatus === "done" && showUndo) {
          toast({
            title: "Taak afgerond!",
            action: (
              <ToastAction altText="Ongedaan maken" onClick={() => updateTaskStatus(taskId, previousStatus, false)}>
                Ongedaan maken
              </ToastAction>
            ),
          });
        } else {
          toast({
            title: newStatus === "done" ? "Taak afgerond!" : "Status bijgewerkt",
          });
        }
        return;
      }

      // Update in database for logged-in users
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

      // Show toast with undo option when completing a task
      if (newStatus === "done" && showUndo) {
        toast({
          title: "Taak afgerond!",
          description: "Je voortgang is opgeslagen.",
          action: (
            <ToastAction altText="Ongedaan maken" onClick={() => updateTaskStatus(taskId, previousStatus, false)}>
              Ongedaan maken
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: newStatus === "done" ? "Taak afgerond!" : "Status bijgewerkt",
          description: "Je voortgang is opgeslagen.",
        });
      }
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
    isGuest,
    updateTaskStatus,
    toggleTaskStatus,
    refreshTasks: loadTasks,
  };
};
