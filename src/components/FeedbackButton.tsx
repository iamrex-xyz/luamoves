import { useState, useEffect, createContext, useContext } from "react";
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

// Human-readable labels for routes
const ROUTE_LABELS: Record<string, string> = {
  "/": "Homepage",
  "/deals": "Partner deals",
  "/admin": "Admin dashboard",
  // Add more routes as needed
};

/**
 * Convert a route path to a human-readable label.
 * Falls back to a formatted version of the path if no mapping exists.
 */
function getPageLabel(pathname: string): string {
  // Direct match
  if (ROUTE_LABELS[pathname]) {
    return ROUTE_LABELS[pathname];
  }
  
  // If path is just "/", return Homepage
  if (pathname === "/") {
    return "Homepage";
  }
  
  // For unknown routes, convert path to readable format
  // e.g., "/moving-company" → "Moving company"
  const cleanPath = pathname.replace(/^\//, "").replace(/-/g, " ");
  if (cleanPath) {
    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
  }
  
  return "Onbekende pagina";
}

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

// Context to allow external components to open the feedback modal
interface FeedbackContextType {
  openFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackButton");
  }
  return context;
}

// Safe hook that doesn't throw if context is missing
export function useFeedbackSafe() {
  return useContext(FeedbackContext);
}

interface FeedbackButtonProps {
  /** Hide the floating button (useful when showing a custom CTA instead) */
  hideFloatingButton?: boolean;
}

export function FeedbackButton({ hideFloatingButton = false }: FeedbackButtonProps) {
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
      
      // Capture both raw route and human-readable label
      const pageRoute = location.pathname;
      const pageLabel = getPageLabel(pageRoute);
      
      // Log warning if we couldn't resolve to a known page
      if (pageLabel === "Onbekende pagina") {
        console.warn(`[Feedback] Unknown page route: ${pageRoute}`);
      }
      
      const { error } = await supabase.from("soft_launch_feedback").insert({
        user_id: user?.id || null,
        anonymous_session_id: user ? null : getAnonymousSessionId(),
        feedback_text: feedbackText.trim(),
        category: category || null,
        page_or_flow: pageLabel,
        page_route: pageRoute,
      } as any); // Type assertion needed until types regenerate

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

  const openFeedback = () => setOpen(true);

  // Success state
  if (isSubmitted && open) {
    return (
      <FeedbackContext.Provider value={{ openFeedback }}>
        {!hideFloatingButton && <FloatingButton onClick={openFeedback} />}
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
      </FeedbackContext.Provider>
    );
  }

  return (
    <FeedbackContext.Provider value={{ openFeedback }}>
      {!hideFloatingButton && <FloatingButton onClick={openFeedback} />}
      
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
    </FeedbackContext.Provider>
  );
}

function FloatingButton({ onClick }: { onClick: () => void }) {
  const location = useLocation();
  const isOnboarding = location.pathname === "/";
  
  // Defensive positioning to NEVER overlap with other UI:
  // - ALWAYS left side on all viewports to avoid right-side CTAs
  // - Mobile: above BottomNav (bottom-[72px])
  // - Desktop on onboarding: same left position (Start button is on right)
  // - Desktop on other pages: can move to right since no floating CTAs there
  
  return (
    <div 
      className={cn(
        "fixed z-40 transition-all duration-200",
        // Always left side, above BottomNav on mobile
        "left-4 bottom-[72px]",
        // Desktop: left on onboarding pages (to avoid Start/Volgende buttons on right)
        // Right on other pages (no floating CTAs there)
        isOnboarding 
          ? "md:left-6 md:bottom-6" 
          : "md:left-auto md:right-6 md:bottom-6"
      )}
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }}
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
