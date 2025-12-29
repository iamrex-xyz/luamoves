import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

interface SmokeDetectorQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo>) => void;
  onRedirect: () => void;
}

export function SmokeDetectorQuestionsDialog({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect
}: SmokeDetectorQuestionsDialogProps) {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState(1);
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [numberOfBedrooms, setNumberOfBedrooms] = useState("");
  const [showAdvice, setShowAdvice] = useState(false);
  // Initialize values when dialog opens
  useEffect(() => {
    if (open) {
      setNumberOfFloors((movingInfo as any).numberOfFloors || "");
      setNumberOfBedrooms((movingInfo as any).numberOfBedrooms || "");
      setShowAdvice(false);
      
      // Calculate which step to start from based on existing data
      if (!(movingInfo as any).numberOfFloors) {
        setStep(1);
      } else if (!(movingInfo as any).numberOfBedrooms) {
        setStep(2);
      } else {
        setStep(1);
      }
    }
  }, [open, movingInfo]);

  const handleNext = () => {
    if (step === 1 && numberOfFloors) {
      if ((movingInfo as any).numberOfBedrooms) {
        setShowAdvice(true);
      } else {
        setStep(2);
      }
    } else if (step === 2 && numberOfBedrooms) {
      setShowAdvice(true);
    }
  };

  const calculateSmokeDetectors = () => {
    const floors = parseInt(numberOfFloors) || 1;
    const bedrooms = parseInt(numberOfBedrooms) || 1;
    
    // Dutch regulation: 1 per floor + 1 per bedroom
    // Minimum recommendation: floors + bedrooms
    return floors + bedrooms;
  };

  const handleComplete = async () => {
    const data: Partial<MovingInfo> = {
      numberOfFloors,
      numberOfBedrooms
    };
    
    // Save to Supabase profile
    await saveToProfile(data);
    
    onComplete(data);
    onOpenChange(false);
    onRedirect();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rookmelders controleren</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showAdvice && step === 1 && (
            <div className="space-y-4">
              <Label>Hoeveel verdiepingen heeft je woning?</Label>
              <RadioGroup value={numberOfFloors} onValueChange={setNumberOfFloors}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="1" id="floor1" />
                  <Label htmlFor="floor1" className="flex-1 cursor-pointer">1 verdieping (gelijkvloers)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="2" id="floor2" />
                  <Label htmlFor="floor2" className="flex-1 cursor-pointer">2 verdiepingen</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="3" id="floor3" />
                  <Label htmlFor="floor3" className="flex-1 cursor-pointer">3 verdiepingen</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="4" id="floor4plus" />
                  <Label htmlFor="floor4plus" className="flex-1 cursor-pointer">4+ verdiepingen</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!numberOfFloors}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {!showAdvice && step === 2 && (
            <div className="space-y-4">
              <Label>Hoeveel slaapkamers heeft je woning?</Label>
              <RadioGroup value={numberOfBedrooms} onValueChange={setNumberOfBedrooms}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="1" id="bed1" />
                  <Label htmlFor="bed1" className="flex-1 cursor-pointer">1 slaapkamer</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="2" id="bed2" />
                  <Label htmlFor="bed2" className="flex-1 cursor-pointer">2 slaapkamers</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="3" id="bed3" />
                  <Label htmlFor="bed3" className="flex-1 cursor-pointer">3 slaapkamers</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="4" id="bed4" />
                  <Label htmlFor="bed4" className="flex-1 cursor-pointer">4 slaapkamers</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="5" id="bed5plus" />
                  <Label htmlFor="bed5plus" className="flex-1 cursor-pointer">5+ slaapkamers</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!numberOfBedrooms}
                className="w-full"
              >
                Bereken advies
              </Button>
            </div>
          )}

          {showAdvice && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">Rookmelder advies</h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                      Op basis van {numberOfFloors} verdieping{parseInt(numberOfFloors) > 1 ? 'en' : ''} en {numberOfBedrooms} slaapkamer{parseInt(numberOfBedrooms) > 1 ? 's' : ''} heb je waarschijnlijk <strong>{calculateSmokeDetectors()} rookmelders</strong> nodig.
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                      Sinds 1 juli 2022 is het verplicht om op elke verdieping een rookmelder te hebben.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleComplete}
                className="w-full"
              >
                Bekijk rookmelders
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
