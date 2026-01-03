import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HouseholdMember = {
  id: string;
  name: string | null;
  phone: string;
  status: string;
  member_user_id: string | null;
  invited_at: string | null;
  accepted_at: string | null;
};

export const useHouseholdMembers = () => {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMembers([]);
        setCurrentUserId(null);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("household_members")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error loading household members:", error);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      
      // Refresh list after deletion
      await loadMembers();
      return { success: true };
    } catch (error) {
      console.error("Error removing household member:", error);
      return { success: false, error };
    }
  }, [loadMembers]);

  const updateMemberName = useCallback(async (memberId: string, name: string) => {
    try {
      const { error } = await supabase
        .from("household_members")
        .update({ name })
        .eq("id", memberId);

      if (error) throw error;
      
      // Refresh list after update
      await loadMembers();
      return { success: true };
    } catch (error) {
      console.error("Error updating household member:", error);
      return { success: false, error };
    }
  }, [loadMembers]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("household_members_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "household_members",
          filter: `owner_user_id=eq.${currentUserId}`,
        },
        () => {
          loadMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, loadMembers]);

  // Filter active members for task assignment
  const activeMembers = members.filter((m) => m.status === "active" || m.status === "invited");

  return {
    members,
    activeMembers,
    isLoading,
    loadMembers,
    removeMember,
    updateMemberName,
  };
};
