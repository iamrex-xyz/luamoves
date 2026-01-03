import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SEEN_ASSIGNMENTS_KEY = "lua_seen_task_assignments";

type AssignmentInfo = {
  taskId: string;
  assignedTo: string | null | undefined;
  assignedToEmail: string | null | undefined;
  assignedBy: string | null | undefined;
  assignedAt: string | null | undefined;
};

export const useAssignmentNotifications = () => {
  const [seenAssignments, setSeenAssignments] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load seen assignments from localStorage
  useEffect(() => {
    const loadSeenAssignments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const stored = localStorage.getItem(`${SEEN_ASSIGNMENTS_KEY}_${user.id}`);
        if (stored) {
          try {
            setSeenAssignments(new Set(JSON.parse(stored)));
          } catch {
            setSeenAssignments(new Set());
          }
        }
      }
      setInitialLoadComplete(true);
    };
    loadSeenAssignments();
  }, []);

  // Create a unique key for an assignment based on taskId and assignedAt
  const getAssignmentKey = useCallback((taskId: string, assignedAt: string | null | undefined): string => {
    return `${taskId}:${assignedAt || 'unknown'}`;
  }, []);

  /**
   * Check if a task assignment should show a notification.
   * Only returns true when:
   * 1. The task is assigned TO the current user (assignedTo matches currentUserId)
   * 2. The assignment was made BY someone else (assignedBy !== currentUserId)
   * 3. The assignment hasn't been seen yet
   * 4. Initial load is complete (prevent notifications on page load)
   */
  const isNewAssignment = useCallback((info: AssignmentInfo): boolean => {
    if (!initialLoadComplete || !currentUserId) return false;
    
    const { taskId, assignedTo, assignedBy, assignedAt } = info;
    
    // Must be assigned to the current user
    if (assignedTo !== currentUserId) return false;
    
    // Must be assigned by someone else (not self-assignment)
    if (!assignedBy || assignedBy === currentUserId) return false;
    
    // Check if we've already seen this assignment
    const assignmentKey = getAssignmentKey(taskId, assignedAt);
    return !seenAssignments.has(assignmentKey);
  }, [seenAssignments, currentUserId, initialLoadComplete, getAssignmentKey]);

  // Mark a task assignment as seen
  const markAssignmentSeen = useCallback((taskId: string, assignedAt: string | null | undefined) => {
    if (!currentUserId) return;
    
    const assignmentKey = getAssignmentKey(taskId, assignedAt);
    
    setSeenAssignments(prev => {
      const newSet = new Set(prev);
      newSet.add(assignmentKey);
      // Persist to localStorage
      localStorage.setItem(
        `${SEEN_ASSIGNMENTS_KEY}_${currentUserId}`,
        JSON.stringify([...newSet])
      );
      return newSet;
    });
  }, [currentUserId, getAssignmentKey]);

  // Mark all current assignments as seen (for initial load)
  const markAllCurrentAssignmentsSeen = useCallback((assignments: Array<{ taskId: string; assignedAt: string | null | undefined }>) => {
    if (!currentUserId) return;
    
    setSeenAssignments(prev => {
      const newSet = new Set(prev);
      assignments.forEach(({ taskId, assignedAt }) => {
        newSet.add(getAssignmentKey(taskId, assignedAt));
      });
      // Persist to localStorage
      localStorage.setItem(
        `${SEEN_ASSIGNMENTS_KEY}_${currentUserId}`,
        JSON.stringify([...newSet])
      );
      return newSet;
    });
  }, [currentUserId, getAssignmentKey]);

  return {
    currentUserId,
    isNewAssignment,
    markAssignmentSeen,
    markAllCurrentAssignmentsSeen,
    initialLoadComplete,
  };
};
