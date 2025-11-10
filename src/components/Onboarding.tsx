import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Home, Calendar, Key, Building2, Loader2 } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type OnboardingProps = {
  onComplete: (info: MovingInfo, email: string, password: string) => void;
  onLogin: () => void;
};

export const Onboarding = ({ onComplete, onLogin }: OnboardingProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    return 11; // Welcome, intro, addresses, type, dates, loading, success, account
  };

  const totalSteps = getTotalSteps();

  const handleNext = async () => {
    if (step === 8) {
      // Loading step - simulate processing
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(9);
      }, 2000);
    } else if (step === 11) {
      // Account creation
      if (email && password) {
        onComplete(formData, email, password);
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 3 && step < 8) setStep(step - 1); // Only allow back on question steps
  };

  const handleSkipDate = () => {
    if (step === 6) {
      setFormData({ ...formData, movingDate: "" });
      setStep(7);
    } else if (step === 7) {
      setFormData({ ...formData, keyHandoverDate: "" });
      setStep(8);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
      case 2:
        return true; // Welcome screens
      case 3:
        return formData.newAddress.length > 0;
      case 4:
        return formData.oldAddress.length > 0;
      case 5:
        return true; // property type
      case 6:
        return formData.movingDate.length > 0;
      case 7:
        return formData.keyHandoverDate.length > 0;
      case 8:
      case 9:
      case 10:
        return true;
      case 11:
        return email.length > 0 && password.length >= 6;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Card className="w-full max-w-lg p-6 md:p-8 shadow-lg">
        {step > 2 && step < 8 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                    num <= (step - 2) ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Vraag {step - 2} van 5
            </p>
          </div>
        )}

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Wat leuk dat je gaat verhuizen!
              </h2>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Ik ben Charly, jouw persoonlijke verhuisconcierge
              </h2>
            </div>
          )}

          {step === 3 && (
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

          {step === 4 && (
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

          {step === 5 && (
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

          {step === 6 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wanneer ga je verhuizen?
              </h2>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.movingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, movingDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="text-base text-center [&::-webkit-datetime-edit]:text-center [&::-webkit-datetime-edit]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
              <Button
                variant="ghost"
                onClick={handleSkipDate}
                className="w-full"
              >
                Ik heb nog geen datum
              </Button>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wanneer krijg je de sleutels?
              </h2>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.keyHandoverDate}
                  onChange={(e) =>
                    setFormData({ ...formData, keyHandoverDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  max={formData.movingDate}
                  className="text-base text-center [&::-webkit-datetime-edit]:text-center [&::-webkit-datetime-edit]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
              <Button
                variant="ghost"
                onClick={handleSkipDate}
                className="w-full"
              >
                Ik heb nog geen datum
              </Button>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
              <div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  Een momentje...
                </h2>
                <p className="text-muted-foreground">
                  Charly maakt een persoonlijk verhuisplan voor je aan
                </p>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
                <Home className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Gelukt!
              </h2>
              <p className="text-lg text-muted-foreground">
                Je verhuisplan staat klaar. Laten we aan de slag gaan!
              </p>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <h2 className="text-xl md:text-2xl font-semibold">
                Wil je je voortgang opslaan?
              </h2>
              <p className="text-muted-foreground">
                Maak een account aan om je verhuisplan te bewaren en toegang te krijgen tot alle functies.
              </p>
            </div>
          )}

          {step === 11 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Maak je account aan
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Wachtwoord</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimaal 6 karakters"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {step <= 2 && (
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={onLogin}
              size="sm"
            >
              Ik heb al een account
            </Button>
          </div>
        )}

        {step > 2 && step < 8 && (
          <div className="flex gap-3 mt-8 justify-end">
            {step > 3 && (
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
              className="flex-1 min-h-[48px] text-sm"
            >
              Volgende
            </Button>
          </div>
        )}

        {(step === 1 || step === 2 || step === 9 || step === 10) && (
          <div className="mt-8">
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full min-h-[48px]"
            >
              {step === 9 ? "Doorgaan" : step === 10 ? "Account aanmaken" : "Beginnen"}
            </Button>
          </div>
        )}

        {step === 11 && (
          <div className="mt-8">
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              size="lg"
              className="w-full min-h-[48px]"
            >
              Account aanmaken
            </Button>
            <Button
              variant="ghost"
              onClick={onLogin}
              size="sm"
              className="w-full mt-2"
            >
              Ik heb al een account
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
