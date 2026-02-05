import { useState, useCallback, useEffect } from "react";
import { useGuestStorage } from "./useGuestStorage";
import { useAnonymousUser } from "./useAnonymousUser";

/**
 * PHONE-FIRST PASSWORDLESS AUTH FLOW
 * 
 * Flow:
 * 1. User starts as anonymous (anonymous_user_id in localStorage + cookie)
 * 2. All progress is tracked under anonymous_user_id
 * 3. After 2nd task: phone OTP dialog (soft, dismissible)
 * 4. After 5 tasks: hard block - must verify phone
 * 5. On OTP verification: merge anonymous data → authenticated user
 * 
 * No passwords, no email required for auth.
 */

type ModalAction = 
  | { type: "none" }
  | { type: "phone_otp"; isHardBlock: boolean };

export const usePhoneAuthFlow = (isLoggedIn: boolean) => {
  const storage = useGuestStorage();
  const { anonymousUserId, clearAnonymousUser, isInitialized } = useAnonymousUser();

  // Dialog state
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [isPhoneOTPHardBlock, setIsPhoneOTPHardBlock] = useState(false);

  // Check on mount if we need to show the dialog
  useEffect(() => {
    if (!isInitialized || isLoggedIn || storage.hasAccount()) return;
    
    const completedCount = storage.getCompletedTaskCount();
    
    // Hard block after 5 tasks
    if (completedCount >= storage.MAX_GUEST_TASKS) {
      setIsPhoneOTPHardBlock(true);
      setShowPhoneOTP(true);
    }
  }, [isInitialized, isLoggedIn, storage]);

  /**
   * Determine what modal action to show based on current state
   */
  const determineModalAction = useCallback((currentCompletedCount: number): ModalAction => {
    // If logged in or has account, no modals needed
    if (isLoggedIn || storage.hasAccount()) {
      return { type: "none" };
    }

    // HARD BLOCK: After 5 tasks, force phone verification
    if (currentCompletedCount >= storage.MAX_GUEST_TASKS) {
      return { type: "phone_otp", isHardBlock: true };
    }

    // SOFT PROMPT: After 2nd task
    if (currentCompletedCount === 2) {
      if (!storage.isPhonePromptShown()) {
        return { type: "phone_otp", isHardBlock: false };
      }
    }

    return { type: "none" };
  }, [isLoggedIn, storage]);

  /**
   * Check if user can complete a task
   */
  const canCompleteTask = useCallback((): boolean => {
    if (isLoggedIn || storage.hasAccount()) {
      return true;
    }
    
    const currentCount = storage.getCompletedTaskCount();
    
    // Block at task 6+
    if (currentCount >= storage.MAX_GUEST_TASKS) {
      return false;
    }
    
    return true;
  }, [isLoggedIn, storage]);

  /**
   * Called when user attempts to complete a task (BEFORE completion)
   * Returns true if task completion should proceed
   */
  const handleTaskAttempt = useCallback((): boolean => {
    if (isLoggedIn || storage.hasAccount()) {
      return true;
    }

    const currentCount = storage.getCompletedTaskCount();
    
    // Check if at limit
    if (currentCount >= storage.MAX_GUEST_TASKS) {
      setIsPhoneOTPHardBlock(true);
      setShowPhoneOTP(true);
      return false;
    }
    
    return true;
  }, [isLoggedIn, storage]);

  /**
   * Called AFTER a task is successfully completed
   */
  const handleTaskComplete = useCallback((): void => {
    if (isLoggedIn || storage.hasAccount()) {
      return;
    }

    // Increment completed task count
    const newCount = storage.incrementCompletedTaskCount();
    
    // Check if we need to show phone dialog
    const action = determineModalAction(newCount);
    
    if (action.type === "phone_otp") {
      setIsPhoneOTPHardBlock(action.isHardBlock);
      setShowPhoneOTP(true);
    }
  }, [isLoggedIn, storage, determineModalAction]);

  /**
   * Phone OTP: User verified successfully
   */
  const handlePhoneVerified = useCallback((userId: string, isNewUser: boolean) => {
    storage.setHasAccount(true);
    storage.setPhoneCaptured(true);
    storage.setPhonePromptShown(true);
    storage.setGuestLimitReached(false);
    
    // Clear anonymous user data
    clearAnonymousUser();
    
    setShowPhoneOTP(false);
    setIsPhoneOTPHardBlock(false);
  }, [storage, clearAnonymousUser]);

  /**
   * Phone OTP: User clicked "Later" / dismissed
   */
  const handlePhoneOTPDismiss = useCallback(() => {
    // Only allow dismiss for soft prompts
    if (isPhoneOTPHardBlock) return;
    
    storage.setPhonePromptShown(true);
    setShowPhoneOTP(false);
  }, [storage, isPhoneOTPHardBlock]);

  /**
   * Manual trigger for phone dialog (e.g., from badge click or settings)
   */
  const triggerPhoneDialog = useCallback(() => {
    if (isLoggedIn || storage.hasAccount()) return;
    
    setIsPhoneOTPHardBlock(false);
    setShowPhoneOTP(true);
  }, [isLoggedIn, storage]);

  /**
   * Check if user should see account badge reminder
   */
  const showAccountBadge = !isLoggedIn && 
    !storage.hasAccount() && 
    storage.getCompletedTaskCount() >= 3;

  return {
    // Phone OTP dialog
    showPhoneOTP,
    setShowPhoneOTP,
    isPhoneOTPHardBlock,
    handlePhoneVerified,
    handlePhoneOTPDismiss,
    
    // Anonymous user
    anonymousUserId,
    
    // Task handling
    canCompleteTask,
    handleTaskAttempt,
    handleTaskComplete,
    
    // Account badge
    showAccountBadge,
    triggerPhoneDialog,
    
    // Storage access for components
    storage,
  };
};
