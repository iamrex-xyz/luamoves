import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  calculateProgress, 
  getTimeBasedMessage, 
  calculatePotentialSavings,
  Milestone 
} from "@/lib/progressMilestones";
import { ChevronRight, Sparkles, TrendingUp, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type Task = {
  id: string;
  status: "todo" | "in_progress" | "done";
};

type ProgressBannerProps = {
  tasks: Task[];
  daysUntilMove: number;
  onViewDeals?: () => void;
};

export const ProgressBanner = ({ tasks, daysUntilMove, onViewDeals }: ProgressBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSavings, setShowSavings] = useState(false);

  const completedTasks = tasks.filter(t => t.status === "done").length;
  const openTasks = tasks.filter(t => t.status !== "done");
  const { percentage, milestone, nextMilestone } = calculateProgress(completedTasks, tasks.length);
  const potentialSavings = calculatePotentialSavings(openTasks.map(t => t.id));
  
  const timeMessage = getTimeBasedMessage(daysUntilMove, openTasks.length);

  useEffect(() => {
    // Show savings message if significant savings available
    if (potentialSavings >= 200) {
      setShowSavings(true);
    }
  }, [potentialSavings]);

  if (isDismissed || tasks.length === 0) {
    return null;
  }

  const handleDealClick = () => {
    trackEvent("savingsBannerClicked", { potentialSavings });
    onViewDeals?.();
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Progress Card */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {milestone && <span className="text-lg">{milestone.emoji}</span>}
              <span className="font-semibold text-sm">{timeMessage}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{completedTasks} van {tasks.length} taken</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
              
              {nextMilestone && percentage < 100 && (
                <p className="text-xs text-muted-foreground">
                  Volgende: {nextMilestone.emoji} {nextMilestone.title}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="h-6 w-6 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Savings Banner - Activation Phase */}
      {showSavings && potentialSavings > 0 && (
        <Card 
          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleDealClick}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-green-900 dark:text-green-100">
                  💸 Bespaar tot €{potentialSavings} op je verhuizing
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                  Vergelijk energie, internet en verzekeringen
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          </div>
        </Card>
      )}
    </div>
  );
};

// Milestone celebration toast content
export const MilestoneCelebration = ({ milestone }: { milestone: Milestone }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{milestone.emoji}</span>
      <div>
        <p className="font-semibold">{milestone.title}</p>
        <p className="text-sm text-muted-foreground">{milestone.message}</p>
      </div>
    </div>
  );
};
