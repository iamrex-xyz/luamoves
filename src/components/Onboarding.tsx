import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Home, Calendar, Key, Building2, Loader2 } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OnboardingProps = {
  onComplete: (info: MovingInfo, email: string, password: string) => void;
  onLogin: () => void;
};

export const Onboarding = ({ onComplete, onLogin }: OnboardingProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [formData, setFormData] = useState<MovingInfo>({
    oldAddress: "",
    newAddress: "",
    movingDate: "",
    keyHandoverDate: "",
    type: "" as any, // No default selection
    renovationType: "none",
    needsContractorHelp: false,
  });

  const getTotalSteps = () => {
    return 10; // Welcome, intro, addresses, type, dates, loading, success, account (removed step 10)
  };

  const totalSteps = getTotalSteps();

  // Automatically advance from loading screen to success screen
  useEffect(() => {
    if (step === 8) {
      const loadingSteps = [
        "Verhuisplan wordt gemaakt...",
        "Belangrijke taken worden toegevoegd...",
        "Deadlines worden berekend...",
        "Checklists worden gegenereerd...",
      ];
      
      let currentStep = 0;
      const stepInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
          setLoadingStep(currentStep);
          currentStep++;
        } else {
          clearInterval(stepInterval);
        }
      }, 700);

      const timer = setTimeout(() => {
        clearInterval(stepInterval);
        setStep(9); // Go directly to success screen (account creation prompt)
        setLoadingStep(0);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(stepInterval);
      };
    }
  }, [step]);

  const handleNext = async () => {
    if (step === 8) {
      // Loading step - simulate processing
      const loadingSteps = [
        "Verhuisplan wordt gemaakt...",
        "Belangrijke taken worden toegevoegd...",
        "Deadlines worden berekend...",
        "Checklists worden gegenereerd...",
      ];
      
      let currentStep = 0;
      const stepInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
          setLoadingStep(currentStep);
          currentStep++;
        } else {
          clearInterval(stepInterval);
        }
      }, 700);

      const timer = setTimeout(() => {
        clearInterval(stepInterval);
        setStep(9); // Go directly to success screen
        setLoadingStep(0);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(stepInterval);
      };
    } else if (step === 10) {
      // Account creation
      if (email && password) {
        onComplete(formData, email, password);
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  // Auto-advance only for type selection (not addresses - users need to be able to correct mistakes)
  useEffect(() => {
    if (step === 5 && formData.type) {
      const timer = setTimeout(() => {
        setStep(6);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, formData.type]);

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
        return formData.type === "rent" || formData.type === "buy"; // Must have a selection
      case 6:
        return formData.movingDate.length > 0;
      case 7:
        return formData.keyHandoverDate.length > 0;
      case 8:
      case 9:
        return true;
      case 10:
        return email.length > 0 && password.length >= 6 && name.length > 0 && birthDay !== "" && birthMonth !== "" && birthYear !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Card 
        className={`w-full max-w-lg shadow-lg ${step <= 2 ? 'cursor-pointer p-8 md:p-10' : 'p-6 md:p-8'}`}
        onClick={step <= 2 ? handleNext : undefined}
      >
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
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                Wat leuk dat je gaat verhuizen!
              </h2>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                Ik ben Charly,<br />jouw persoonlijke verhuisconcierge.
              </h2>
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
              <div className="relative">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  Een momentje...
                </h2>
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  {[
                    "Verhuisplan wordt gemaakt...",
                    "Belangrijke taken worden toegevoegd...",
                    "Deadlines worden berekend...",
                    "Checklists worden gegenereerd...",
                  ].map((text, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        loadingStep >= index ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          loadingStep > index
                            ? "bg-primary border-primary"
                            : "border-primary"
                        }`}
                      >
                        {loadingStep > index && (
                          <svg
                            className="w-3 h-3 text-primary-foreground animate-in zoom-in duration-200"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
                <Home className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Je verhuisplan is klaar.
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Maak een account aan zodat ik alles voor je kan bewaren en je verder kan helpen.
              </p>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Maak je account aan
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Naam</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Voor- en achternaam"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Geboortedatum</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={birthDay} onValueChange={setBirthDay}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dag" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={birthMonth} onValueChange={setBirthMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Maand" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Januari", "Februari", "Maart", "April", "Mei", "Juni",
                          "Juli", "Augustus", "September", "Oktober", "November", "December"
                        ].map((month, index) => (
                          <SelectItem key={index + 1} value={(index + 1).toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={birthYear} onValueChange={setBirthYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Jaar" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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

        {step === 9 && (
          <div className="mt-8">
            <Button
              onClick={() => setStep(10)}
              size="lg"
              className="w-full min-h-[48px]"
            >
              Begin met verhuizen
            </Button>
          </div>
        )}

        {step === 10 && (
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
