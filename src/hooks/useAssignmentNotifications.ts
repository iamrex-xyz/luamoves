import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SEEN_ASSIGNMENTS_KEY = "lua_seen_task_assignments";

export const useAssignmentNotifications = () => {
  const [seenAssignments, setSeenAssignments] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    };
    loadSeenAssignments();
  }, []);

  // Check if a task assignment is new (unseen)
  const isNewAssignment = useCallback((taskId: string, assignedToEmail: string | null | undefined): boolean => {
    if (!assignedToEmail) return false;
    // Create a unique key for this assignment
    const assignmentKey = `${taskId}:${assignedToEmail}`;
    return !seenAssignments.has(assignmentKey);
  }, [seenAssignments]);

  // Mark a task assignment as seen
  const markAssignmentSeen = useCallback((taskId: string, assignedToEmail: string | null | undefined) => {
    if (!assignedToEmail || !currentUserId) return;
    
    const assignmentKey = `${taskId}:${assignedToEmail}`;
    
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
  }, [currentUserId]);

  // Mark multiple assignments as seen at once
  const markMultipleAssignmentsSeen = useCallback((assignments: Array<{ taskId: string; assignedToEmail: string | null | undefined }>) => {
    if (!currentUserId) return;
    
    setSeenAssignments(prev => {
      const newSet = new Set(prev);
      assignments.forEach(({ taskId, assignedToEmail }) => {
        if (assignedToEmail) {
          newSet.add(`${taskId}:${assignedToEmail}`);
        }
      });
      // Persist to localStorage
      localStorage.setItem(
        `${SEEN_ASSIGNMENTS_KEY}_${currentUserId}`,
        JSON.stringify([...newSet])
      );
      return newSet;
    });
  }, [currentUserId]);

  return {
    isNewAssignment,
    markAssignmentSeen,
    markMultipleAssignmentsSeen,
  };
};
