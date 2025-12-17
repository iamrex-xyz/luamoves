import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface RenovationQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    renovationBudget?: string;
    renovationStartDate?: Date;
  }) => void;
  onRedirect: () => void;
  existingData: {
    renovationBudget?: string;
    renovationStartDate?: Date;
  };
}

const budgetOptions = [
  { value: "under_5k", label: "Minder dan €5.000" },
  { value: "5k_15k", label: "€5.000 - €15.000" },
  { value: "15k_50k", label: "€15.000 - €50.000" },
  { value: "over_50k", label: "Meer dan €50.000" },
];

export function RenovationQuestionsDialog({
  open,
  onOpenChange,
  onComplete,
  onRedirect,
  existingData,
}: RenovationQuestionsDialogProps) {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(existingData.renovationBudget || "");
  const [startDate, setStartDate] = useState<Date | undefined>(existingData.renovationStartDate);

  const needsBudget = !existingData.renovationBudget;
  const needsStartDate = !existingData.renovationStartDate;

  const getInitialStep = () => {
    if (needsBudget) return 1;
    if (needsStartDate) return 2;
    return 1;
  };

  const handleNext = () => {
    if (step === 1 && needsStartDate) {
      setStep(2);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete({
      renovationBudget: budget || existingData.renovationBudget,
      renovationStartDate: startDate || existingData.renovationStartDate,
    });
    onRedirect();
  };

  const canProceed = () => {
    if (step === 1) return !!budget;
    if (step === 2) return !!startDate;
    return true;
  };

  const getTotalSteps = () => {
    let total = 0;
    if (needsBudget) total++;
    if (needsStartDate) total++;
    return total;
  };

  const getCurrentStepNumber = () => {
    let current = 0;
    if (step === 1) {
      current = 1;
    } else if (step === 2) {
      current = needsBudget ? 2 : 1;
    }
    return current;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renovatie details</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Stap {getCurrentStepNumber()} van {getTotalSteps()}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && needsBudget && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Wat is je budgetindicatie?</Label>
              <RadioGroup value={budget} onValueChange={setBudget}>
                {budgetOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`budget-${option.value}`} />
                    <Label htmlFor={`budget-${option.value}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && needsStartDate && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Wanneer wil je starten?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "d MMMM yyyy", { locale: nl }) : "Selecteer datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={nl}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {(step === 2) || (step === 1 && !needsStartDate) ? "Voltooien" : "Volgende"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
