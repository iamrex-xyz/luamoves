import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeedbackSafe } from "@/components/FeedbackButton";
import { cn } from "@/lib/utils";

/**
 * A small, always-visible feedback CTA for the homepage.
 * Positioned above the bottom nav, clearly visible.
 */
export function HomepageFeedbackCta() {
  const feedbackContext = useFeedbackSafe();

  const handleClick = () => {
    feedbackContext?.openFeedback();
  };

  return (
    <div className="fixed bottom-24 right-4 z-[60] md:bottom-8 md:right-6">
      <div className="flex flex-col items-end gap-1">
        <Button
          onClick={handleClick}
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 rounded-full px-4 h-10",
            "bg-white shadow-lg shadow-primary/15",
            "border-primary/20 hover:border-primary/40",
            "text-foreground hover:text-primary hover:bg-primary/5",
            "transition-all duration-200"
          )}
        >
          <MessageSquareHeart className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Feedback</span>
        </Button>
        <span className="text-[10px] text-muted-foreground mr-2">
          Loop je ergens tegenaan?
        </span>
      </div>
    </div>
  );
}
