import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeedbackSafe } from "@/components/FeedbackButton";
import { cn } from "@/lib/utils";

/**
 * A small, always-visible feedback CTA for the homepage.
 * Positioned above the floating feedback button, designed to be
 * clearly discoverable without competing with main CTAs.
 */
export function HomepageFeedbackCta() {
  const feedbackContext = useFeedbackSafe();

  const handleClick = () => {
    feedbackContext?.openFeedback();
  };

  return (
    <div className="fixed bottom-32 right-4 z-40 md:bottom-16 md:right-6">
      <Button
        onClick={handleClick}
        variant="ghost"
        size="sm"
        className={cn(
          "gap-1.5 rounded-full px-3 h-9",
          "bg-white/90 backdrop-blur-sm shadow-md",
          "border border-border/50",
          "text-muted-foreground hover:text-primary hover:bg-primary/5",
          "transition-all duration-200"
        )}
      >
        <MessageSquareHeart className="h-4 w-4" />
        <span className="text-xs font-medium">Feedback</span>
      </Button>
      <p className="text-[10px] text-muted-foreground/70 text-center mt-1 px-1">
        Loop je ergens tegenaan?
      </p>
    </div>
  );
}
