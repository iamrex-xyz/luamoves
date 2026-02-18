import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, CheckCircle2, Home, Key, Shield, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

type SlotcilinderQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onCompleteTask?: () => void;
};

const aantalDeurenOptions = [
  { value: "1", label: "1 deur" },
  { value: "2", label: "2 deuren" },
  { value: "3", label: "3 deuren" },
  { value: "4_of_meer", label: "4 of meer deuren" },
];

const veiligheidsniveauOptions = [
  { value: "basis", label: "Basis (SKG*)" },
  { value: "standaard", label: "Standaard (SKG**)" },
  { value: "hoog", label: "Hoog (SKG***)" },
  { value: "weet_niet", label: "Weet ik niet" },
];

const montageOptions = [
  { value: "zelf", label: "Ik monteer zelf" },
  { value: "montage", label: "Inclusief montage" },
];

type Step = "address" | "aantalDeuren" | "veiligheid" | "montage" | "confirmation";

export const SlotcilinderQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onCompleteTask,
}: SlotcilinderQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [address, setAddress] = useState<string>("");
  const [aantalDeuren, setAantalDeuren] = useState<string>("");
  const [veiligheidsniveau, setVeiligheidsniveau] = useState<string>("");
  const [montage, setMontage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAddress(movingInfo.newAddress || "");
      setAantalDeuren("");
      setVeiligheidsniveau("");
      setMontage("");
      setCurrentStep("address");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleNext = async () => {
    if (currentStep === "address") {
      setCurrentStep("aantalDeuren");
    } else if (currentStep === "aantalDeuren") {
      setCurrentStep("veiligheid");
    } else if (currentStep === "veiligheid") {
      setCurrentStep("montage");
    } else if (currentStep === "montage") {
      setIsSaving(true);
      
      const data: Record<string, any> = {
        newAddress: address,
        slotAantalDeuren: aantalDeuren,
        slotVeiligheidsniveau: veiligheidsniveau,
        slotMontage: montage,
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
      case "aantalDeuren":
        return aantalDeuren !== "";
      case "veiligheid":
        return veiligheidsniveau !== "";
      case "montage":
        return montage !== "";
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
              Lua gaat aan de slag en komt snel terug met de beste aanbiedingen voor slotcilinders en slotenmakers.
            </p>
            <div className="w-full max-w-[280px] space-y-2">
              <Button 
                onClick={() => {
                  onCompleteTask?.();
                  handleClose();
                }}
                className="w-full h-12 rounded-xl"
              >
                <Check className="w-4 h-4 mr-2" />
                Taak afronden
              </Button>
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
                {["address", "aantalDeuren", "veiligheid", "montage"].map((step, idx) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["address", "aantalDeuren", "veiligheid", "montage"].indexOf(currentStep)
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
                        Voor welke woning wil je nieuwe sloten? 🏠
                      </p>
                    )}
                    {currentStep === "aantalDeuren" && (
                      <p className="text-foreground">
                        Hoeveel buitendeuren wil je voorzien van nieuwe sloten? 🚪
                      </p>
                    )}
                    {currentStep === "veiligheid" && (
                      <p className="text-foreground">
                        Welk veiligheidsniveau wil je? SKG*** geeft de hoogste bescherming. 🔒
                      </p>
                    )}
                    {currentStep === "montage" && (
                      <p className="text-foreground">
                        Wil je de sloten zelf monteren of inclusief montage? 🔧
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
                      Adres van de woning
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

                {currentStep === "aantalDeuren" && (
                  <div className="space-y-2">
                    {aantalDeurenOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAantalDeuren(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          aantalDeuren === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          aantalDeuren === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {aantalDeuren === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === "veiligheid" && (
                  <div className="space-y-2">
                    {veiligheidsniveauOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setVeiligheidsniveau(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          veiligheidsniveau === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          veiligheidsniveau === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {veiligheidsniveau === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === "montage" && (
                  <div className="space-y-2">
                    {montageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setMontage(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          montage === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          montage === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {montage === option.value && (
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
                {isSaving ? "Opslaan..." : currentStep === "montage" ? "Versturen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};