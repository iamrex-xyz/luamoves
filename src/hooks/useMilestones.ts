import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { checkNewMilestone, Milestone } from "@/lib/progressMilestones";
import { trackEvent } from "@/lib/analytics";

const CELEBRATED_MILESTONES_KEY = "charly_celebrated_milestones";

export const useMilestones = (completedTasks: number, totalTasks: number) => {
  const { toast } = useToast();
  const previousCompletedRef = useRef(completedTasks);

  // Load celebrated milestones from localStorage
  const getCelebratedMilestones = useCallback((): string[] => {
    try {
      return JSON.parse(localStorage.getItem(CELEBRATED_MILESTONES_KEY) || "[]");
    } catch {
      return [];
    }
  }, []);

  // Save celebrated milestone
  const saveCelebratedMilestone = useCallback((milestoneId: string) => {
    const celebrated = getCelebratedMilestones();
    if (!celebrated.includes(milestoneId)) {
      celebrated.push(milestoneId);
      localStorage.setItem(CELEBRATED_MILESTONES_KEY, JSON.stringify(celebrated));
    }
  }, [getCelebratedMilestones]);

  // Check and celebrate new milestones
  useEffect(() => {
    const previousCompleted = previousCompletedRef.current;
    
    // Only check if tasks increased (not on initial load or decrease)
    if (completedTasks > previousCompleted && totalTasks > 0) {
      const newMilestone = checkNewMilestone(previousCompleted, completedTasks, totalTasks);
      
      if (newMilestone) {
        const celebrated = getCelebratedMilestones();
        
        // Only celebrate if not already celebrated
        if (!celebrated.includes(newMilestone.id)) {
          // Track analytics
          trackEvent("milestoneReached", { 
            milestoneId: newMilestone.id,
            completedTasks,
            totalTasks,
          });

          // Show celebration toast
          toast({
            title: `${newMilestone.emoji} ${newMilestone.title}`,
            description: newMilestone.message,
            duration: 5000,
          });

          // Save as celebrated
          saveCelebratedMilestone(newMilestone.id);

          // Trigger confetti for special milestones
          if (newMilestone.celebrationType === "confetti") {
            triggerConfetti();
          }
        }
      }
    }
    
    previousCompletedRef.current = completedTasks;
  }, [completedTasks, totalTasks, toast, getCelebratedMilestones, saveCelebratedMilestone]);

  return {
    resetMilestones: () => {
      localStorage.removeItem(CELEBRATED_MILESTONES_KEY);
    },
  };
};

// Simple confetti effect using CSS animations
const triggerConfetti = () => {
  const confettiContainer = document.createElement("div");
  confettiContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  
  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 0.5;
    const size = Math.random() * 10 + 5;
    
    confetti.style.cssText = `
      position: absolute;
      top: -20px;
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
      animation: confetti-fall 3s ease-out ${animationDelay}s forwards;
    `;
    
    confettiContainer.appendChild(confetti);
  }
  
  // Add keyframes if not already present
  if (!document.getElementById("confetti-keyframes")) {
    const style = document.createElement("style");
    style.id = "confetti-keyframes";
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(confettiContainer);
  
  // Remove after animation
  setTimeout(() => {
    confettiContainer.remove();
  }, 4000);
};
