import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, CheckCircle2, Home, Calendar, Building2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

type VerhuisliftQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onCompleteTask?: () => void;
};

const etageOptions = [
  { value: "1", label: "1e verdieping" },
  { value: "2", label: "2e verdieping" },
  { value: "3", label: "3e verdieping" },
  { value: "4", label: "4e verdieping" },
  { value: "5_of_hoger", label: "5e verdieping of hoger" },
];

const toegangOptions = [
  { value: "makkelijk", label: "Makkelijk bereikbaar (brede straat)" },
  { value: "beperkt", label: "Beperkt bereikbaar (smalle straat)" },
  { value: "lastig", label: "Lastig bereikbaar (grachtenpand, steeg)" },
];

const liftLocatieOptions = [
  { value: "oud_adres", label: "Alleen bij oude adres" },
  { value: "nieuw_adres", label: "Alleen bij nieuwe adres" },
  { value: "beide", label: "Bij beide adressen" },
];

type Step = "address" | "etage" | "toegang" | "locatie" | "confirmation";

export const VerhuisliftQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onCompleteTask,
}: VerhuisliftQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [address, setAddress] = useState<string>("");
  const [etage, setEtage] = useState<string>("");
  const [toegang, setToegang] = useState<string>("");
  const [liftLocatie, setLiftLocatie] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAddress(movingInfo.newAddress || "");
      setEtage((movingInfo as any).floorLevel || "");
      setToegang((movingInfo as any).buildingAccess || "");
      setLiftLocatie("");
      setCurrentStep("address");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleNext = async () => {
    if (currentStep === "address") {
      setCurrentStep("etage");
    } else if (currentStep === "etage") {
      setCurrentStep("toegang");
    } else if (currentStep === "toegang") {
      setCurrentStep("locatie");
    } else if (currentStep === "locatie") {
      setIsSaving(true);
      
      const data: Record<string, any> = {
        newAddress: address,
        floorLevel: etage,
        buildingAccess: toegang,
        verhuisliftLocatie: liftLocatie,
      };
      
      await saveToProfile(data);
      onComplete(data);
      
      setIsSaving(false);
      setCurrentStep("confirmation");
    }
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case "address":
        return address.trim().length >= 5;
      case "etage":
        return etage !== "";
      case "toegang":
        return toegang !== "";
      case "locatie":
        return liftLocatie !== "";
      case "confirmation":
        return true;
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent className="max-h-[85vh]">
        {currentStep === "confirmation" ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Wordt geregeld!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-[280px]">
              Lua gaat aan de slag en komt snel terug met de beste verhuislift-aanbiedingen in jouw regio.
            </p>
            <div className="w-full max-w-[280px] space-y-2">
              <Button 
                variant="ghost"
                onClick={handleClose}
                className="w-full h-10 text-muted-foreground"
              >
                Sluiten
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex gap-1 mb-6">
                {["address", "etage", "toegang", "locatie"].map((step, idx) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["address", "etage", "toegang", "locatie"].indexOf(currentStep)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Lua</p>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                    {currentStep === "address" && (
                      <p className="text-foreground">
                        Op welk adres heb je een verhuislift nodig? 🏠
                      </p>
                    )}
                    {currentStep === "etage" && (
                      <p className="text-foreground">
                        Op welke verdieping is de woning? 🏢
                      </p>
                    )}
                    {currentStep === "toegang" && (
                      <p className="text-foreground">
                        Hoe goed is het pand bereikbaar voor een verhuislift? 🚛
                      </p>
                    )}
                    {currentStep === "locatie" && (
                      <p className="text-foreground">
                        Waar heb je de verhuislift nodig? 📍
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentStep === "address" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      Adres
                    </Label>
                    <Input
                      type="text"
                      placeholder="Straatnaam 123, Plaats"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-14 rounded-xl text-base"
                    />
                  </div>
                )}

                {currentStep === "etage" && (
                  <div className="space-y-2">
                    {etageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setEtage(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          etage === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          etage === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {etage === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === "toegang" && (
                  <div className="space-y-2">
                    {toegangOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setToegang(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          toegang === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium text-left",
                          toegang === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {toegang === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === "locatie" && (
                  <div className="space-y-2">
                    {liftLocatieOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLiftLocatie(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          liftLocatie === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          liftLocatie === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {liftLocatie === option.value && (
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

            <div className="p-6 pt-4 border-t bg-background flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1 h-12 rounded-xl"
              >
                Later
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!isCurrentStepValid() || isSaving} 
                className="flex-1 h-12 rounded-xl"
              >
                {isSaving ? "Opslaan..." : currentStep === "locatie" ? "Versturen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};