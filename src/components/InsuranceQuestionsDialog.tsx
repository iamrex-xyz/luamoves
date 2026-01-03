import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Ruler, 
  Wallet, 
  Check, 
  Sparkles, 
  CheckCircle2,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

type InsuranceQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (updatedInfo: Partial<MovingInfo>) => void;
  onRedirect: () => void;
};

type Step = 'woningType' | 'size' | 'value' | 'confirmation';

const woningTypes = [
  { value: "appartement", label: "Appartement" },
  { value: "tussenwoning", label: "Tussenwoning" },
  { value: "hoekwoning", label: "Hoekwoning" },
  { value: "twee_onder_een_kap", label: "2-onder-1-kap" },
  { value: "vrijstaand", label: "Vrijstaande woning" },
];

const sizeOptions = [
  { value: '0-50', label: 'Tot 50 m²' },
  { value: '50-75', label: '50-75 m²' },
  { value: '75-100', label: '75-100 m²' },
  { value: '100-150', label: '100-150 m²' },
  { value: '150+', label: 'Meer dan 150 m²' },
];

const valueOptions = [
  { value: 'tot-15000', label: 'Tot €15.000', description: 'Klein appartement, weinig spullen' },
  { value: '15000-30000', label: '€15.000 - €30.000', description: 'Gemiddeld appartement' },
  { value: '30000-50000', label: '€30.000 - €50.000', description: 'Ruime woning, meer spullen' },
  { value: '50000-75000', label: '€50.000 - €75.000', description: 'Grote woning, waardevolle items' },
  { value: '75000+', label: 'Meer dan €75.000', description: 'Zeer ruim, luxe inboedel' },
];

export const InsuranceQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
}: InsuranceQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState<Step>('woningType');
  const [woningType, setWoningType] = useState((movingInfo as any).housingPropertyType || '');
  const [homeSizeM2, setHomeSizeM2] = useState(movingInfo.homeSizeM2 || '');
  const [insuranceValue, setInsuranceValue] = useState(movingInfo.insuranceValue || '');
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setWoningType((movingInfo as any).housingPropertyType || '');
      setHomeSizeM2(movingInfo.homeSizeM2 || '');
      setInsuranceValue(movingInfo.insuranceValue || '');
      setStep('woningType');
    }
  }, [open, movingInfo]);

  const handleNext = async () => {
    if (step === 'woningType') {
      setStep('size');
    } else if (step === 'size') {
      setStep('value');
    } else if (step === 'value') {
      setIsSaving(true);
      
      const data: Record<string, any> = {
        housingPropertyType: woningType,
        homeSizeM2,
        insuranceValue,
      };
      
      const profileData: Record<string, any> = {
        housing_property_type: woningType,
        home_size_m2: homeSizeM2,
        insurance_value: insuranceValue,
      };
      
      await saveToProfile(profileData);
      onComplete(data);
      
      setIsSaving(false);
      setStep('confirmation');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'woningType':
        return woningType !== '';
      case 'size':
        return homeSizeM2 !== '';
      case 'value':
        return insuranceValue !== '';
      default:
        return false;
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent className="max-h-[90vh]">
        {step === 'confirmation' ? (
          // Confirmation screen
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Gegevens ontvangen!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-[280px]">
              Dank je! We zoeken de beste verzekering voor jouw situatie.
            </p>
            <Button 
              onClick={handleClose}
              className="w-full max-w-[200px] h-12 rounded-xl"
            >
              Sluiten
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Progress indicator */}
              <div className="flex gap-1 mb-6">
                {["woningType", "size", "value"].map((s, idx) => (
                  <div 
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["woningType", "size", "value"].indexOf(step)
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
                    {step === "woningType" && (
                      <p className="text-foreground">
                        Wat voor type woning ga je verzekeren? 🏠
                      </p>
                    )}
                    {step === "size" && (
                      <p className="text-foreground">
                        Hoe groot is je woning? 📐
                      </p>
                    )}
                    {step === "value" && (
                      <p className="text-foreground">
                        Wat is de geschatte waarde van je inboedel? 💰
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Input based on step */}
              <div className="space-y-4">
                {step === "woningType" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      Type woning
                    </Label>
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

                {step === "size" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2 mb-3">
                      <Ruler className="w-4 h-4 text-muted-foreground" />
                      Woonoppervlak
                    </Label>
                    {sizeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setHomeSizeM2(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          homeSizeM2 === option.value
                            ? "border-primary bg-primary-light"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          homeSizeM2 === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {homeSizeM2 === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {step === "value" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      Geschatte waarde inboedel
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Denk aan meubels, elektronica, kleding, sieraden, etc.
                    </p>
                    {valueOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setInsuranceValue(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          insuranceValue === option.value
                            ? "border-primary bg-primary-light"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <div className="text-left">
                          <span className={cn(
                            "font-medium block",
                            insuranceValue === option.value ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {option.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                        {insuranceValue === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
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
                onClick={handleClose} 
                className="flex-1 h-12 rounded-xl"
              >
                Later
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!canProceed() || isSaving} 
                className="flex-1 h-12 rounded-xl"
              >
                {isSaving ? "Opslaan..." : step === "value" ? "Versturen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
