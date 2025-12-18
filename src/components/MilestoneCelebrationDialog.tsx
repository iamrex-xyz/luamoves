import { useEffect, useState } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Bookmark, X } from "lucide-react";

type MilestoneType = "five_tasks" | "halfway";

type MilestoneCelebrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneType: MilestoneType;
  onSignup: () => void;
};

const milestoneContent = {
  five_tasks: {
    emoji: "🎯",
    title: "Goed bezig!",
    subtitle: "5 taken afgevinkt",
    message: "Je maakt lekker voortgang met je verhuizing. Sla je voortgang op zodat je niks kwijtraakt!",
    cta: "Voortgang opslaan",
  },
  halfway: {
    emoji: "🚀",
    title: "Halverwege!",
    subtitle: "50% van je taken klaar",
    message: "Fantastisch! De helft van je verhuistaken is al gedaan. Mis je voortgang niet!",
    cta: "Voortgang opslaan",
  },
};

export const MilestoneCelebrationDialog = ({
  open,
  onOpenChange,
  milestoneType,
  onSignup,
}: MilestoneCelebrationDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const content = milestoneContent[milestoneType];

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
    }
  }, [open]);

  const handleSkip = () => {
    onOpenChange(false);
  };

  const handleSignup = () => {
    onOpenChange(false);
    onSignup();
  };

  return (
    <>
      <ConfettiCelebration trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <MobileModal open={open} onOpenChange={onOpenChange}>
        <MobileModalContent className="max-h-[70vh]">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="px-6 py-8">
            {/* Celebration visual */}
            <div className="text-center space-y-4 mb-8">
              <div className="text-6xl animate-bounce">{content.emoji}</div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
                <p className="text-primary font-medium mt-1">{content.subtitle}</p>
              </div>
              <p className="text-muted-foreground">
                {content.message}
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Button 
                onClick={handleSignup} 
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                <Bookmark className="w-5 h-5 mr-2" />
                {content.cta}
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full h-12 text-muted-foreground hover:text-foreground"
              >
                Later
              </Button>
            </div>
          </div>
        </MobileModalContent>
      </MobileModal>
    </>
  );
};
