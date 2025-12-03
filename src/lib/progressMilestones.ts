// Progress milestones and messaging for the reminder funnel

export type Milestone = {
  id: string;
  threshold: number; // percentage completed
  emoji: string;
  title: string;
  message: string;
  celebrationType: "confetti" | "badge" | "simple";
};

export const MILESTONES: Milestone[] = [
  {
    id: "first_task",
    threshold: 1, // First task (percentage will be calculated)
    emoji: "🎯",
    title: "Eerste stap gezet!",
    message: "Super! Je bent begonnen met je verhuischecklist.",
    celebrationType: "simple",
  },
  {
    id: "five_tasks",
    threshold: 5,
    emoji: "🏃",
    title: "Lekker op dreef!",
    message: "5 taken afgevinkt. Je bent goed bezig!",
    celebrationType: "badge",
  },
  {
    id: "twenty_percent",
    threshold: 20,
    emoji: "🎉",
    title: "20% verhuizing klaar!",
    message: "Een vijfde al gedaan. Blijf zo doorgaan!",
    celebrationType: "confetti",
  },
  {
    id: "halfway",
    threshold: 50,
    emoji: "🚀",
    title: "Halverwege!",
    message: "De helft van je verhuistaken is klaar. Fantastisch!",
    celebrationType: "confetti",
  },
  {
    id: "seventy_five",
    threshold: 75,
    emoji: "⭐",
    title: "Bijna klaar!",
    message: "Nog maar een kwart te gaan. De eindstreep is in zicht!",
    celebrationType: "confetti",
  },
  {
    id: "ninety_percent",
    threshold: 90,
    emoji: "🏆",
    title: "Laatste loodjes!",
    message: "90% gedaan. Je bent een verhuiskampioen!",
    celebrationType: "confetti",
  },
  {
    id: "completed",
    threshold: 100,
    emoji: "🎊",
    title: "Alles afgerond!",
    message: "Gefeliciteerd! Je verhuizing is volledig voorbereid.",
    celebrationType: "confetti",
  },
];

/**
 * Calculate progress and get current milestone
 */
export const calculateProgress = (completedTasks: number, totalTasks: number) => {
  if (totalTasks === 0) return { percentage: 0, milestone: null, nextMilestone: MILESTONES[0] };
  
  const percentage = Math.round((completedTasks / totalTasks) * 100);
  
  // Find current milestone (highest threshold we've passed)
  let currentMilestone: Milestone | null = null;
  let nextMilestone: Milestone | null = null;
  
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    const milestone = MILESTONES[i];
    if (milestone.id === "first_task") {
      if (completedTasks >= 1 && !currentMilestone) {
        currentMilestone = milestone;
      }
    } else if (milestone.id === "five_tasks") {
      if (completedTasks >= 5 && !currentMilestone) {
        currentMilestone = milestone;
      }
    } else if (percentage >= milestone.threshold && !currentMilestone) {
      currentMilestone = milestone;
    }
  }
  
  // Find next milestone
  for (const milestone of MILESTONES) {
    if (milestone.id === "first_task" && completedTasks < 1) {
      nextMilestone = milestone;
      break;
    } else if (milestone.id === "five_tasks" && completedTasks < 5) {
      nextMilestone = milestone;
      break;
    } else if (milestone.id !== "first_task" && milestone.id !== "five_tasks" && percentage < milestone.threshold) {
      nextMilestone = milestone;
      break;
    }
  }
  
  return { percentage, milestone: currentMilestone, nextMilestone };
};

/**
 * Check if a new milestone was reached
 */
export const checkNewMilestone = (
  previousCompleted: number,
  currentCompleted: number,
  totalTasks: number
): Milestone | null => {
  const prevProgress = calculateProgress(previousCompleted, totalTasks);
  const currProgress = calculateProgress(currentCompleted, totalTasks);
  
  if (currProgress.milestone && currProgress.milestone.id !== prevProgress.milestone?.id) {
    return currProgress.milestone;
  }
  
  return null;
};

/**
 * Get motivational message based on days until moving
 */
export const getTimeBasedMessage = (daysUntilMove: number, openTasks: number): string => {
  if (daysUntilMove <= 0) {
    return openTasks > 0 
      ? `Verhuisdag! Nog ${openTasks} taken open.`
      : "Verhuisdag! Alles is geregeld. 🎉";
  }
  
  if (daysUntilMove <= 3) {
    return `📦 Nog ${daysUntilMove} dag${daysUntilMove === 1 ? "" : "en"} en ${openTasks} taken`;
  }
  
  if (daysUntilMove <= 7) {
    return `Deze week verhuizen! ${openTasks} taken te gaan`;
  }
  
  if (daysUntilMove <= 14) {
    return `Nog 2 weken. ${openTasks} taken open`;
  }
  
  return `${openTasks} taken voor je verhuizing`;
};

/**
 * Calculate potential savings based on task categories
 */
export const calculatePotentialSavings = (openTaskIds: string[]): number => {
  let totalSavings = 0;
  
  const savingsMap: Record<string, number> = {
    "energie": 400,
    "gas": 200,
    "stroom": 200,
    "internet": 150,
    "verzekering": 100,
    "inboedelverzekering": 100,
  };
  
  for (const taskId of openTaskIds) {
    const lowerTaskId = taskId.toLowerCase();
    for (const [keyword, savings] of Object.entries(savingsMap)) {
      if (lowerTaskId.includes(keyword)) {
        totalSavings += savings;
        break;
      }
    }
  }
  
  return totalSavings;
};
