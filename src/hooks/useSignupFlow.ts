import { useState, useCallback, useEffect } from "react";
import { useGuestStorage } from "./useGuestStorage";

/**
 * PHASED ACCOUNT CREATION FLOW
 * 
 * Flow:
 * 1. After task 1: Phone capture (soft, dismissible) - pre-account profile
 * 2. After task 2: Full account creation with email + password (soft, deferrable if phone captured)
 * 3. After task 5: Hard block - must create account to continue
 * 
 * The user profile is the single source of truth for all personal data.
 */

type ModalAction = 
  | { type: "none" }
  | { type: "phone_capture"; isHardBlock: boolean }
  | { type: "account_creation"; isHardBlock: boolean };

export const useSignupFlow = (isLoggedIn: boolean) => {
  const storage = useGuestStorage();

  // Dialog states
  const [showPhoneCapture, setShowPhoneCapture] = useState(false);
  const [isPhoneHardBlock, setIsPhoneHardBlock] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [isAccountHardBlock, setIsAccountHardBlock] = useState(false);

  // Check on mount if account creation was started but not completed
  useEffect(() => {
    if (isLoggedIn || storage.hasAccount()) return;
    
    // If account creation was started but not completed, force show the dialog
    if (storage.isAccountCreationStarted() && !storage.isAccountCreationCompleted()) {
      setIsAccountHardBlock(true);
      setShowAccountCreation(true);
    }
  }, [isLoggedIn, storage]);

  /**
   * Determine what modal action to show based on current state
   */
  const determineModalAction = useCallback((currentCompletedCount: number): ModalAction => {
    // If logged in or has account, no modals needed
    if (isLoggedIn || storage.hasAccount()) {
      return { type: "none" };
    }

    // If account creation started but not completed, force account creation
    if (storage.isAccountCreationStarted() && !storage.isAccountCreationCompleted()) {
      return { type: "account_creation", isHardBlock: true };
    }

    const completedCount = currentCompletedCount;

    // HARD BLOCK: After 5 tasks, force account creation
    if (completedCount > storage.MAX_GUEST_TASKS) {
      // If no phone captured yet, need phone first
      if (!storage.isPhoneCaptured()) {
        return { type: "phone_capture", isHardBlock: true };
      }
      // Otherwise force account creation
      return { type: "account_creation", isHardBlock: true };
    }

    // STEP 1: After first task - phone capture (soft)
    if (completedCount === 1) {
      if (!storage.isPhoneCaptured() && !storage.isPhonePromptShown()) {
        return { type: "phone_capture", isHardBlock: false };
      }
    }

    // STEP 2: After second task - account creation (soft)
    if (completedCount === 2) {
      if (
        storage.isPhoneCaptured() && 
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
   */
  const canCompleteTask = useCallback((): boolean => {
    if (isLoggedIn || storage.hasAccount()) {
      return true;
    }
    
    // Block if account creation started but not completed
    if (storage.isAccountCreationStarted() && !storage.isAccountCreationCompleted()) {
      return false;
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
   */
  const handleTaskAttempt = useCallback((): boolean => {
    if (isLoggedIn || storage.hasAccount()) {
      return true;
    }

    // If account creation started but not completed, block and show dialog
    if (storage.isAccountCreationStarted() && !storage.isAccountCreationCompleted()) {
      setIsAccountHardBlock(true);
      setShowAccountCreation(true);
      return false;
    }

    const currentCount = storage.getCompletedTaskCount();
    const action = determineModalAction(currentCount);

    switch (action.type) {
      case "phone_capture":
        setIsPhoneHardBlock(action.isHardBlock);
        setShowPhoneCapture(true);
        return false;
        
      case "account_creation":
        setIsAccountHardBlock(action.isHardBlock);
        setShowAccountCreation(true);
        return false;
        
      default:
        return true;
    }
  }, [isLoggedIn, storage, determineModalAction]);

  /**
   * Called AFTER a task is successfully completed
   */
  const handleTaskComplete = useCallback((): void => {
    if (isLoggedIn || storage.hasAccount()) {
      return;
    }

    // Increment completed task count
    const newCount = storage.incrementCompletedTaskCount();
    
    // Check if we need to show a modal after this completion
    const action = determineModalAction(newCount);
    
    if (action.type === "phone_capture") {
      setIsPhoneHardBlock(action.isHardBlock);
      setShowPhoneCapture(true);
    } else if (action.type === "account_creation") {
      setIsAccountHardBlock(action.isHardBlock);
      setShowAccountCreation(true);
    }
  }, [isLoggedIn, storage, determineModalAction]);

  /**
   * Phone modal: User submitted phone
   */
  const handlePhoneSubmit = useCallback((phone: string) => {
    storage.setCapturedPhone(phone);
    storage.setPhonePromptShown(true);
    storage.setPhoneCaptured(true);
    setShowPhoneCapture(false);

    // If this was a hard block, immediately show account creation
    if (isPhoneHardBlock) {
      setIsPhoneHardBlock(false);
      setTimeout(() => {
        setIsAccountHardBlock(true);
        setShowAccountCreation(true);
      }, 100);
    }
  }, [storage, isPhoneHardBlock]);

  /**
   * Phone modal: User clicked "Later" / dismissed
   */
  const handlePhoneDismiss = useCallback(() => {
    storage.setPhonePromptShown(true);
    storage.setPhonePromptDismissed(true);
    setShowPhoneCapture(false);
  }, [storage]);

  /**
   * Account modal: User created account
   */
  const handleAccountCreated = useCallback(() => {
    storage.setHasAccount(true);
    storage.setAccountPromptShown(true);
    storage.setGuestLimitReached(false);
    storage.setAccountCreationCompleted(true);
    setShowAccountCreation(false);
    setIsAccountHardBlock(false);
  }, [storage]);

  /**
   * Account modal: User clicked "Later" / deferred
   */
  const handleAccountDefer = useCallback(() => {
    // Never allow defer if account creation has started
    if (storage.isAccountCreationStarted()) {
      return;
    }
    
    // Only allow defer for non-hard-block modals
    if (!isAccountHardBlock) {
      storage.setAccountPromptShown(true);
      storage.setAccountPromptDeferred(true);
      setShowAccountCreation(false);
    }
  }, [storage, isAccountHardBlock]);

  /**
   * Manual trigger for signup flow (e.g., from badge click)
   */
  const handleBadgeClick = useCallback(() => {
    if (isLoggedIn || storage.hasAccount()) {
      return;
    }
    
    if (storage.isPhoneCaptured()) {
      setIsAccountHardBlock(false);
      setShowAccountCreation(true);
    } else {
      setIsPhoneHardBlock(false);
      setShowPhoneCapture(true);
    }
  }, [isLoggedIn, storage]);

  /**
   * Check if user should see account badge reminder
   */
  const showAccountBadge = !isLoggedIn && 
    !storage.hasAccount() && 
    storage.getCompletedTaskCount() >= 3;

  return {
    // Phone capture dialog
    showPhoneCapture,
    setShowPhoneCapture,
    isPhoneHardBlock,
    handlePhoneSubmit,
    handlePhoneDismiss,
    
    // Account creation dialog
    showAccountCreation,
    setShowAccountCreation,
    isAccountHardBlock,
    handleAccountCreated,
    handleAccountDefer,
    
    // Task handling
    canCompleteTask,
    handleTaskAttempt,
    handleTaskComplete,
    
    // Account badge
    showAccountBadge,
    handleBadgeClick,
    
    // Captured data
    capturedPhone: storage.capturedPhone,
    
    // Storage access for components
    storage,
  };
};
