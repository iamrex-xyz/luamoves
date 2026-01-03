import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MovingFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingDate?: string;
  onSubmitSuccess?: () => void;
}

export function MovingFeedbackDialog({
  open,
  onOpenChange,
  movingDate,
  onSubmitSuccess,
}: MovingFeedbackDialogProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !explanation.trim()) {
      toast.error("Vul alle velden in");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Je moet ingelogd zijn om feedback te geven");
        return;
      }

      const { error } = await supabase.from("moving_company_feedback").insert({
        user_id: user.id,
        rating,
        explanation: explanation.trim(),
        moving_company_name: "Verhuisbedrijf via Lua", // Generic name, can be made specific later
        moving_date: movingDate || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        onSubmitSuccess?.();
        // Reset state for next time
        setRating(null);
        setExplanation("");
        setIsSubmitted(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Er ging iets mis bij het versturen van je feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating ?? rating;

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Dank je!
            </h3>
            <p className="text-muted-foreground">
              We geven je feedback door aan het verhuisbedrijf.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Feedback achterlaten</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info text */}
          <p className="text-sm text-muted-foreground">
            Deel je ervaring met het verhuisbedrijf. Je feedback wordt gedeeld om de kwaliteit te verbeteren.
          </p>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Geef een cijfer (1-5) <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHoveredRating(num)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className={cn(
                    "w-12 h-12 rounded-xl border-2 text-lg font-semibold transition-all",
                    displayRating && num <= displayRating
                      ? num <= 2
                        ? "border-red-500 bg-red-50 text-red-700"
                        : num === 3
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-green-500 bg-green-50 text-green-700"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-center text-sm text-muted-foreground">
                {rating <= 2 ? "Niet tevreden" : rating === 3 ? "Neutraal" : rating === 4 ? "Tevreden" : "Zeer tevreden"}
              </p>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-sm font-medium">
              Toelichting <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="explanation"
              placeholder="Vertel over je ervaring met het verhuisbedrijf..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Deze feedback wordt gedeeld met het verhuisbedrijf.
            </p>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!rating || !explanation.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Versturen..." : "Feedback versturen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
