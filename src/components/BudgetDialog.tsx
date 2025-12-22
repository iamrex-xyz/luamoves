import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Euro, HelpCircle, Check } from "lucide-react";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBudget?: number | null;
  onComplete: (budget: number | null) => void;
}

const EXAMPLE_BUDGETS = [
  { label: "Klein (studio/weinig spullen)", amount: 500, description: "Zelf doen of met vrienden" },
  { label: "Gemiddeld (2-3 kamers)", amount: 1500, description: "Verhuisbedrijf + materiaal" },
  { label: "Groot (gezinswoning)", amount: 3000, description: "Full-service verhuizing" },
];

export const BudgetDialog = ({
  open,
  onOpenChange,
  currentBudget,
  onComplete,
}: BudgetDialogProps) => {
  const [budget, setBudget] = useState<string>(
    currentBudget ? currentBudget.toString() : ""
  );
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = () => {
    const numericBudget = budget ? parseInt(budget.replace(/[^\d]/g, ""), 10) : null;
    onComplete(numericBudget);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onComplete(null);
    onOpenChange(false);
  };

  const handleExampleClick = (amount: number) => {
    setBudget(amount.toString());
  };

  const formatBudgetInput = (value: string) => {
    // Remove non-numeric characters except for the input
    const numericValue = value.replace(/[^\d]/g, "");
    return numericValue;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Euro className="w-5 h-5 text-primary" />
            Zullen we een richtbedrag instellen?
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Dit helpt me om slimmere suggesties te doen. Je kunt dit later altijd aanpassen.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Budget Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Hoeveel wil je maximaal uitgeven?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="bijv. 1500"
                value={budget}
                onChange={(e) => setBudget(formatBudgetInput(e.target.value))}
                className="pl-8 text-lg h-12"
              />
            </div>
          </div>

          {/* Help Section Toggle */}
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Niet zeker hoeveel je nodig hebt?
          </button>

          {/* Help Section Content */}
          {showHelp && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                De meeste verhuizingen kosten tussen de €500 en €3.000, afhankelijk van hoeveel 
                spullen je hebt en of je een verhuisbedrijf inschakelt. Hier zijn wat voorbeelden:
              </p>
              
              <div className="space-y-2">
                {EXAMPLE_BUDGETS.map((example) => (
                  <button
                    key={example.amount}
                    type="button"
                    onClick={() => handleExampleClick(example.amount)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      budget === example.amount.toString()
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{example.label}</p>
                        <p className="text-xs text-muted-foreground">{example.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">€{example.amount}</span>
                        {budget === example.amount.toString() && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground italic">
                Dit zijn richtbedragen — je budget is altijd aanpasbaar en niet bindend.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              className="w-full h-12"
              disabled={!budget}
            >
              {budget ? `Budget instellen op €${parseInt(budget).toLocaleString("nl-NL")}` : "Budget instellen"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-muted-foreground"
            >
              Ik sla dit voor nu over
            </Button>
          </div>

          {/* Reassurance */}
          <p className="text-xs text-center text-muted-foreground">
            Je kunt dit later altijd aanpassen in je instellingen.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
