import { useState, useCallback } from "react";
import { useGuestStorage } from "./useGuestStorage";

type MilestoneType = "five_tasks" | "halfway";

export const useSignupFlow = (isLoggedIn: boolean) => {
  const {
    capturedEmail,
    setCapturedEmail,
    isEmailPrompted,
    setEmailPrompted,
    getCelebratedMilestones,
    addCelebratedMilestone,
    isAccountComplete,
    setAccountComplete,
    getCompletedTaskCount,
  } = useGuestStorage();

  // Dialog states
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isEmailHardBlock, setIsEmailHardBlock] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneCelebrationType, setMilestoneCelebrationType] = useState<MilestoneType>("five_tasks");
  const [showAccountBadge, setShowAccountBadge] = useState(false);

  const handleTaskComplete = useCallback((completedCount: number, totalTasks?: number) => {
    // Skip if logged in
    if (isLoggedIn) return;

    // Reset account complete flag if not logged in
    if (isAccountComplete()) {
      setAccountComplete(false);
    }

    const celebratedMilestones = getCelebratedMilestones();

    // Check for 50% milestone
    if (totalTasks && totalTasks > 0) {
      const percentage = (completedCount / totalTasks) * 100;
      if (percentage >= 50 && !celebratedMilestones.includes("halfway")) {
        addCelebratedMilestone("halfway");
        setMilestoneCelebrationType("halfway");
        setShowMilestoneCelebration(true);
        return;
      }
    }

    // Check for 5 tasks milestone
    if (completedCount >= 5 && !celebratedMilestones.includes("five_tasks")) {
      addCelebratedMilestone("five_tasks");
      setMilestoneCelebrationType("five_tasks");
      setShowMilestoneCelebration(true);
      return;
    }

    // After 2nd task - show signup dialog (hard blocking)
    if (completedCount >= 2) {
      if (capturedEmail) {
        setShowSignupPrompt(true);
      } else {
        setIsEmailHardBlock(true);
        setShowEmailCapture(true);
      }
      return;
    }

    // After 1st task - show email capture dialog (soft)
    if (completedCount >= 1 && !isEmailPrompted()) {
      setEmailPrompted(true);
      setIsEmailHardBlock(false);
      setShowEmailCapture(true);
      return;
    }
  }, [isLoggedIn, capturedEmail, isEmailPrompted, setEmailPrompted, getCelebratedMilestones, addCelebratedMilestone, isAccountComplete, setAccountComplete]);

  const handleEmailSubmit = useCallback((email: string) => {
    setCapturedEmail(email);
    setShowEmailCapture(false);

    // If hard block, immediately show signup
    if (isEmailHardBlock) {
      setIsEmailHardBlock(false);
      setTimeout(() => {
        setShowSignupPrompt(true);
      }, 100);
    }
  }, [setCapturedEmail, isEmailHardBlock]);

  const handleSignupComplete = useCallback(() => {
    setShowSignupPrompt(false);
    setShowAccountBadge(false);
    setCapturedEmail("");
    setAccountComplete(true);
  }, [setCapturedEmail, setAccountComplete]);

  const handleMilestoneSignup = useCallback(() => {
    setShowMilestoneCelebration(false);
    if (capturedEmail) {
      setShowSignupPrompt(true);
    } else {
      setShowEmailCapture(true);
    }
  }, [capturedEmail]);

  const handleBadgeClick = useCallback(() => {
    if (capturedEmail) {
      setShowSignupPrompt(true);
    } else {
      setShowEmailCapture(true);
    }
  }, [capturedEmail]);

  return {
    // Email capture dialog
    showEmailCapture,
    setShowEmailCapture,
    isEmailHardBlock,
    handleEmailSubmit,
    
    // Signup prompt
    showSignupPrompt,
    setShowSignupPrompt,
    handleSignupComplete,
    
    // Milestone celebration
    showMilestoneCelebration,
    setShowMilestoneCelebration,
    milestoneCelebrationType,
    handleMilestoneSignup,
    
    // Account badge
    showAccountBadge,
    setShowAccountBadge,
    handleBadgeClick,
    
    // Task complete handler
    handleTaskComplete,
    
    // Email
    capturedEmail,
  };
};
