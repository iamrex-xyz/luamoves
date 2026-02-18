import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TreePine, Leaf, Shovel, Info, CheckCircle2, Check } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

interface GardenQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo>) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
}

const stepExplanations = {
  1: "Dit bepaalt of we tuinonderhoud-taken en hoveniers voor je kunnen tonen.",
  2: "De grootte van je tuin bepaalt het werk en de kosten.",
  3: "Zo kunnen we de juiste hoveniers voor jou selecteren.",
};

export function GardenQuestionsDialog({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
  onCompleteTask,
}: GardenQuestionsDialogProps) {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState(1);
  const [hasGarden, setHasGarden] = useState<boolean | null>(null);
  const [gardenSize, setGardenSize] = useState("");
  const [gardenServiceType, setGardenServiceType] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize values when dialog opens
  useEffect(() => {
    if (open) {
      setHasGarden(movingInfo.hasGarden ?? null);
      setGardenSize(movingInfo.gardenSize || "");
      setGardenServiceType((movingInfo as any).gardenServiceType || "");
      setShowConfirmation(false);
      
      // Calculate which step to start from based on existing data
      if (movingInfo.hasGarden === undefined || movingInfo.hasGarden === null) {
        setStep(1);
      } else if (!movingInfo.hasGarden) {
        // No garden, skip to complete
        setStep(1);
      } else if (!movingInfo.gardenSize) {
        setStep(2);
      } else if (!(movingInfo as any).gardenServiceType) {
        setStep(3);
      } else {
        setStep(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleNext = async () => {
    if (step === 1) {
      if (hasGarden === false) {
        // No garden, complete immediately with confirmation
        const data = { hasGarden: false };
        await saveToProfile(data);
        onComplete(data);
        setShowConfirmation(true);
        return;
      }
      if (hasGarden === true) {
        if (movingInfo.gardenSize) {
          if ((movingInfo as any).gardenServiceType) {
            await handleComplete();
          } else {
            setStep(3);
          }
        } else {
          setStep(2);
        }
      }
    } else if (step === 2 && gardenSize) {
      if ((movingInfo as any).gardenServiceType) {
        await handleComplete();
      } else {
        setStep(3);
      }
    } else if (step === 3 && gardenServiceType) {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    const data: Partial<MovingInfo> = {
      hasGarden: true,
      gardenSize: gardenSize as "small" | "medium" | "large",
      gardenServiceType
    };
    
    // Save to Supabase profile
    await saveToProfile(data);
    
    onComplete(data);
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
              {hasGarden ? "We zoeken passende hoveniers voor je." : "Je hebt aangegeven geen tuin te hebben."}
            </p>
            <div className="w-full space-y-2 mt-4">
              {hasGarden && (
                <Button 
                  onClick={handleGoToDeals}
                  className="w-full"
                >
                  Bekijk hoveniers
                </Button>
              )}
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
          <DialogTitle>Tuinonderhoud plannen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Heeft je nieuwe woning een tuin?</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[1]}</p>
              </div>
              <RadioGroup 
                value={hasGarden === true ? "yes" : hasGarden === false ? "no" : ""} 
                onValueChange={(v) => setHasGarden(v === "yes")}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="yes" id="hasGardenYes" />
                  <TreePine className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="hasGardenYes" className="flex-1 cursor-pointer">Ja, ik heb een tuin</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="no" id="hasGardenNo" />
                  <Label htmlFor="hasGardenNo" className="flex-1 cursor-pointer">Nee, geen tuin</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={hasGarden === null}
                className="w-full"
              >
                {hasGarden === false ? "Opslaan" : "Volgende"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Hoe groot is je tuin?</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[2]}</p>
              </div>
              <RadioGroup value={gardenSize} onValueChange={setGardenSize}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="small" id="gardenSmall" />
                  <Label htmlFor="gardenSmall" className="flex-1 cursor-pointer">Klein (&lt; 50 m²)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="medium" id="gardenMedium" />
                  <Label htmlFor="gardenMedium" className="flex-1 cursor-pointer">Gemiddeld (50-150 m²)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="large" id="gardenLarge" />
                  <Label htmlFor="gardenLarge" className="flex-1 cursor-pointer">Groot (&gt; 150 m²)</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!gardenSize}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Wat wil je laten doen?</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[3]}</p>
              </div>
              <RadioGroup value={gardenServiceType} onValueChange={setGardenServiceType}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="maintenance" className="flex-1 cursor-pointer">Onderhoud (snoeien, maaien, etc.)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="design" id="design" />
                  <Shovel className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="design" className="flex-1 cursor-pointer">Nieuwe inrichting</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="both" id="gardenBoth" />
                  <div className="flex gap-1">
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                    <Shovel className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Label htmlFor="gardenBoth" className="flex-1 cursor-pointer">Beide</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleComplete} 
                disabled={!gardenServiceType}
                className="w-full"
              >
                Opslaan
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
