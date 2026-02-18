import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Baby, PawPrint, ArrowRight, Info, CheckCircle2, Check } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

type LiabilityQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo>) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
};

const stepExplanations = {
  children: "Kinderen zijn vaak meeverzekerd. Dit bepaalt je dekking en premie.",
  pets: "Huisdieren kunnen schade veroorzaken. Dit is belangrijk voor je aansprakelijkheidsdekking.",
};

export const LiabilityQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
  onCompleteTask,
}: LiabilityQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState<number>(movingInfo.children || 0);
  const [hasPets, setHasPets] = useState<"yes" | "no" | "">(
    movingInfo.pets !== undefined && movingInfo.pets > 0 ? "yes" : ""
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Determine which questions to ask
  const needsChildrenQuestion = movingInfo.children === undefined || movingInfo.children === null;
  const needsPetsQuestion = movingInfo.pets === undefined || movingInfo.pets === null;

  const totalSteps = (needsChildrenQuestion ? 1 : 0) + (needsPetsQuestion ? 1 : 0);
  const startStep = needsChildrenQuestion ? 1 : 2;

  const handleNext = async () => {
    if (step === 1 && needsPetsQuestion) {
      setStep(2);
    } else {
      // Complete and show confirmation
      const updates: Partial<MovingInfo> = {};
      if (needsChildrenQuestion) {
        updates.children = numberOfChildren;
      }
      if (needsPetsQuestion) {
        updates.pets = hasPets === "yes" ? 1 : 0;
      }
      
      // Save to Supabase profile
      await saveToProfile(updates);
      
      onComplete(updates);
      setShowConfirmation(true);
    }
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

  const getCurrentStep = () => {
    if (step === 1 && needsChildrenQuestion) return 1;
    if (step === 2 || (!needsChildrenQuestion && needsPetsQuestion)) return totalSteps;
    return step;
  };

  // Skip to relevant step on mount
  const effectiveStep = !needsChildrenQuestion && needsPetsQuestion ? 2 : step;

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
              We kunnen nu passende verzekeringen voor je zoeken.
            </p>
            <div className="w-full space-y-2 mt-4">
              <Button 
                onClick={handleGoToDeals}
                className="w-full"
              >
                Bekijk aanbiedingen
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
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Aansprakelijkheidsverzekering
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress indicator */}
          {totalSteps > 1 && (
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < getCurrentStep() ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Step 1: Children */}
          {effectiveStep === 1 && needsChildrenQuestion && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Baby className="h-5 w-5 text-primary" />
                Heb je kinderen?
              </div>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations.children}</p>
              </div>
              
              <div className="space-y-3">
                <RadioGroup
                  value={numberOfChildren > 0 ? "yes" : numberOfChildren === 0 ? "no" : ""}
                  onValueChange={(v) => setNumberOfChildren(v === "yes" ? 1 : 0)}
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="yes" id="children-yes" />
                    <Label htmlFor="children-yes" className="flex-1 cursor-pointer">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="no" id="children-no" />
                    <Label htmlFor="children-no" className="flex-1 cursor-pointer">Nee</Label>
                  </div>
                </RadioGroup>

                {numberOfChildren > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="children-count">Hoeveel kinderen?</Label>
                    <Input
                      id="children-count"
                      type="number"
                      min={1}
                      max={10}
                      value={numberOfChildren}
                      onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Pets */}
          {effectiveStep === 2 && needsPetsQuestion && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <PawPrint className="h-5 w-5 text-primary" />
                Heb je huisdieren?
              </div>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations.pets}</p>
              </div>
              
              <RadioGroup value={hasPets} onValueChange={(v) => setHasPets(v as "yes" | "no")}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="yes" id="pets-yes" />
                  <Label htmlFor="pets-yes" className="flex-1 cursor-pointer">Ja</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="no" id="pets-no" />
                  <Label htmlFor="pets-no" className="flex-1 cursor-pointer">Nee</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={
              (effectiveStep === 1 && needsChildrenQuestion && numberOfChildren === undefined) ||
              (effectiveStep === 2 && needsPetsQuestion && !hasPets)
            }
            className="w-full"
          >
            {(effectiveStep === 1 && needsPetsQuestion) ? "Volgende" : "Opslaan"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
