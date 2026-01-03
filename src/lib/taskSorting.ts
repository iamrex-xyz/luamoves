import { Task } from "./taskGenerator";

/**
 * Smart task sorting based on deadline, urgency, and relevance
 */

type UrgencyLevel = "overdue" | "today" | "tomorrow" | "this_week" | "next_week" | "later";

/**
 * Get urgency level for a task based on its deadline
 */
const getUrgencyLevel = (deadline: Date, status: string): UrgencyLevel => {
  if (status === "done") return "later";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const taskDeadline = new Date(deadline);
  taskDeadline.setHours(0, 0, 0, 0);
  
  const daysUntil = Math.ceil((taskDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return "overdue";
  if (daysUntil === 0) return "today";
  if (daysUntil === 1) return "tomorrow";
  if (daysUntil <= 7) return "this_week";
  if (daysUntil <= 14) return "next_week";
  return "later";
};

/**
 * Get numeric priority for urgency level (lower = more urgent)
 */
const getUrgencyPriority = (level: UrgencyLevel): number => {
  const priorities: Record<UrgencyLevel, number> = {
    overdue: 0,
    today: 1,
    tomorrow: 2,
    this_week: 3,
    next_week: 4,
    later: 5,
  };
  return priorities[level];
};

/**
 * Calculate a composite sort score for a task
 * Lower score = higher priority (shown first)
 */
const calculateTaskScore = (task: Task): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);
  
  const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base score from urgency level
  const urgencyLevel = getUrgencyLevel(task.deadline, task.status);
  let score = getUrgencyPriority(urgencyLevel) * 1000;
  
  // Add days until deadline (capped to prevent overflow)
  score += Math.min(Math.max(daysUntil, -100), 365);
  
  // Slight boost for tasks with affiliate links (they provide value)
  // But don't artificially prioritize them over urgent tasks
  if (task.affiliateLink && urgencyLevel !== "overdue" && urgencyLevel !== "today") {
    score -= 0.5; // Very slight boost
  }
  
  // Tasks with priority field
  if (task.priority) {
    score -= (3 - task.priority) * 0.1; // Priority 1 gets more boost than priority 3
  }
  
  return score;
};

/**
 * Sort tasks by smart criteria
 */
export const sortTasksSmart = (tasks: Task[]): Task[] => {
  // Mede-verhuizers taak altijd bovenaan
  const inviteTask = tasks.find(t => t.id === "invite-household-members");
  const otherTasks = tasks.filter(t => t.id !== "invite-household-members");
  
  const sortedOtherTasks = [...otherTasks].sort((a, b) => {
    const scoreA = calculateTaskScore(a);
    const scoreB = calculateTaskScore(b);
    
    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }
    
    // Secondary sort by title for consistent ordering
    return a.title.localeCompare(b.title);
  });
  
  // Als invite task bestaat en niet done, zet bovenaan
  if (inviteTask && inviteTask.status !== "done") {
    return [inviteTask, ...sortedOtherTasks];
  }
  
  return sortedOtherTasks;
};

/**
 * Sort tasks within each phase by smart criteria
 */
export const sortTasksByPhase = (tasksByPhase: Record<string, Task[]>): Record<string, Task[]> => {
  const sorted: Record<string, Task[]> = {};
  
  for (const [phase, tasks] of Object.entries(tasksByPhase)) {
    sorted[phase] = sortTasksSmart(tasks);
  }
  
  return sorted;
};

/**
 * Get task urgency info for UI display
 */
export const getTaskUrgencyInfo = (task: Task): {
  level: UrgencyLevel;
  daysUntil: number;
  isUrgent: boolean;
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);
  
  const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const level = getUrgencyLevel(task.deadline, task.status);
  
  return {
    level,
    daysUntil,
    isUrgent: level === "overdue" || level === "today" || level === "tomorrow",
  };
};
