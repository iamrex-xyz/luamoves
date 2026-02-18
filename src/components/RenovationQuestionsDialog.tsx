import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Info, CheckCircle2, Check } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProfileSync } from "@/hooks/useProfileSync";

interface RenovationQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    renovationBudget?: string;
    renovationStartDate?: Date;
  }) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
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

const stepExplanations = {
  1: "Dit helpt aannemers om passende offertes te maken voor jouw project.",
  2: "Zo kunnen we aannemers vinden die beschikbaar zijn wanneer jij wilt starten.",
};

export function RenovationQuestionsDialog({
  open,
  onOpenChange,
  onComplete,
  onRedirect,
  onCompleteTask,
  existingData,
}: RenovationQuestionsDialogProps) {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(existingData.renovationBudget || "");
  const [startDate, setStartDate] = useState<Date | undefined>(existingData.renovationStartDate);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const needsBudget = !existingData.renovationBudget;
  const needsStartDate = !existingData.renovationStartDate;

  const getInitialStep = () => {
    if (needsBudget) return 1;
    if (needsStartDate) return 2;
    return 1;
  };

  const handleNext = async () => {
    if (step === 1 && needsStartDate) {
      setStep(2);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    const data = {
      renovationBudget: budget || existingData.renovationBudget,
      renovationStartDate: startDate ? format(startDate, "yyyy-MM-dd") : existingData.renovationStartDate?.toString(),
    };
    
    // Save to Supabase profile
    await saveToProfile(data);
    
    onComplete({
      renovationBudget: budget || existingData.renovationBudget,
      renovationStartDate: startDate || existingData.renovationStartDate,
    });
    setShowConfirmation(true);
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setStep(1);
    onOpenChange(false);
  };

  const handleGoToDeals = () => {
    onRedirect();
    handleClose();
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

  // Confirmation screen
  if (showConfirmation) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-center">
              Wordt geregeld!
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              We zoeken passende aannemers voor je renovatie.
            </p>
            <div className="w-full space-y-2 mt-4">
              <Button 
                onClick={handleGoToDeals}
                className="w-full"
              >
                Bekijk aannemers
              </Button>
              <Button 
                variant="ghost"
                onClick={handleClose}
                className="w-full text-muted-foreground"
              >
                Sluiten
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[1]}</p>
              </div>
              <RadioGroup value={budget} onValueChange={setBudget}>
                {budgetOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={option.value} id={`budget-${option.value}`} />
                    <Label htmlFor={`budget-${option.value}`} className="cursor-pointer flex-1">
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
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[2]}</p>
              </div>
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
            {(step === 2) || (step === 1 && !needsStartDate) ? "Opslaan" : "Volgende"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
