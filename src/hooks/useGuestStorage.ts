import { useState, useEffect, useCallback } from "react";
import { MovingInfo } from "@/types/moving";

/**
 * STRICT ACCOUNT FLOW STATE FLAGS
 * All flags persist in localStorage
 */
const STORAGE_KEYS = {
  // Core data
  MOVING_INFO: "lua_moving_info",
  GUEST_TASKS: "lua_guest_tasks",
  
  // Account state
  HAS_ACCOUNT: "lua_has_account",
  COMPLETED_TASK_COUNT: "lua_completed_task_count",
  
  // Phone capture state (Step 1 - new flow)
  PHONE_CAPTURED: "lua_phone_captured",
  PHONE_PROMPT_SHOWN: "lua_phone_prompt_shown",
  PHONE_PROMPT_DISMISSED: "lua_phone_prompt_dismissed",
  CAPTURED_PHONE: "lua_captured_phone",
  
  // Email capture state (legacy, keeping for compatibility)
  EMAIL_CAPTURED: "lua_email_captured",
  EMAIL_PROMPT_SHOWN: "lua_email_prompt_shown",
  EMAIL_PROMPT_DISMISSED: "lua_email_prompt_dismissed",
  CAPTURED_EMAIL: "lua_captured_email",
  
  // Account creation state (Step 2)
  ACCOUNT_PROMPT_SHOWN: "lua_account_prompt_shown",
  ACCOUNT_PROMPT_DEFERRED: "lua_account_prompt_deferred",
  ACCOUNT_CREATION_STARTED: "lua_account_creation_started",
  ACCOUNT_CREATION_COMPLETED: "lua_account_creation_completed",
  
  // Guest limit state
  GUEST_LIMIT_REACHED: "lua_guest_limit_reached",
} as const;

// Maximum tasks a guest can complete before forced account creation
const MAX_GUEST_TASKS = 5;

export const useGuestStorage = () => {
  const [movingInfo, setMovingInfoState] = useState<MovingInfo | null>(null);
  const [capturedEmail, setCapturedEmailState] = useState<string>("");
  const [capturedPhone, setCapturedPhoneState] = useState<string>("");

  // Load data on mount
  useEffect(() => {
    const savedInfo = localStorage.getItem(STORAGE_KEYS.MOVING_INFO);
    if (savedInfo) {
      try {
        setMovingInfoState(JSON.parse(savedInfo));
      } catch {
        // Invalid JSON, ignore
      }
    }

    const savedEmail = localStorage.getItem(STORAGE_KEYS.CAPTURED_EMAIL);
    if (savedEmail) {
      setCapturedEmailState(savedEmail);
    }

    const savedPhone = localStorage.getItem(STORAGE_KEYS.CAPTURED_PHONE);
    if (savedPhone) {
      setCapturedPhoneState(savedPhone);
    }
  }, []);

  // === MOVING INFO ===
  const setMovingInfo = useCallback((info: MovingInfo | null) => {
    setMovingInfoState(info);
    if (info) {
      localStorage.setItem(STORAGE_KEYS.MOVING_INFO, JSON.stringify(info));
    } else {
      localStorage.removeItem(STORAGE_KEYS.MOVING_INFO);
    }
  }, []);

  const updateMovingInfo = useCallback((data: Partial<MovingInfo>) => {
    setMovingInfoState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEYS.MOVING_INFO, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // === EMAIL & PHONE ===
  const setCapturedEmail = useCallback((email: string) => {
    setCapturedEmailState(email);
    if (email) {
      localStorage.setItem(STORAGE_KEYS.CAPTURED_EMAIL, email);
      localStorage.setItem(STORAGE_KEYS.EMAIL_CAPTURED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.CAPTURED_EMAIL);
      localStorage.removeItem(STORAGE_KEYS.EMAIL_CAPTURED);
    }
  }, []);

  const setCapturedPhone = useCallback((phone: string) => {
    setCapturedPhoneState(phone);
    if (phone) {
      localStorage.setItem(STORAGE_KEYS.CAPTURED_PHONE, phone);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CAPTURED_PHONE);
    }
  }, []);

  const isEmailCaptured = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.EMAIL_CAPTURED) === "true";
  }, []);

  // === GUEST TASKS ===
  const getGuestTasks = useCallback((): Record<string, "todo" | "in_progress" | "done"> => {
    const saved = localStorage.getItem(STORAGE_KEYS.GUEST_TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  }, []);

  const setGuestTaskStatus = useCallback((taskId: string, status: "todo" | "in_progress" | "done") => {
    const tasks = getGuestTasks();
    tasks[taskId] = status;
    localStorage.setItem(STORAGE_KEYS.GUEST_TASKS, JSON.stringify(tasks));
  }, [getGuestTasks]);

  const getCompletedTaskCount = useCallback((): number => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASK_COUNT);
    return saved ? parseInt(saved, 10) : 0;
  }, []);

  const setCompletedTaskCount = useCallback((count: number) => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASK_COUNT, count.toString());
  }, []);

  const incrementCompletedTaskCount = useCallback((): number => {
    const current = getCompletedTaskCount();
    const newCount = current + 1;
    setCompletedTaskCount(newCount);
    return newCount;
  }, [getCompletedTaskCount, setCompletedTaskCount]);

  // === ACCOUNT STATE FLAGS ===
  const hasAccount = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.HAS_ACCOUNT) === "true";
  }, []);

  const setHasAccount = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.HAS_ACCOUNT, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.HAS_ACCOUNT);
    }
  }, []);

  // === PHONE PROMPT FLAGS (Step 1 - new flow) ===
  const isPhoneCaptured = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.PHONE_CAPTURED) === "true";
  }, []);

  const setPhoneCaptured = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.PHONE_CAPTURED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.PHONE_CAPTURED);
    }
  }, []);

  const isPhonePromptShown = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.PHONE_PROMPT_SHOWN) === "true";
  }, []);

  const setPhonePromptShown = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.PHONE_PROMPT_SHOWN, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.PHONE_PROMPT_SHOWN);
    }
  }, []);

  const isPhonePromptDismissed = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.PHONE_PROMPT_DISMISSED) === "true";
  }, []);

  const setPhonePromptDismissed = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.PHONE_PROMPT_DISMISSED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.PHONE_PROMPT_DISMISSED);
    }
  }, []);

  // === EMAIL PROMPT FLAGS (legacy, keeping for compatibility) ===
  const isEmailPromptShown = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.EMAIL_PROMPT_SHOWN) === "true";
  }, []);

  const setEmailPromptShown = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.EMAIL_PROMPT_SHOWN, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.EMAIL_PROMPT_SHOWN);
    }
  }, []);

  const isEmailPromptDismissed = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.EMAIL_PROMPT_DISMISSED) === "true";
  }, []);

  const setEmailPromptDismissed = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.EMAIL_PROMPT_DISMISSED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.EMAIL_PROMPT_DISMISSED);
    }
  }, []);

  // === ACCOUNT PROMPT FLAGS (Step 2) ===
  const isAccountPromptShown = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ACCOUNT_PROMPT_SHOWN) === "true";
  }, []);

  const setAccountPromptShown = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_PROMPT_SHOWN, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT_PROMPT_SHOWN);
    }
  }, []);

  const isAccountPromptDeferred = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ACCOUNT_PROMPT_DEFERRED) === "true";
  }, []);

  const setAccountPromptDeferred = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_PROMPT_DEFERRED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT_PROMPT_DEFERRED);
    }
  }, []);

  // === ACCOUNT CREATION STATE (Critical for flow) ===
  const isAccountCreationStarted = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ACCOUNT_CREATION_STARTED) === "true";
  }, []);

  const setAccountCreationStarted = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_CREATION_STARTED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT_CREATION_STARTED);
    }
  }, []);

  const isAccountCreationCompleted = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ACCOUNT_CREATION_COMPLETED) === "true";
  }, []);

  const setAccountCreationCompleted = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_CREATION_COMPLETED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT_CREATION_COMPLETED);
    }
  }, []);

  // === GUEST LIMIT FLAGS ===
  const isGuestLimitReached = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.GUEST_LIMIT_REACHED) === "true";
  }, []);

  const setGuestLimitReached = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.GUEST_LIMIT_REACHED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.GUEST_LIMIT_REACHED);
    }
  }, []);

  const canCompleteMoreTasks = useCallback((): boolean => {
    if (hasAccount()) return true;
    // CRITICAL: Block task completion if account creation started but not completed
    if (isAccountCreationStarted() && !isAccountCreationCompleted()) return false;
    return getCompletedTaskCount() < MAX_GUEST_TASKS;
  }, [hasAccount, getCompletedTaskCount, isAccountCreationStarted, isAccountCreationCompleted]);

  // === CLEANUP ===
  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    setMovingInfoState(null);
    setCapturedEmailState("");
    setCapturedPhoneState("");
  }, []);

  return {
    // Moving info
    movingInfo,
    setMovingInfo,
    updateMovingInfo,
    
    // Email & Phone
    capturedEmail,
    setCapturedEmail,
    capturedPhone,
    setCapturedPhone,
    isEmailCaptured,
    
    // Tasks
    getGuestTasks,
    setGuestTaskStatus,
    getCompletedTaskCount,
    setCompletedTaskCount,
    incrementCompletedTaskCount,
    
    // Account state
    hasAccount,
    setHasAccount,
    
    // Phone prompt flags (Step 1 - new flow)
    isPhoneCaptured,
    setPhoneCaptured,
    isPhonePromptShown,
    setPhonePromptShown,
    isPhonePromptDismissed,
    setPhonePromptDismissed,
    
    // Email prompt flags (legacy)
    isEmailPromptShown,
    setEmailPromptShown,
    isEmailPromptDismissed,
    setEmailPromptDismissed,
    
    // Account prompt flags (Step 2)
    isAccountPromptShown,
    setAccountPromptShown,
    isAccountPromptDeferred,
    setAccountPromptDeferred,
    
    // Account creation flow state (Critical)
    isAccountCreationStarted,
    setAccountCreationStarted,
    isAccountCreationCompleted,
    setAccountCreationCompleted,
    
    // Guest limit
    isGuestLimitReached,
    setGuestLimitReached,
    canCompleteMoreTasks,
    MAX_GUEST_TASKS,
    
    // Cleanup
    clearAllData,
  };
};