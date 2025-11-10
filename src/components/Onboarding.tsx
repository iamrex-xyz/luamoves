import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Home, Calendar, Key, Building2, LogOut, Users } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type OnboardingProps = {
  onComplete: (info: MovingInfo) => void;
};

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MovingInfo>({
    oldAddress: "",
    newAddress: "",
    movingDate: "",
    keyHandoverDate: "",
    type: "rent",
    renovationType: "none",
    needsContractorHelp: false,
  });

  const getTotalSteps = () => {
    return 7; // Fixed 7 steps for consistency
  };

  const totalSteps = getTotalSteps();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
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
        return true; // property type
      case 5:
        return true; // key handover - optional
      case 6:
        return true; // renovation question
      case 7:
        return true; // contractor help
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Card className="w-full max-w-lg p-6 md:p-8 shadow-lg">
        <div className="mb-6 md:mb-8 text-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="absolute right-0 top-0 h-10 w-10"
            title="Uitloggen"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mb-4">
            <Home className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-charly">Charly</h1>
          <p className="text-base md:text-lg text-muted-foreground">jouw persoonlijke verhuisconcierge</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
              <div
                key={num}
                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                  num <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Stap {step} van {totalSteps}
          </p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold">Huidig adres</h2>
              </div>
              <AddressAutocomplete
                label=""
                placeholder="Bijv. Kerkstraat 12, Amsterdam"
                value={formData.oldAddress}
                onChange={(address) =>
                  setFormData({ ...formData, oldAddress: address })
                }
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold">Nieuw adres</h2>
              </div>
              <AddressAutocomplete
                label=""
                placeholder="Bijv. Dorpsplein 5, Utrecht"
                value={formData.newAddress}
                onChange={(address) =>
                  setFormData({ ...formData, newAddress: address })
                }
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-info/10">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold">Verhuisdatum</h2>
              </div>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.movingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, movingDate: e.target.value })
                  }
                  className="text-base text-center [&::-webkit-datetime-edit]:text-center [&::-webkit-datetime-edit]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                {!formData.movingDate && (
                  <span className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-muted-foreground text-sm">
                    dd-mm-jj
                  </span>
                )}
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Key className="w-5 h-5 text-warning" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold">Type woning</h2>
              </div>
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

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Key className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold">
                  {formData.type === "rent" ? "Sleuteloverdracht" : "Overdracht"}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {formData.type === "rent" 
                  ? "Wanneer krijg je de sleutels van je nieuwe woning? (meestal voor de verhuisdatum)"
                  : "Wanneer krijg je de sleutels van je gekochte woning? (meestal op de dag van overdracht)"
                }
              </p>
              <Input
                type="date"
                value={formData.keyHandoverDate}
                max={formData.movingDate}
                onChange={(e) =>
                  setFormData({ ...formData, keyHandoverDate: e.target.value })
                }
                className="text-base"
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Building2 className="w-5 h-5 text-warning" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold">Ga je verbouwen?</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setFormData({ ...formData, renovationType: "none" })}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.renovationType === "none"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold">Nee</p>
                  <p className="text-sm text-muted-foreground">Geen verbouwing gepland</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, renovationType: "small" })}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.renovationType === "small"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold">Ja, kleine klussen</p>
                  <p className="text-sm text-muted-foreground">Schilderen, behangen, kleine reparaties</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, renovationType: "large" })}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.renovationType === "large"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold">Ja, grote verbouwing</p>
                  <p className="text-sm text-muted-foreground">Keuken, badkamer, aanbouw, etc.</p>
                </button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-info/10">
                  <Users className="w-5 h-5 text-info" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold">Hulp nodig?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Wil je dat Charly je helpt met het vinden van een gepaste aannemer?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, needsContractorHelp: true })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.needsContractorHelp
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold text-sm">Ja graag</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, needsContractorHelp: false })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    !formData.needsContractorHelp
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold text-sm">Nee dankje</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8 justify-end">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              size="lg"
              className="flex-1 min-h-[48px] text-sm"
            >
              Terug
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            size="lg"
            className={`min-h-[48px] text-sm ${
              step === 1 
                ? 'w-full max-w-[200px] mx-auto' 
                : step === totalSteps 
                  ? 'w-[calc(50%-0.375rem)]' 
                  : 'flex-1'
            }`}
          >
            {step === totalSteps ? "Start verhuizing" : "Volgende"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
