import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Home, Building2 } from "lucide-react";
import { MovingInfo } from "@/pages/Index";

interface ParkingQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo>) => void;
  onRedirect: () => void;
}

export function ParkingQuestionsDialog({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect
}: ParkingQuestionsDialogProps) {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState<"house" | "apartment" | "studio" | "">("");
  const [floorLevel, setFloorLevel] = useState("");
  const [municipality, setMunicipality] = useState("");

  // Initialize values when dialog opens
  useEffect(() => {
    if (open) {
      setPropertyType(movingInfo.propertyType || "");
      setFloorLevel(movingInfo.floorLevel || "");
      setMunicipality((movingInfo as any).municipality || "");
      
      // Calculate which step to start from based on existing data
      if (!movingInfo.propertyType) {
        setStep(1);
      } else if (!movingInfo.floorLevel) {
        setStep(2);
      } else if (!(movingInfo as any).municipality) {
        setStep(3);
      } else {
        setStep(1);
      }
    }
  }, [open, movingInfo]);

  const handleNext = () => {
    if (step === 1 && propertyType) {
      if (movingInfo.floorLevel) {
        if ((movingInfo as any).municipality) {
          handleComplete();
        } else {
          setStep(3);
        }
      } else {
        setStep(2);
      }
    } else if (step === 2 && floorLevel) {
      if ((movingInfo as any).municipality) {
        handleComplete();
      } else {
        setStep(3);
      }
    } else if (step === 3 && municipality.trim()) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete({
      propertyType: propertyType as "house" | "apartment" | "studio",
      floorLevel,
      municipality
    } as Partial<MovingInfo>);
    onOpenChange(false);
    onRedirect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parkeervergunning & Verhuislift</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Wat voor type woning betrek je?</Label>
              <RadioGroup value={propertyType} onValueChange={(v) => setPropertyType(v as "house" | "apartment" | "studio")}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="house" id="house" />
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="house" className="flex-1 cursor-pointer">Huis</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="apartment" id="apartment" />
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="apartment" className="flex-1 cursor-pointer">Appartement</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="studio" id="studio" />
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="studio" className="flex-1 cursor-pointer">Studio</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!propertyType}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Op welke verdieping is de woning?</Label>
              <RadioGroup value={floorLevel} onValueChange={setFloorLevel}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="0" id="floor0" />
                  <Label htmlFor="floor0" className="flex-1 cursor-pointer">Begane grond</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="1" id="floor1" />
                  <Label htmlFor="floor1" className="flex-1 cursor-pointer">1e verdieping</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="2" id="floor2" />
                  <Label htmlFor="floor2" className="flex-1 cursor-pointer">2e verdieping</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="3+" id="floor3plus" />
                  <Label htmlFor="floor3plus" className="flex-1 cursor-pointer">3e verdieping of hoger</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!floorLevel}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>In welke gemeente ga je wonen?</Label>
              <Input
                placeholder="Bijv. Amsterdam, Rotterdam, Utrecht..."
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Dit hebben we nodig om te bepalen of je een parkeervergunning of verhuislift moet aanvragen.
              </p>
              <Button 
                onClick={handleComplete} 
                disabled={!municipality.trim()}
                className="w-full"
              >
                Bekijk opties
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
