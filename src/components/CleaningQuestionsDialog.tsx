import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Home, Building2, Castle, Info, CheckCircle2 } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

interface CleaningQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo>) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
}

const stepExplanations = {
  1: "Dit helpt ons de juiste schoonmaakpartners te selecteren.",
  2: "Zo kunnen we een realistische inschatting maken van de benodigde tijd.",
  3: "Wanneer wil je de schoonmaak laten uitvoeren?",
  4: "Heb je specifieke wensen of aandachtspunten?",
};

export function CleaningQuestionsDialog({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
  onCompleteTask,
}: CleaningQuestionsDialogProps) {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState(1);
  const [housingType, setHousingType] = useState("");
  const [homeSizeM2, setHomeSizeM2] = useState("");
  const [preferredServiceDate, setPreferredServiceDate] = useState("");
  const [specificWishes, setSpecificWishes] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize values when dialog opens
  useEffect(() => {
    if (open) {
      setHousingType(movingInfo.housingPropertyType || "");
      setHomeSizeM2(movingInfo.homeSizeM2 || "");
      setPreferredServiceDate((movingInfo as any).preferredServiceDate || "");
      setSpecificWishes("");
      setShowConfirmation(false);
      setStep(1);
    }
  }, [open, movingInfo]);

  const handleNext = () => {
    if (step === 1 && housingType) {
      setStep(2);
    } else if (step === 2 && homeSizeM2) {
      setStep(3);
    } else if (step === 3 && preferredServiceDate) {
      setStep(4);
    }
  };

  const handleComplete = async () => {
    const data: Partial<MovingInfo> = {
      housingPropertyType: housingType,
      homeSizeM2,
      preferredServiceDate,
    };
    
    // Save to Supabase profile
    await saveToProfile(data);
    
    onComplete(data);
    setShowConfirmation(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setShowConfirmation(false);
  };

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
              Je ontvangt binnenkort bericht met beschikbare opties.
            </p>
            <div className="w-full space-y-2 mt-4">
              <Button 
                onClick={() => {
                  onCompleteTask?.();
                  handleClose();
                }}
                className="w-full"
              >
                Taak afronden
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
          <DialogTitle>Schoonmaak regelen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Wat voor type woning heb je?</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[1]}</p>
              </div>
              <RadioGroup value={housingType} onValueChange={setHousingType}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="apartment" id="apartment" />
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="apartment" className="flex-1 cursor-pointer">Appartement</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="house" id="house" />
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="house" className="flex-1 cursor-pointer">Tussenwoning / hoekwoning</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="detached" id="detached" />
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="detached" className="flex-1 cursor-pointer">Vrijstaande woning</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="villa" id="villa" />
                  <Castle className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="villa" className="flex-1 cursor-pointer">Villa</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!housingType}
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
                onClick={handleNext} 
                disabled={!preferredServiceDate}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>Specifieke wensen (optioneel)</Label>
              <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{stepExplanations[4]}</p>
              </div>
              <Textarea
                placeholder="Bijv. extra aandacht voor de keuken, ramen buitenkant, etc."
                value={specificWishes}
                onChange={(e) => setSpecificWishes(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleComplete}
                className="w-full"
              >
                Versturen
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
