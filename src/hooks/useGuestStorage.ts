import { useState, useEffect, useCallback } from "react";
import { MovingInfo } from "@/types/moving";

const STORAGE_KEYS = {
  MOVING_INFO: "lua_moving_info",
  GUEST_TASKS: "lua_guest_tasks",
  EMAIL_PROMPTED: "lua_email_prompted",
  SIGNUP_PROMPTED: "lua_signup_prompted",
  CAPTURED_EMAIL: "lua_captured_email",
  MILESTONES_CELEBRATED: "lua_milestones_celebrated",
  ACCOUNT_COMPLETE: "lua_account_complete",
} as const;

export const useGuestStorage = () => {
  const [movingInfo, setMovingInfoState] = useState<MovingInfo | null>(null);
  const [capturedEmail, setCapturedEmailState] = useState<string>("");

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
  }, []);

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

  const setCapturedEmail = useCallback((email: string) => {
    setCapturedEmailState(email);
    if (email) {
      localStorage.setItem(STORAGE_KEYS.CAPTURED_EMAIL, email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CAPTURED_EMAIL);
    }
  }, []);

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
    const tasks = getGuestTasks();
    return Object.values(tasks).filter((status) => status === "done").length;
  }, [getGuestTasks]);

  const isEmailPrompted = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.EMAIL_PROMPTED) === "true";
  }, []);

  const setEmailPrompted = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.EMAIL_PROMPTED, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.EMAIL_PROMPTED);
    }
  }, []);

  const getCelebratedMilestones = useCallback((): string[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.MILESTONES_CELEBRATED);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  const addCelebratedMilestone = useCallback((milestone: string) => {
    const milestones = getCelebratedMilestones();
    if (!milestones.includes(milestone)) {
      milestones.push(milestone);
      localStorage.setItem(STORAGE_KEYS.MILESTONES_CELEBRATED, JSON.stringify(milestones));
    }
  }, [getCelebratedMilestones]);

  const isAccountComplete = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ACCOUNT_COMPLETE) === "true";
  }, []);

  const setAccountComplete = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_COMPLETE, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT_COMPLETE);
    }
  }, []);

  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    setMovingInfoState(null);
    setCapturedEmailState("");
  }, []);

  return {
    // Moving info
    movingInfo,
    setMovingInfo,
    updateMovingInfo,
    
    // Email
    capturedEmail,
    setCapturedEmail,
    
    // Tasks
    getGuestTasks,
    setGuestTaskStatus,
    getCompletedTaskCount,
    
    // Prompts
    isEmailPrompted,
    setEmailPrompted,
    
    // Milestones
    getCelebratedMilestones,
    addCelebratedMilestone,
    
    // Account
    isAccountComplete,
    setAccountComplete,
    
    // Cleanup
    clearAllData,
  };
};
