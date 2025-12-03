import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Key, Building2 } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

type SimpleOnboardingProps = {
  onComplete: (info: MovingInfo) => void;
  onLogin: () => void;
};

export const SimpleOnboarding = ({ onComplete, onLogin }: SimpleOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MovingInfo>({
    oldAddress: "",
    newAddress: "",
    movingDate: "",
    keyHandoverDate: "",
    type: "" as any,
    renovationType: "none",
    needsContractorHelp: false,
  });

  const totalSteps = 4; // Welcome, new address, old address, type

  // Auto-advance for type selection
  useEffect(() => {
    if (step === 4 && formData.type) {
      const timer = setTimeout(() => {
        onComplete(formData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, formData.type, formData, onComplete]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return formData.newAddress.length > 0;
      case 3:
        return formData.oldAddress.length > 0;
      case 4:
        return formData.type === "rent" || formData.type === "buy";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Card 
        className={`w-full max-w-lg shadow-lg ${step === 1 ? 'cursor-pointer p-8 md:p-10' : 'p-6 md:p-8'}`}
        onClick={step === 1 ? handleNext : undefined}
      >
        {step > 1 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {Array.from({ length: 3 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                    num <= (step - 1) ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Vraag {step - 1} van 3
            </p>
          </div>
        )}

        <div className="space-y-6">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                Wat leuk dat je gaat verhuizen!
              </h2>
              <p className="text-muted-foreground">
                Ik ben Charly, jouw persoonlijke verhuisconcierge.
              </p>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onLogin();
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Heb je al een account? Log in
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wat is je nieuwe adres?
              </h2>
              <AddressAutocomplete
                label=""
                placeholder="Begin met typen..."
                value={formData.newAddress}
                onChange={(address) =>
                  setFormData({ ...formData, newAddress: address })
                }
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wat is je huidige adres?
              </h2>
              <AddressAutocomplete
                label=""
                placeholder="Begin met typen..."
                value={formData.oldAddress}
                onChange={(address) =>
                  setFormData({ ...formData, oldAddress: address })
                }
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Ga je huren of kopen?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, type: "rent" })}
                  className={`p-8 md:p-6 rounded-lg border-2 transition-all min-h-[120px] ${
                    formData.type === "rent"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Key className="w-10 h-10 md:w-8 md:h-8 mx-auto mb-3 text-primary" />
                  <p className="font-semibold text-base">Huren</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: "buy" })}
                  className={`p-8 md:p-6 rounded-lg border-2 transition-all min-h-[120px] ${
                    formData.type === "buy"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Building2 className="w-10 h-10 md:w-8 md:h-8 mx-auto mb-3 text-primary" />
                  <p className="font-semibold text-base">Kopen</p>
                </button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step > 1 && step < 4 && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Terug
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Volgende
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
