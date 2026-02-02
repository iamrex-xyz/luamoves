import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Calendar, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface FeedbackItem {
  id: string;
  feedback_text: string;
  category: string | null;
  page_or_flow: string | null;
  created_at: string;
  user_id: string | null;
  anonymous_session_id: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug / iets werkt niet",
  unclear: "Onbegrijpelijk of onduidelijk",
  suggestion: "Suggestie of idee",
  other: "Iets anders",
};

const CATEGORY_COLORS: Record<string, string> = {
  bug: "bg-red-100 text-red-800 border-red-200",
  unclear: "bg-yellow-100 text-yellow-800 border-yellow-200",
  suggestion: "bg-blue-100 text-blue-800 border-blue-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

export function AdminFeedbackSection() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("soft_launch_feedback")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setFeedback(data || []);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Kon feedback niet laden");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Nog geen feedback ontvangen</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span>{feedback.length} feedback item{feedback.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {feedback.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            {/* Top row: Date — Category — Page (prominent display) */}
            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
              <span className="text-muted-foreground">
                {format(new Date(item.created_at), "d MMM yyyy", { locale: nl })}
              </span>
              <span className="text-muted-foreground/50">—</span>
              {item.category ? (
                <Badge 
                  variant="outline" 
                  className={`text-xs py-0 ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}
                >
                  {CATEGORY_LABELS[item.category] || item.category}
                </Badge>
              ) : (
                <span className="text-muted-foreground italic">Geen categorie</span>
              )}
              <span className="text-muted-foreground/50">—</span>
              <Badge 
                variant="secondary" 
                className="font-mono text-xs py-0 bg-primary/10 text-primary border-primary/20"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {item.page_or_flow || "Onbekend"}
              </Badge>
            </div>
            
            {/* Feedback text */}
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {item.feedback_text}
            </p>
          </CardHeader>
          <CardContent className="pt-1 pb-3">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(item.created_at), "HH:mm", { locale: nl })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{item.user_id ? "Ingelogde gebruiker" : "Anoniem"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
