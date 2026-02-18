import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, CheckCircle2, Home, Euro, Shield, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

type OpstalQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onCompleteTask?: () => void;
};

const woningTypeOptions = [
  { value: "appartement", label: "Appartement" },
  { value: "tussenwoning", label: "Tussenwoning" },
  { value: "hoekwoning", label: "Hoekwoning" },
  { value: "twee_onder_een_kap", label: "2-onder-1-kap" },
  { value: "vrijstaand", label: "Vrijstaande woning" },
];

const bouwjaarOptions = [
  { value: "voor_1930", label: "Vóór 1930" },
  { value: "1930_1960", label: "1930 - 1960" },
  { value: "1960_1980", label: "1960 - 1980" },
  { value: "1980_2000", label: "1980 - 2000" },
  { value: "na_2000", label: "Na 2000" },
];

const dakTypeOptions = [
  { value: "pannendak", label: "Pannendak" },
  { value: "plat_dak", label: "Plat dak" },
  { value: "rieten_dak", label: "Rieten dak" },
  { value: "combinatie", label: "Combinatie" },
];

type Step = "address" | "woningType" | "bouwjaar" | "dakType" | "confirmation";

export const OpstalQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onCompleteTask,
}: OpstalQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [address, setAddress] = useState<string>("");
  const [woningType, setWoningType] = useState<string>("");
  const [bouwjaar, setBouwjaar] = useState<string>("");
  const [dakType, setDakType] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAddress(movingInfo.newAddress || "");
      setWoningType((movingInfo as any).housingPropertyType || "");
      setBouwjaar((movingInfo as any).buildingYear || "");
      setDakType("");
      setCurrentStep("address");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleNext = async () => {
    if (currentStep === "address") {
      setCurrentStep("woningType");
    } else if (currentStep === "woningType") {
      setCurrentStep("bouwjaar");
    } else if (currentStep === "bouwjaar") {
      setCurrentStep("dakType");
    } else if (currentStep === "dakType") {
      setIsSaving(true);
      
      const data: Record<string, any> = {
        newAddress: address,
        housingPropertyType: woningType,
        buildingYear: bouwjaar,
        opstalDakType: dakType,
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
      case "woningType":
        return woningType !== "";
      case "bouwjaar":
        return bouwjaar !== "";
      case "dakType":
        return dakType !== "";
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
              Lua gaat aan de slag en komt snel terug met de beste opstalverzekeringen voor jouw woning.
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
                {["address", "woningType", "bouwjaar", "dakType"].map((step, idx) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["address", "woningType", "bouwjaar", "dakType"].indexOf(currentStep)
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
                        Voor welke woning zoek je een opstalverzekering? 🏠
                      </p>
                    )}
                    {currentStep === "woningType" && (
                      <p className="text-foreground">
                        Wat voor type woning is het? 🏘️
                      </p>
                    )}
                    {currentStep === "bouwjaar" && (
                      <p className="text-foreground">
                        Wanneer is de woning gebouwd? 📅
                      </p>
                    )}
                    {currentStep === "dakType" && (
                      <p className="text-foreground">
                        Wat voor type dak heeft de woning? Dit is belangrijk voor de premie. 🏠
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

                {currentStep === "woningType" && (
                  <div className="space-y-2">
                    {woningTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setWoningType(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          woningType === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          woningType === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {woningType === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === "bouwjaar" && (
                  <div className="space-y-2">
                    {bouwjaarOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBouwjaar(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          bouwjaar === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          bouwjaar === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {bouwjaar === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === "dakType" && (
                  <div className="space-y-2">
                    {dakTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDakType(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          dakType === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          dakType === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {dakType === option.value && (
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
                {isSaving ? "Opslaan..." : currentStep === "dakType" ? "Versturen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};