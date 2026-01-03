import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, Info, CheckCircle2, Zap, Home, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileSync } from "@/hooks/useProfileSync";

type EnergyQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
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

const woningTypes = [
  { value: "appartement", label: "Appartement" },
  { value: "tussenwoning", label: "Tussenwoning" },
  { value: "hoekwoning", label: "Hoekwoning" },
  { value: "twee_onder_een_kap", label: "2-onder-1-kap" },
  { value: "vrijstaand", label: "Vrijstaande woning" },
];

type Step = "address" | "woningType" | "supplier" | "usage" | "confirmation";

export const EnergyQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
  onCompleteTask,
}: EnergyQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [address, setAddress] = useState<string>("");
  const [woningType, setWoningType] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [estimatedGas, setEstimatedGas] = useState<string>("");
  const [estimatedElectricity, setEstimatedElectricity] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAddress(movingInfo.newAddress || "");
      setWoningType((movingInfo as any).housingPropertyType || "");
      setSupplier(movingInfo.energyCurrentSupplier || "");
      setEstimatedGas("");
      setEstimatedElectricity("");
      setCurrentStep("address");
    }
  }, [open, movingInfo]);

  const handleNext = async () => {
    if (currentStep === "address") {
      setCurrentStep("woningType");
    } else if (currentStep === "woningType") {
      setCurrentStep("supplier");
    } else if (currentStep === "supplier") {
      setCurrentStep("usage");
    } else if (currentStep === "usage") {
      // Save all data and show confirmation
      setIsSaving(true);
      
      const data: Record<string, any> = {
        newAddress: address,
        housingPropertyType: woningType,
        energyCurrentSupplier: supplier,
        energyEstimatedGas: estimatedGas ? parseInt(estimatedGas) : null,
        energyEstimatedElectricity: estimatedElectricity ? parseInt(estimatedElectricity) : null,
      };
      
      // Map to profile column names
      const profileData: Record<string, any> = {
        new_address: address,
        housing_property_type: woningType,
        energy_current_supplier: supplier,
        energy_estimated_gas: estimatedGas ? parseInt(estimatedGas) : null,
        energy_estimated_electricity: estimatedElectricity ? parseInt(estimatedElectricity) : null,
      };
      
      await saveToProfile(profileData);
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
      case "supplier":
        return supplier !== "";
      case "usage":
        return true; // Usage is optional
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
          // Confirmation screen
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Gegevens ontvangen!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-[280px]">
              We gaan nu de beste energiedeals voor je zoeken. Je hoort snel van ons.
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
              {/* Progress indicator */}
              <div className="flex gap-1 mb-6">
                {["address", "woningType", "supplier", "usage"].map((step, idx) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["address", "woningType", "supplier", "usage"].indexOf(currentStep)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>

              {/* Lua avatar + message */}
              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Lua</p>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                    {currentStep === "address" && (
                      <p className="text-foreground">
                        Op welk adres wil je energie aansluiten? 🏠
                      </p>
                    )}
                    {currentStep === "woningType" && (
                      <p className="text-foreground">
                        Wat voor type woning is het? Dit helpt bij het inschatten van je verbruik.
                      </p>
                    )}
                    {currentStep === "supplier" && (
                      <p className="text-foreground">
                        Wie is je huidige energieleverancier? ⚡
                      </p>
                    )}
                    {currentStep === "usage" && (
                      <p className="text-foreground">
                        Heb je een idee van je jaarlijkse verbruik? (optioneel) 📊
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Input based on step */}
              <div className="space-y-4">
                {currentStep === "address" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      Adres nieuwe woning
                    </Label>
                    <Input
                      type="text"
                      placeholder="Straatnaam 123, Plaats"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-14 rounded-xl text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Vul je volledige adres in inclusief huisnummer en plaats
                    </p>
                  </div>
                )}

                {currentStep === "woningType" && (
                  <div className="space-y-2">
                    {woningTypes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setWoningType(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          woningType === option.value
                            ? "border-primary bg-primary-light"
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

                {currentStep === "usage" && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700">
                        Dit is optioneel. We kunnen je verbruik ook inschatten op basis van je woningtype.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Elektriciteit (kWh per jaar)
                      </Label>
                      <Input
                        type="number"
                        placeholder="bijv. 3500"
                        value={estimatedElectricity}
                        onChange={(e) => setEstimatedElectricity(e.target.value)}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-orange-500" />
                        Gas (m³ per jaar)
                      </Label>
                      <Input
                        type="number"
                        placeholder="bijv. 1500"
                        value={estimatedGas}
                        onChange={(e) => setEstimatedGas(e.target.value)}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
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
                {isSaving ? "Opslaan..." : currentStep === "usage" ? "Versturen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
