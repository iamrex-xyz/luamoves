// Smart reminder timings based on research data
// Source: 30+ verhuisplatform studies + PostNL data + Nibud inzicht

export type ReminderTiming = {
  daysBeforeDeadline: number[];
  stressFactor: 1 | 2 | 3 | 4 | 5;
  hasAffiliatePotential: boolean;
};

// Task ID patterns mapped to optimal reminder timings
export const TASK_REMINDER_TIMINGS: Record<string, ReminderTiming> = {
  // Energie & internet omzetten - Impact 5, 6-10 dagen voor overdracht
  "energie": { daysBeforeDeadline: [10, 6, 2], stressFactor: 5, hasAffiliatePotential: true },
  "internet": { daysBeforeDeadline: [10, 6, 2], stressFactor: 5, hasAffiliatePotential: true },
  "gas": { daysBeforeDeadline: [10, 6, 2], stressFactor: 5, hasAffiliatePotential: true },
  "stroom": { daysBeforeDeadline: [10, 6, 2], stressFactor: 5, hasAffiliatePotential: true },
  "nutsvoorzieningen": { daysBeforeDeadline: [10, 6, 2], stressFactor: 5, hasAffiliatePotential: true },
  
  // Adreswijzigingen overheid - Impact 5, 5 dagen voor verhuizing
  "gemeente": { daysBeforeDeadline: [7, 5, 1], stressFactor: 5, hasAffiliatePotential: false },
  "adreswijziging": { daysBeforeDeadline: [7, 5, 1], stressFactor: 5, hasAffiliatePotential: false },
  "belastingdienst": { daysBeforeDeadline: [7, 5, 1], stressFactor: 5, hasAffiliatePotential: false },
  
  // Eindinspectie/oplevering - Impact 5, 3 dagen voor overdracht
  "oplevering": { daysBeforeDeadline: [7, 3, 1], stressFactor: 5, hasAffiliatePotential: false },
  "eindinspectie": { daysBeforeDeadline: [7, 3, 1], stressFactor: 5, hasAffiliatePotential: false },
  "inspectie": { daysBeforeDeadline: [7, 3, 1], stressFactor: 5, hasAffiliatePotential: false },
  
  // Verhuisdag plannen & hulp regelen - Impact 4, 14 dagen voor deadline
  "verhuisbedrijf": { daysBeforeDeadline: [14, 7, 2], stressFactor: 4, hasAffiliatePotential: true },
  "verhuizen": { daysBeforeDeadline: [14, 7, 2], stressFactor: 4, hasAffiliatePotential: true },
  "hulp": { daysBeforeDeadline: [14, 7, 2], stressFactor: 4, hasAffiliatePotential: false },
  
  // Inboedelverzekering - Impact 4, binnen 3 dagen na verhuis (negative = after)
  "inboedelverzekering": { daysBeforeDeadline: [7, 3, 0], stressFactor: 4, hasAffiliatePotential: true },
  "verzekering": { daysBeforeDeadline: [7, 3, 0], stressFactor: 4, hasAffiliatePotential: true },
  
  // Verhuiswagen reserveren - Impact 4, 2 weken voor verhuisdag
  "verhuiswagen": { daysBeforeDeadline: [14, 7, 2], stressFactor: 4, hasAffiliatePotential: true },
  "busje": { daysBeforeDeadline: [14, 7, 2], stressFactor: 4, hasAffiliatePotential: true },
  
  // Afval/afvalpas - Impact 3, 2-5 dagen voor verhuis
  "afval": { daysBeforeDeadline: [5, 2], stressFactor: 3, hasAffiliatePotential: false },
  "huisvuil": { daysBeforeDeadline: [5, 2], stressFactor: 3, hasAffiliatePotential: false },
  "afvalpas": { daysBeforeDeadline: [5, 2], stressFactor: 3, hasAffiliatePotential: false },
  
  // Kinderen school/kdv - Impact 3, 3 weken voor verhuis
  "school": { daysBeforeDeadline: [21, 14, 7], stressFactor: 3, hasAffiliatePotential: false },
  "kinderopvang": { daysBeforeDeadline: [21, 14, 7], stressFactor: 3, hasAffiliatePotential: false },
  "kdv": { daysBeforeDeadline: [21, 14, 7], stressFactor: 3, hasAffiliatePotential: false },
  
  // Huisdieren voorbereiden - Impact 3, week voor
  "huisdier": { daysBeforeDeadline: [7, 3, 1], stressFactor: 3, hasAffiliatePotential: false },
  "kat": { daysBeforeDeadline: [7, 3, 1], stressFactor: 3, hasAffiliatePotential: false },
  "hond": { daysBeforeDeadline: [7, 3, 1], stressFactor: 3, hasAffiliatePotential: false },
  "dierenarts": { daysBeforeDeadline: [7, 3, 1], stressFactor: 3, hasAffiliatePotential: false },
};

// Default timing for tasks without specific mapping
export const DEFAULT_REMINDER_TIMING: ReminderTiming = {
  daysBeforeDeadline: [7, 2, 0],
  stressFactor: 3,
  hasAffiliatePotential: false,
};

/**
 * Get the optimal reminder timing for a task based on its ID/title
 */
export const getTaskReminderTiming = (taskId: string, taskTitle?: string): ReminderTiming => {
  const searchText = `${taskId} ${taskTitle || ""}`.toLowerCase();
  
  // Find matching timing based on keywords
  for (const [keyword, timing] of Object.entries(TASK_REMINDER_TIMINGS)) {
    if (searchText.includes(keyword.toLowerCase())) {
      return timing;
    }
  }
  
  return DEFAULT_REMINDER_TIMING;
};

/**
 * Calculate reminder dates based on deadline and task type
 */
export const calculateReminderDates = (
  deadline: string,
  taskId: string,
  taskTitle?: string
): { date: string; type: "email" | "push" | "in_app" }[] => {
  const timing = getTaskReminderTiming(taskId, taskTitle);
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reminders: { date: string; type: "email" | "push" | "in_app" }[] = [];
  
  timing.daysBeforeDeadline.forEach((days, index) => {
    const reminderDate = new Date(deadlineDate);
    reminderDate.setDate(reminderDate.getDate() - days);
    
    if (reminderDate >= today) {
      // First reminders are email, last one includes push + in-app
      if (index === timing.daysBeforeDeadline.length - 1 && days <= 2) {
        reminders.push({ date: reminderDate.toISOString().split("T")[0], type: "email" });
        reminders.push({ date: reminderDate.toISOString().split("T")[0], type: "push" });
        reminders.push({ date: reminderDate.toISOString().split("T")[0], type: "in_app" });
      } else {
        reminders.push({ date: reminderDate.toISOString().split("T")[0], type: "email" });
      }
    }
  });
  
  // Always add deadline day reminders if in the future
  if (deadlineDate >= today && !reminders.some(r => r.date === deadline && r.type === "push")) {
    reminders.push({ date: deadline, type: "push" });
    reminders.push({ date: deadline, type: "in_app" });
  }
  
  return reminders;
};

/**
 * Get tasks with high affiliate potential (for prioritization)
 */
export const isHighValueTask = (taskId: string, taskTitle?: string): boolean => {
  const timing = getTaskReminderTiming(taskId, taskTitle);
  return timing.hasAffiliatePotential && timing.stressFactor >= 4;
};
