import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EnergyQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onRedirect: () => void;
};

// Bekende energieleveranciers in Nederland
const energySuppliers = [
  "Vattenfall",
  "Eneco",
  "Essent",
  "Budget Energie",
  "Greenchoice",
  "Vandebron",
  "Oxxio",
  "Engie",
  "Innova Energie",
  "Pure Energie",
  "NLE",
  "Mega",
  "ANWB Energie",
  "United Consumers",
  "Coolblue Energie",
  "Tibber",
  "Frank Energie",
];

type Step = "supplier" | "smartMeter" | "connectionType";

const stepExplanations = {
  supplier: "Zo kunnen we zien of overstappen voordeliger is dan verlengen.",
  smartMeter: "Met een slimme meter kun je makkelijker en sneller overstappen.",
  connectionType: "Dit bepaalt welke energiecontracten we je kunnen aanbieden.",
};

export const EnergyQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
}: EnergyQuestionsDialogProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("supplier");
  const [supplier, setSupplier] = useState<string>("");
  const [smartMeter, setSmartMeter] = useState<string>("");
  const [connectionType, setConnectionType] = useState<string>("");

  // Determine which steps are needed based on existing data
  const needsSupplier = !movingInfo.energyCurrentSupplier;
  const needsSmartMeter = !movingInfo.hasSmartMeter;
  const needsConnectionType = !movingInfo.energyConnectionType;

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSupplier(movingInfo.energyCurrentSupplier || "");
      setSmartMeter(movingInfo.hasSmartMeter || "");
      setConnectionType(movingInfo.energyConnectionType || "");
      
      // Start at first needed step
      if (needsSupplier) {
        setCurrentStep("supplier");
      } else if (needsSmartMeter) {
        setCurrentStep("smartMeter");
      } else if (needsConnectionType) {
        setCurrentStep("connectionType");
      }
    }
  }, [open, movingInfo, needsSupplier, needsSmartMeter, needsConnectionType]);

  // If no questions needed, redirect immediately
  useEffect(() => {
    if (open && !needsSupplier && !needsSmartMeter && !needsConnectionType) {
      onOpenChange(false);
      onRedirect();
    }
  }, [open, needsSupplier, needsSmartMeter, needsConnectionType, onOpenChange, onRedirect]);

  const getNextStep = (current: Step): Step | null => {
    if (current === "supplier" && needsSmartMeter) return "smartMeter";
    if (current === "supplier" && needsConnectionType) return "connectionType";
    if (current === "smartMeter" && needsConnectionType) return "connectionType";
    return null;
  };

  const handleNext = () => {
    const next = getNextStep(currentStep);
    if (next) {
      setCurrentStep(next);
    } else {
      // All questions answered, save and redirect
      const data: Record<string, any> = {};
      if (needsSupplier) data.energyCurrentSupplier = supplier;
      if (needsSmartMeter) data.hasSmartMeter = smartMeter;
      if (needsConnectionType) data.energyConnectionType = connectionType;
      
      onComplete(data);
      onOpenChange(false);
      onRedirect();
    }
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case "supplier":
        return supplier !== "";
      case "smartMeter":
        return smartMeter !== "";
      case "connectionType":
        return connectionType !== "";
    }
  };

  const handleLater = () => {
    onOpenChange(false);
  };

  // Don't render if no questions needed
  if (!needsSupplier && !needsSmartMeter && !needsConnectionType) {
    return null;
  }

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent className="max-h-[80vh]">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Lua avatar + message */}
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Lua</p>
              <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                {currentStep === "supplier" && (
                  <p className="text-foreground">
                    Om de beste deal voor je te vinden, wil ik even wat weten. Wie is je huidige energieleverancier? ⚡
                  </p>
                )}
                {currentStep === "smartMeter" && (
                  <p className="text-foreground">
                    Heeft je woning een slimme meter? Dan is overstappen extra makkelijk 📸
                  </p>
                )}
                {currentStep === "connectionType" && (
                  <p className="text-foreground">
                    Wat wil je aansluiten op je nieuwe adres? 🔌
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Why this question */}
          <div className="flex items-start gap-2 px-2 py-2 mb-4 bg-blue-50 rounded-lg border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">{stepExplanations[currentStep]}</p>
          </div>

          {/* Task context */}
          <p className="text-xs text-muted-foreground mb-4 px-2">
            Voor: <span className="font-medium text-foreground">Energiecontract kiezen</span>
          </p>

          {/* Input based on step */}
          <div className="space-y-3">
            {currentStep === "supplier" && (
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="w-full h-14 rounded-xl text-base border-2 border-muted hover:border-primary/50 transition-all">
                  <SelectValue placeholder="Kies je huidige leverancier" />
                </SelectTrigger>
                <SelectContent className="max-h-64 bg-background z-50">
                  {energySuppliers.map((s) => (
                    <SelectItem key={s} value={s} className="py-3">
                      {s}
                    </SelectItem>
                  ))}
                  <SelectItem value="unknown" className="py-3 text-muted-foreground">
                    Weet ik niet / heb ik niet
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            {currentStep === "smartMeter" && (
              <div className="space-y-2">
                {[
                  { value: "yes", label: "Ja, slimme meter" },
                  { value: "no", label: "Nee, normale meter" },
                  { value: "unknown", label: "Weet ik niet" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSmartMeter(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      smartMeter === option.value
                        ? "border-primary bg-primary-light"
                        : "border-muted hover:border-primary/50 bg-white"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      smartMeter === option.value ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                    {smartMeter === option.value && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {currentStep === "connectionType" && (
              <div className="space-y-2">
                {[
                  { value: "gas_stroom", label: "Gas & stroom" },
                  { value: "alleen_stroom", label: "Alleen stroom" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConnectionType(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      connectionType === option.value
                        ? "border-primary bg-primary-light"
                        : "border-muted hover:border-primary/50 bg-white"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      connectionType === option.value ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                    {connectionType === option.value && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-4 border-t bg-background flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleLater} 
            className="flex-1 h-12 rounded-xl"
          >
            Later
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!isCurrentStepValid()} 
            className="flex-1 h-12 rounded-xl"
          >
            {getNextStep(currentStep) ? "Volgende" : "Opslaan"}
          </Button>
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};
