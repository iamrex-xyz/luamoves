import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";

type InternetQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onRedirect: () => void;
};

type Step = "fiber" | "speed" | "bundle";

const stepExplanations = {
  fiber: "Glasvezel biedt de snelste verbinding. Dit bepaalt welke aanbieders beschikbaar zijn.",
  speed: "Zo vinden we een abonnement dat past bij jouw gebruik en budget.",
  bundle: "Bundels zijn vaak voordeliger dan losse producten.",
};

export const InternetQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
}: InternetQuestionsDialogProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("fiber");
  const [hasFiber, setHasFiber] = useState<string>("");
  const [speedPreference, setSpeedPreference] = useState<string>("");
  const [bundle, setBundle] = useState<string>("");

  // Determine which steps are needed based on existing data
  const needsFiber = !movingInfo.hasFiber;
  const needsSpeed = !movingInfo.internetSpeedPreference;
  const needsBundle = !movingInfo.internetBundle;

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setHasFiber(movingInfo.hasFiber || "");
      setSpeedPreference(movingInfo.internetSpeedPreference || "");
      setBundle(movingInfo.internetBundle || "");
      
      // Start at first needed step
      if (needsFiber) {
        setCurrentStep("fiber");
      } else if (needsSpeed) {
        setCurrentStep("speed");
      } else if (needsBundle) {
        setCurrentStep("bundle");
      }
    }
  }, [open, movingInfo, needsFiber, needsSpeed, needsBundle]);

  // If no questions needed, redirect immediately
  useEffect(() => {
    if (open && !needsFiber && !needsSpeed && !needsBundle) {
      onOpenChange(false);
      onRedirect();
    }
  }, [open, needsFiber, needsSpeed, needsBundle, onOpenChange, onRedirect]);

  const getNextStep = (current: Step): Step | null => {
    if (current === "fiber" && needsSpeed) return "speed";
    if (current === "fiber" && needsBundle) return "bundle";
    if (current === "speed" && needsBundle) return "bundle";
    return null;
  };

  const handleNext = () => {
    const next = getNextStep(currentStep);
    if (next) {
      setCurrentStep(next);
    } else {
      // All questions answered, save and redirect
      const data: Record<string, any> = {};
      if (needsFiber) data.hasFiber = hasFiber;
      if (needsSpeed) data.internetSpeedPreference = speedPreference;
      if (needsBundle) data.internetBundle = bundle;
      
      onComplete(data);
      onOpenChange(false);
      onRedirect();
    }
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case "fiber":
        return hasFiber !== "";
      case "speed":
        return speedPreference !== "";
      case "bundle":
        return bundle !== "";
    }
  };

  const handleLater = () => {
    onOpenChange(false);
  };

  // Don't render if no questions needed
  if (!needsFiber && !needsSpeed && !needsBundle) {
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
                {currentStep === "fiber" && (
                  <p className="text-foreground">
                    Is er glasvezel beschikbaar op je nieuwe adres? 📡
                  </p>
                )}
                {currentStep === "speed" && (
                  <p className="text-foreground">
                    Welke internetsnelheid past bij je? 🚀
                  </p>
                )}
                {currentStep === "bundle" && (
                  <p className="text-foreground">
                    Wat wil je allemaal afsluiten? 📺
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
            Voor: <span className="font-medium text-foreground">Internet regelen</span>
          </p>

          {/* Input based on step */}
          <div className="space-y-3">
            {currentStep === "fiber" && (
              <div className="space-y-2">
                {[
                  { value: "yes", label: "Ja, glasvezel beschikbaar" },
                  { value: "no", label: "Nee, geen glasvezel" },
                  { value: "unknown", label: "Weet ik niet" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setHasFiber(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      hasFiber === option.value
                        ? "border-primary bg-primary-light"
                        : "border-muted hover:border-primary/50 bg-white"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      hasFiber === option.value ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                    {hasFiber === option.value && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {currentStep === "speed" && (
              <div className="space-y-2">
                {[
                  { value: "basic", label: "Basis", description: "Mail & browsen" },
                  { value: "medium", label: "Gemiddeld", description: "Streamen" },
                  { value: "high", label: "Veel", description: "Thuiswerken/gamen" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSpeedPreference(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      speedPreference === option.value
                        ? "border-primary bg-primary-light"
                        : "border-muted hover:border-primary/50 bg-white"
                    )}
                  >
                    <div className="text-left">
                      <span className={cn(
                        "font-medium block",
                        speedPreference === option.value ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                    {speedPreference === option.value && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {currentStep === "bundle" && (
              <div className="space-y-2">
                {[
                  { value: "internet_only", label: "Alleen internet" },
                  { value: "internet_tv", label: "Internet + tv" },
                  { value: "internet_tv_mobile", label: "Internet + tv + mobiel" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBundle(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      bundle === option.value
                        ? "border-primary bg-primary-light"
                        : "border-muted hover:border-primary/50 bg-white"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      bundle === option.value ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                    {bundle === option.value && (
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
