import { useState, useCallback } from "react";
import { useGuestStorage } from "./useGuestStorage";

/**
 * STRICT GATED ACCOUNT CREATION FLOW
 * 
 * Flow:
 * 1. After task 1: Email capture (soft, dismissible)
 * 2. After task 2: Account creation prompt (soft, deferrable - if email captured)
 * 3. After task 5: Hard block - must create account to continue
 * 
 * Guards:
 * - Email modal NEVER shows again after dismiss/submit
 * - Account modal NEVER shows again after defer (except hard block at task 6)
 * - Once account created, ALL modals disabled forever
 */

type ModalAction = 
  | { type: "none" }
  | { type: "email_capture"; isHardBlock: boolean }
  | { type: "account_creation"; isHardBlock: boolean };

export const useSignupFlow = (isLoggedIn: boolean) => {
  const storage = useGuestStorage();

  // Dialog states
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isEmailHardBlock, setIsEmailHardBlock] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [isSignupHardBlock, setIsSignupHardBlock] = useState(false);

  /**
   * Determine what modal action to show based on current state
   * This is called BEFORE completing a task
   */
  const determineModalAction = useCallback((currentCompletedCount: number): ModalAction => {
    // If logged in or has account, no modals needed
    if (isLoggedIn || storage.hasAccount()) {
      return { type: "none" };
    }

    const willBeCount = currentCompletedCount + 1;

    // HARD BLOCK: At task 6 (after 5 completed), force account creation
    if (willBeCount > storage.MAX_GUEST_TASKS) {
      // If no email captured, need email first
      if (!storage.isEmailCaptured()) {
        return { type: "email_capture", isHardBlock: true };
      }
      // Otherwise force account creation
      return { type: "account_creation", isHardBlock: true };
    }

    // STEP 1: After first task - email capture (soft)
    if (willBeCount === 1) {
      // Only show if: not captured, not already shown
      if (!storage.isEmailCaptured() && !storage.isEmailPromptShown()) {
        return { type: "email_capture", isHardBlock: false };
      }
    }

    // STEP 2: After second task - account creation (soft)
    if (willBeCount === 2) {
      // Only show if: email captured AND not already shown AND not deferred
      if (
        storage.isEmailCaptured() && 
        !storage.isAccountPromptShown() && 
        !storage.isAccountPromptDeferred()
      ) {
        return { type: "account_creation", isHardBlock: false };
      }
    }

    return { type: "none" };
  }, [isLoggedIn, storage]);

  /**
   * Check if user can complete a task
   * Returns true if task can be completed immediately
   * Returns false if a modal needs to be shown first
   */
  const canCompleteTask = useCallback((): boolean => {
    if (isLoggedIn || storage.hasAccount()) {
      return true;
    }
    
    const currentCount = storage.getCompletedTaskCount();
    
    // Block at task 6
    if (currentCount >= storage.MAX_GUEST_TASKS) {
      return false;
    }
    
    return true;
  }, [isLoggedIn, storage]);

  /**
   * Called when user attempts to complete a task
   * Returns true if task completion should proceed
   * Returns false if a modal was shown (task completion should wait)
   */
  const handleTaskAttempt = useCallback((): boolean => {
    if (isLoggedIn || storage.hasAccount()) {
      return true;
    }

    const currentCount = storage.getCompletedTaskCount();
    const action = determineModalAction(currentCount);

    switch (action.type) {
      case "email_capture":
        setIsEmailHardBlock(action.isHardBlock);
        setShowEmailCapture(true);
        return false;
        
      case "account_creation":
        setIsSignupHardBlock(action.isHardBlock);
        setShowSignupPrompt(true);
        return false;
        
      default:
        return true;
    }
  }, [isLoggedIn, storage, determineModalAction]);

  /**
   * Called AFTER a task is successfully completed
   * Handles post-completion modal logic
   */
  const handleTaskComplete = useCallback((): void => {
    if (isLoggedIn || storage.hasAccount()) {
      return;
    }

    // Increment completed task count
    const newCount = storage.incrementCompletedTaskCount();
    
    // Check if we need to show a modal after this completion
    const action = determineModalAction(newCount);
    
    if (action.type === "email_capture") {
      setIsEmailHardBlock(action.isHardBlock);
      setShowEmailCapture(true);
    } else if (action.type === "account_creation") {
      setIsSignupHardBlock(action.isHardBlock);
      setShowSignupPrompt(true);
    }
  }, [isLoggedIn, storage, determineModalAction]);

  /**
   * Email modal: User submitted email
   */
  const handleEmailSubmit = useCallback((email: string, phone?: string) => {
    storage.setCapturedEmail(email);
    if (phone) {
      storage.setCapturedPhone(phone);
    }
    storage.setEmailPromptShown(true);
    setShowEmailCapture(false);

    // If this was a hard block, immediately show account creation
    if (isEmailHardBlock) {
      setIsEmailHardBlock(false);
      setTimeout(() => {
        setIsSignupHardBlock(true);
        setShowSignupPrompt(true);
      }, 100);
    }
  }, [storage, isEmailHardBlock]);

  /**
   * Email modal: User clicked "Later" / dismissed
   */
  const handleEmailDismiss = useCallback(() => {
    storage.setEmailPromptShown(true);
    storage.setEmailPromptDismissed(true);
    setShowEmailCapture(false);
  }, [storage]);

  /**
   * Account modal: User created account
   */
  const handleSignupComplete = useCallback(() => {
    storage.setHasAccount(true);
    storage.setAccountPromptShown(true);
    storage.setGuestLimitReached(false);
    setShowSignupPrompt(false);
    setIsSignupHardBlock(false);
    
    // Clear captured email since account is now created
    storage.setCapturedEmail("");
  }, [storage]);

  /**
   * Account modal: User clicked "Later" / deferred
   * CRITICAL: This should NEVER be called for hard blocks
   */
  const handleSignupDefer = useCallback(() => {
    // Only allow defer for non-hard-block modals
    if (!isSignupHardBlock) {
      storage.setAccountPromptShown(true);
      storage.setAccountPromptDeferred(true);
      setShowSignupPrompt(false);
    }
  }, [storage, isSignupHardBlock]);

  /**
   * Manual trigger for signup flow (e.g., from badge click)
   */
  const handleBadgeClick = useCallback(() => {
    if (isLoggedIn || storage.hasAccount()) {
      return;
    }
    
    if (storage.isEmailCaptured()) {
      setIsSignupHardBlock(false);
      setShowSignupPrompt(true);
    } else {
      setIsEmailHardBlock(false);
      setShowEmailCapture(true);
    }
  }, [isLoggedIn, storage]);

  /**
   * Check if user should see account badge reminder
   */
  const showAccountBadge = !isLoggedIn && 
    !storage.hasAccount() && 
    storage.getCompletedTaskCount() >= 3;

  return {
    // Email capture dialog
    showEmailCapture,
    setShowEmailCapture,
    isEmailHardBlock,
    handleEmailSubmit,
    handleEmailDismiss,
    
    // Signup prompt
    showSignupPrompt,
    setShowSignupPrompt,
    isSignupHardBlock,
    handleSignupComplete,
    handleSignupDefer,
    
    // Task handling
    canCompleteTask,
    handleTaskAttempt,
    handleTaskComplete,
    
    // Account badge
    showAccountBadge,
    handleBadgeClick,
    
    // Email
    capturedEmail: storage.capturedEmail,
    
    // Storage access for components
    storage,
  };
};
