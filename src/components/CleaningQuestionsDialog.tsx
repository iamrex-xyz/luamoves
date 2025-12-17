import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Paintbrush, Info } from "lucide-react";
import { MovingInfo } from "@/pages/Index";

interface CleaningQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo>) => void;
  onRedirect: () => void;
}

const stepExplanations = {
  1: "Dit bepaalt welke vakmensen we voor je zoeken.",
  2: "Grotere ruimtes kosten meer tijd. Zo krijg je een realistische prijsindicatie.",
  3: "Zo kunnen we beschikbare vakmensen voor je vinden.",
};

export function CleaningQuestionsDialog({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect
}: CleaningQuestionsDialogProps) {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState("");
  const [homeSizeM2, setHomeSizeM2] = useState("");
  const [preferredServiceDate, setPreferredServiceDate] = useState("");

  // Initialize values when dialog opens
  useEffect(() => {
    if (open) {
      setServiceType((movingInfo as any).serviceType || "");
      setHomeSizeM2(movingInfo.homeSizeM2 || "");
      setPreferredServiceDate((movingInfo as any).preferredServiceDate || "");
      
      // Calculate which step to start from based on existing data
      if (!(movingInfo as any).serviceType) {
        setStep(1);
      } else if (!movingInfo.homeSizeM2) {
        setStep(2);
      } else if (!(movingInfo as any).preferredServiceDate) {
        setStep(3);
      } else {
        setStep(1);
      }
    }
  }, [open, movingInfo]);

  const handleNext = () => {
    if (step === 1 && serviceType) {
      if (movingInfo.homeSizeM2) {
        if ((movingInfo as any).preferredServiceDate) {
          handleComplete();
        } else {
          setStep(3);
        }
      } else {
        setStep(2);
      }
    } else if (step === 2 && homeSizeM2) {
      if ((movingInfo as any).preferredServiceDate) {
        handleComplete();
      } else {
        setStep(3);
      }
    } else if (step === 3 && preferredServiceDate) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete({
      serviceType,
      homeSizeM2,
      preferredServiceDate
    } as Partial<MovingInfo>);
    onOpenChange(false);
    onRedirect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schoonmaak of Schilderwerk</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Wat voor klus wil je laten uitvoeren?</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[1]}</p>
              </div>
              <RadioGroup value={serviceType} onValueChange={setServiceType}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="cleaning" id="cleaning" />
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="cleaning" className="flex-1 cursor-pointer">Schoonmaak</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="painting" id="painting" />
                  <Paintbrush className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="painting" className="flex-1 cursor-pointer">Schilderwerk</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="both" id="both" />
                  <div className="flex gap-1">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <Paintbrush className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Label htmlFor="both" className="flex-1 cursor-pointer">Beide</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!serviceType}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Hoe groot is de woning (in m²)?</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[2]}</p>
              </div>
              <RadioGroup value={homeSizeM2} onValueChange={setHomeSizeM2}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="flex-1 cursor-pointer">Klein (&lt; 50 m²)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="flex-1 cursor-pointer">Gemiddeld (50-100 m²)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="flex-1 cursor-pointer">Groot (100-150 m²)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="xlarge" id="xlarge" />
                  <Label htmlFor="xlarge" className="flex-1 cursor-pointer">Zeer groot (&gt; 150 m²)</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!homeSizeM2}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Wat is de gewenste datum?</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[3]}</p>
              </div>
              <Input
                type="date"
                value={preferredServiceDate}
                onChange={(e) => setPreferredServiceDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Button 
                onClick={handleComplete} 
                disabled={!preferredServiceDate}
                className="w-full"
              >
                Bekijk aanbieders
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
