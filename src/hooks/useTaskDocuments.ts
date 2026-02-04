import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TaskDocument = {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  category: string;
  description: string | null;
  upload_date: string | null;
  created_at: string | null;
  task_id: string | null;
};

/**
 * Fetches documents grouped by task_id for efficient rendering of task document previews
 */
export const useTaskDocuments = () => {
  return useQuery({
    queryKey: ["task-documents-all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from("moving_documents")
        .select("*")
        .eq("user_id", user.id)
        .not("task_id", "is", null)
        .order("upload_date", { ascending: false });

      if (error) throw error;

      // Group by task_id
      const grouped: Record<string, TaskDocument[]> = {};
      (data || []).forEach((doc) => {
        if (doc.task_id) {
          if (!grouped[doc.task_id]) {
            grouped[doc.task_id] = [];
          }
          grouped[doc.task_id].push(doc as TaskDocument);
        }
      });

      return grouped;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};
