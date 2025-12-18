import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = (currentView: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<string | null>(
    localStorage.getItem("lastReadMessageTimestamp")
  );

  useEffect(() => {
    // Mark messages as read when viewing chat
    if (currentView === "chat") {
      const now = new Date().toISOString();
      setLastReadTimestamp(now);
      localStorage.setItem("lastReadMessageTimestamp", now);
      setUnreadCount(0);
    }
  }, [currentView]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!lastReadTimestamp) {
        // First time user, count all messages
        const { count, error } = await supabase
          .from("collaborator_messages")
          .select("*", { count: "exact", head: true });

        if (!error && count) {
          setUnreadCount(count);
        }
        return;
      }

      // Count messages since last read
      const { count, error } = await supabase
        .from("collaborator_messages")
        .select("*", { count: "exact", head: true })
        .gt("created_at", lastReadTimestamp);

      if (!error && count) {
        setUnreadCount(count);
      }
    };

    loadUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel("unread_messages_counter")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "collaborator_messages",
        },
        () => {
          if (currentView !== "chat") {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lastReadTimestamp, currentView]);

  return unreadCount;
};
