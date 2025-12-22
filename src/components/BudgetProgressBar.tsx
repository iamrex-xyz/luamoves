import { useState } from "react";
import { Euro, ChevronRight, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetDialog } from "@/components/BudgetDialog";

interface BudgetProgressBarProps {
  totalBudget: number | null;
  spentAmount: number;
  onBudgetUpdate?: (budget: number | null) => void;
}

export const BudgetProgressBar = ({
  totalBudget,
  spentAmount,
  onBudgetUpdate,
}: BudgetProgressBarProps) => {
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);

  // If no budget set, show setup prompt
  if (!totalBudget) {
    return (
      <>
        <button
          onClick={() => setShowBudgetDialog(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Euro className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Verhuisbudget instellen</p>
              <p className="text-xs text-muted-foreground">
                Ik houd bij wat je uitgeeft
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </button>

        <BudgetDialog
          open={showBudgetDialog}
          onOpenChange={setShowBudgetDialog}
          currentBudget={totalBudget}
          onComplete={(budget) => onBudgetUpdate?.(budget)}
        />
      </>
    );
  }

  const percentage = Math.min((spentAmount / totalBudget) * 100, 100);
  const isOverBudget = spentAmount > totalBudget;
  const remaining = totalBudget - spentAmount;

  return (
    <>
      <div className="p-4 rounded-2xl bg-card border-0 shadow-soft space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Je verhuisbudget</span>
          </div>
          <button
            onClick={() => setShowBudgetDialog(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Budget aanpassen"
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isOverBudget 
                  ? "bg-gradient-to-r from-amber-400 to-amber-500" 
                  : "bg-gradient-to-r from-primary to-primary/80"
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              €{spentAmount.toLocaleString("nl-NL")} uitgegeven
            </span>
            <span className="font-medium text-foreground">
              €{totalBudget.toLocaleString("nl-NL")}
            </span>
          </div>
        </div>

        {/* Status Text - Lua TOV */}
        <p className="text-xs text-muted-foreground">
          {isOverBudget ? (
            <>
              Je zit €{Math.abs(remaining).toLocaleString("nl-NL")} boven je richtbedrag. 
              Dat is oké — je kunt dit altijd aanpassen.
            </>
          ) : spentAmount === 0 ? (
            "Ik houd bij wat je uitgeeft."
          ) : remaining > 0 ? (
            <>Nog €{remaining.toLocaleString("nl-NL")} over van je budget.</>
          ) : (
            "Je budget is precies op."
          )}
        </p>
      </div>

      <BudgetDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        currentBudget={totalBudget}
        onComplete={(budget) => onBudgetUpdate?.(budget)}
      />
    </>
  );
};