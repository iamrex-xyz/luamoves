import { useState, useEffect } from "react";
import { X, MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeedbackSafe } from "@/components/FeedbackButton";
import { cn } from "@/lib/utils";

const SESSION_KEY = "lua_feedback_nudge_shown";

export function FeedbackNudge() {
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const feedbackContext = useFeedbackSafe();

  useEffect(() => {
    // Check if nudge was already shown this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      return;
    }

    // Show nudge after 4 seconds
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => setVisible(false), 300);
  };

  const handleFeedbackClick = () => {
    handleDismiss();
    // Small delay to let nudge animate out
    setTimeout(() => {
      feedbackContext?.openFeedback();
    }, 150);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-36 right-4 z-40 md:bottom-20 md:right-6",
        "max-w-[280px] w-full",
        "transition-all duration-300 ease-out",
        isExiting
          ? "opacity-0 translate-y-2 scale-95"
          : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-4"
      )}
      role="dialog"
      aria-labelledby="feedback-nudge-title"
    >
      <div className="relative rounded-2xl bg-white border border-border shadow-xl shadow-primary/10 p-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Sluiten"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
            <MessageSquareHeart className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 
              id="feedback-nudge-title"
              className="text-sm font-semibold text-foreground mb-1"
            >
              Loop je ergens tegenaan?
            </h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Laat het ons weten, dan maken we Lua samen beter 💛
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleFeedbackClick}
                size="sm"
                className="h-8 px-3 text-xs rounded-full"
              >
                Feedback geven
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs rounded-full text-muted-foreground hover:text-foreground"
              >
                Nu niet
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative tail pointing to floating button */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-border rotate-45" />
      </div>
    </div>
  );
}
