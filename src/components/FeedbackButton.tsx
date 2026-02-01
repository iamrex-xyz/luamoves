import { useState, useEffect } from "react";
import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const FEEDBACK_CATEGORIES = [
  { value: "bug", label: "Bug / iets werkt niet" },
  { value: "unclear", label: "Onbegrijpelijk of onduidelijk" },
  { value: "suggestion", label: "Suggestie of idee" },
  { value: "other", label: "Iets anders" },
] as const;

// Generate or retrieve anonymous session ID
function getAnonymousSessionId(): string {
  const storageKey = "lua_feedback_session_id";
  let sessionId = localStorage.getItem(storageKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }
  return sessionId;
}

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const location = useLocation();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Delay reset to allow close animation
      const timer = setTimeout(() => {
        setFeedbackText("");
        setCategory(undefined);
        setIsSubmitted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error("Vul je feedback in");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("soft_launch_feedback").insert({
        user_id: user?.id || null,
        anonymous_session_id: user ? null : getAnonymousSessionId(),
        feedback_text: feedbackText.trim(),
        category: category || null,
        page_or_flow: location.pathname,
      });

      if (error) throw error;

      setIsSubmitted(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        setOpen(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Er ging iets mis bij het versturen");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSubmitted && open) {
    return (
      <>
        <FloatingButton onClick={() => setOpen(true)} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-4">🙌</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Dankjewel!
              </h3>
              <p className="text-muted-foreground">
                Dit helpt ons Lua beter te maken.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <FloatingButton onClick={() => setOpen(true)} />
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Help ons Lua beter maken 💛
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Feedback text */}
            <div className="space-y-2">
              <Label htmlFor="feedback-text" className="text-sm font-medium">
                Jouw feedback <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="feedback-text"
                placeholder="Waar liep je tegenaan? Of wat kan slimmer of fijner?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="resize-none"
                autoFocus
              />
            </div>

            {/* Category selector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Categorie <span className="text-muted-foreground">(optioneel)</span>
              </Label>
              <RadioGroup
                value={category}
                onValueChange={setCategory}
                className="grid grid-cols-2 gap-2"
              >
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <div key={cat.value} className="flex items-center">
                    <RadioGroupItem
                      value={cat.value}
                      id={`cat-${cat.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`cat-${cat.value}`}
                      className={cn(
                        "flex-1 cursor-pointer rounded-lg border-2 border-border px-3 py-2.5 text-sm font-medium transition-all",
                        "hover:border-primary/50 hover:bg-primary/5",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary"
                      )}
                    >
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={!feedbackText.trim() || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Versturen..." : "Feedback versturen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      <Button
        onClick={onClick}
        variant="outline"
        size="sm"
        className={cn(
          "group gap-2 rounded-full shadow-lg",
          "bg-background/95 backdrop-blur-sm",
          "border-border hover:border-primary/50",
          "hover:bg-primary/5 hover:text-primary",
          "transition-all duration-200"
        )}
        title="Loop je ergens tegenaan?"
      >
        <MessageSquareHeart className="h-4 w-4" />
        <span className="text-sm font-medium">Feedback</span>
      </Button>
    </div>
  );
}
