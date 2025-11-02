import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Home, Calendar, Key, Building2 } from "lucide-react";
import { MovingInfo } from "@/pages/Index";

type OnboardingProps = {
  onComplete: (info: MovingInfo) => void;
};

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MovingInfo>({
    oldAddress: "",
    newAddress: "",
    movingDate: "",
    type: "rent",
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.oldAddress.length > 0;
      case 2:
        return formData.newAddress.length > 0;
      case 3:
        return formData.movingDate.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Card className="w-full max-w-lg p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Home className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">VerhuisMee</h1>
          <p className="text-muted-foreground">Jouw slimme verhuisassistent</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                  num <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Stap {step} van 4
          </p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Huidig adres</h2>
              </div>
              <Input
                placeholder="Bijv. Kerkstraat 12, Amsterdam"
                value={formData.oldAddress}
                onChange={(e) =>
                  setFormData({ ...formData, oldAddress: e.target.value })
                }
                className="text-base"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Nieuw adres</h2>
              </div>
              <Input
                placeholder="Bijv. Dorpsplein 5, Utrecht"
                value={formData.newAddress}
                onChange={(e) =>
                  setFormData({ ...formData, newAddress: e.target.value })
                }
                className="text-base"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-info/10">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <h2 className="text-xl font-semibold">Verhuisdatum</h2>
              </div>
              <Input
                type="date"
                value={formData.movingDate}
                onChange={(e) =>
                  setFormData({ ...formData, movingDate: e.target.value })
                }
                className="text-base"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Key className="w-5 h-5 text-warning" />
                </div>
                <h2 className="text-xl font-semibold">Type woning</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, type: "rent" })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.type === "rent"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Key className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Huren</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: "buy" })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.type === "buy"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Kopen</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Terug
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex-1"
          >
            {step === 4 ? "Start mijn verhuizing" : "Volgende"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
