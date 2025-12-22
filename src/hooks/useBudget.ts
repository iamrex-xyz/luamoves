import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const BUDGET_TASK_ID = "rent-fase1-verhuisbudget";
const BUDGET_TASK_ID_BUY = "buy-fase1-verhuisbudget";
const GUEST_BUDGET_KEY = "lua_guest_budget";
const GUEST_AFFILIATE_COSTS_KEY = "lua_guest_affiliate_costs";

export type AffiliateCost = {
  taskId: string;
  taskTitle: string;
  amount: number;
  addedAt: string;
};

interface UseBudgetReturn {
  budgetAmount: number | null;
  spentAmount: number;
  affiliateCosts: AffiliateCost[];
  budgetTaskCompleted: boolean;
  budgetBarVisible: boolean;
  setBudget: (amount: number | null) => Promise<void>;
  addAffiliateCost: (taskId: string, taskTitle: string, amount: number) => Promise<void>;
  removeAffiliateCost: (taskId: string) => Promise<void>;
  updateAffiliateCost: (taskId: string, amount: number) => Promise<void>;
}

export const useBudget = (
  movingBudget: number | undefined,
  isGuest: boolean,
  onBudgetUpdate: (budget: number | null) => void,
  onTaskComplete?: (taskId: string) => void
): UseBudgetReturn => {
  const [affiliateCosts, setAffiliateCosts] = useState<AffiliateCost[]>([]);
  const [budgetTaskCompleted, setBudgetTaskCompleted] = useState(false);

  // Derived state
  const budgetAmount = movingBudget ?? null;
  const spentAmount = affiliateCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const budgetBarVisible = budgetAmount !== null;

  // Load affiliate costs
  useEffect(() => {
    const loadAffiliateCosts = async () => {
      if (isGuest) {
        // Load from localStorage for guests
        const saved = localStorage.getItem(GUEST_AFFILIATE_COSTS_KEY);
        if (saved) {
          try {
            setAffiliateCosts(JSON.parse(saved));
          } catch {
            setAffiliateCosts([]);
          }
        }
      } else {
        // Load from Supabase for logged-in users
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: expenses } = await supabase
          .from("moving_expenses")
          .select("*")
          .eq("user_id", user.id)
          .eq("category", "affiliate_task");

        if (expenses) {
          setAffiliateCosts(
            expenses.map((e) => ({
              taskId: e.description || "",
              taskTitle: e.description || "",
              amount: e.amount,
              addedAt: e.expense_date,
            }))
          );
        }
      }
    };

    loadAffiliateCosts();
  }, [isGuest]);

  // Check if budget task is completed
  useEffect(() => {
    const checkBudgetTaskStatus = async () => {
      if (isGuest) {
        const savedStatuses = localStorage.getItem("lua_guest_tasks");
        if (savedStatuses) {
          const statusMap = JSON.parse(savedStatuses);
          setBudgetTaskCompleted(
            statusMap[BUDGET_TASK_ID] === "done" || 
            statusMap[BUDGET_TASK_ID_BUY] === "done"
          );
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: tasks } = await supabase
          .from("tasks")
          .select("status")
          .eq("user_id", user.id)
          .in("task_id", [BUDGET_TASK_ID, BUDGET_TASK_ID_BUY]);

        setBudgetTaskCompleted(
          tasks?.some((t) => t.status === "done") ?? false
        );
      }
    };

    checkBudgetTaskStatus();
  }, [isGuest, budgetAmount]);

  // Set budget and auto-complete task
  const setBudget = useCallback(async (amount: number | null) => {
    // Update the budget via parent callback
    onBudgetUpdate(amount);

    // If budget is set and task not completed, auto-complete the task
    if (amount !== null && !budgetTaskCompleted) {
      if (isGuest) {
        // Update localStorage for guest
        const savedStatuses = localStorage.getItem("lua_guest_tasks");
        const statusMap = savedStatuses ? JSON.parse(savedStatuses) : {};
        statusMap[BUDGET_TASK_ID] = "done";
        statusMap[BUDGET_TASK_ID_BUY] = "done";
        localStorage.setItem("lua_guest_tasks", JSON.stringify(statusMap));
        setBudgetTaskCompleted(true);
        
        // Trigger task complete callback for guest flow
        onTaskComplete?.(BUDGET_TASK_ID);
      } else {
        // Update Supabase for logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Mark both rent and buy budget tasks as done
          await supabase.from("tasks").upsert([
            { user_id: user.id, task_id: BUDGET_TASK_ID, status: "done" },
            { user_id: user.id, task_id: BUDGET_TASK_ID_BUY, status: "done" },
          ], { onConflict: "user_id,task_id" });
          
          setBudgetTaskCompleted(true);
          onTaskComplete?.(BUDGET_TASK_ID);
        }
      }
    }

    // If budget is cleared, unset task completion
    if (amount === null && budgetTaskCompleted) {
      if (isGuest) {
        const savedStatuses = localStorage.getItem("lua_guest_tasks");
        const statusMap = savedStatuses ? JSON.parse(savedStatuses) : {};
        delete statusMap[BUDGET_TASK_ID];
        delete statusMap[BUDGET_TASK_ID_BUY];
        localStorage.setItem("lua_guest_tasks", JSON.stringify(statusMap));
        setBudgetTaskCompleted(false);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("tasks")
            .update({ status: "todo" })
            .eq("user_id", user.id)
            .in("task_id", [BUDGET_TASK_ID, BUDGET_TASK_ID_BUY]);
          setBudgetTaskCompleted(false);
        }
      }
    }
  }, [isGuest, budgetTaskCompleted, onBudgetUpdate, onTaskComplete]);

  // Add affiliate cost
  const addAffiliateCost = useCallback(async (taskId: string, taskTitle: string, amount: number) => {
    const newCost: AffiliateCost = {
      taskId,
      taskTitle,
      amount,
      addedAt: new Date().toISOString(),
    };

    const updatedCosts = [...affiliateCosts.filter(c => c.taskId !== taskId), newCost];
    setAffiliateCosts(updatedCosts);

    if (isGuest) {
      localStorage.setItem(GUEST_AFFILIATE_COSTS_KEY, JSON.stringify(updatedCosts));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Remove existing expense for this task first
        await supabase
          .from("moving_expenses")
          .delete()
          .eq("user_id", user.id)
          .eq("category", "affiliate_task")
          .eq("description", taskId);

        // Add new expense
        await supabase.from("moving_expenses").insert({
          user_id: user.id,
          amount,
          category: "affiliate_task",
          description: taskId,
          expense_date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [affiliateCosts, isGuest]);

  // Remove affiliate cost
  const removeAffiliateCost = useCallback(async (taskId: string) => {
    const updatedCosts = affiliateCosts.filter(c => c.taskId !== taskId);
    setAffiliateCosts(updatedCosts);

    if (isGuest) {
      localStorage.setItem(GUEST_AFFILIATE_COSTS_KEY, JSON.stringify(updatedCosts));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("moving_expenses")
          .delete()
          .eq("user_id", user.id)
          .eq("category", "affiliate_task")
          .eq("description", taskId);
      }
    }
  }, [affiliateCosts, isGuest]);

  // Update affiliate cost
  const updateAffiliateCost = useCallback(async (taskId: string, amount: number) => {
    const existingCost = affiliateCosts.find(c => c.taskId === taskId);
    if (existingCost) {
      await addAffiliateCost(taskId, existingCost.taskTitle, amount);
    }
  }, [affiliateCosts, addAffiliateCost]);

  return {
    budgetAmount,
    spentAmount,
    affiliateCosts,
    budgetTaskCompleted,
    budgetBarVisible,
    setBudget,
    addAffiliateCost,
    removeAffiliateCost,
    updateAffiliateCost,
  };
};
