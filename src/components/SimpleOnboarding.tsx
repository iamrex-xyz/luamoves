import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { MovingInfo } from "@/pages/Index";
import { cn } from "@/lib/utils";

type SimpleOnboardingProps = {
  onComplete: (info: MovingInfo) => void;
  onLogin: () => void;
};

const generatingSteps = [
  "Je verhuisdatum analyseren...",
  "Belangrijke deadlines berekenen...",
  "Persoonlijke taken samenstellen...",
  "Je checklist gereedmaken...",
];

export const SimpleOnboarding = ({ onComplete, onLogin }: SimpleOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [movingDate, setMovingDate] = useState<Date | undefined>(undefined);
  const [postcode, setPostcode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [currentGeneratingStep, setCurrentGeneratingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const totalSteps = 4; // Welcome, date, address, generating

  // Handle the generating animation
  useEffect(() => {
    if (step === 4) {
      const interval = setInterval(() => {
        setCurrentGeneratingStep((prev) => {
          if (prev < generatingSteps.length - 1) {
            setCompletedSteps((completed) => [...completed, prev]);
            return prev + 1;
          }
          return prev;
        });
      }, 800);

      // Complete after all steps
      const timeout = setTimeout(() => {
        onComplete({
          oldAddress: "",
          newAddress: `${postcode} ${houseNumber}`.trim(),
          movingDate: movingDate ? format(movingDate, "yyyy-MM-dd") : "",
          type: "rent",
          renovationType: "none",
          needsContractorHelp: false,
        });
      }, generatingSteps.length * 800 + 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [step, postcode, houseNumber, movingDate, onComplete]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleStartGenerating = () => {
    setStep(4);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!movingDate;
      case 3:
        return postcode.length >= 4 && houseNumber.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/80 to-white">
      {step === 1 ? (
        <div 
          className="min-h-screen flex flex-col cursor-pointer"
          onClick={handleNext}
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLogin();
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Inloggen
            </Button>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Large headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Jouw verhuizing,
                  <br />
                  <span className="text-orange-500">georganiseerd.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  Krijg een persoonlijke checklist met slimme deadlines die meetellen naar jouw verhuisdag.
                </p>
              </div>

              {/* Stacked preview cards */}
              <div className="relative h-48 md:h-56 mt-8">
                {/* Back card */}
                <div className="absolute top-6 left-4 right-4 h-full bg-white/60 rounded-3xl shadow-lg transform rotate-2" />
                {/* Middle card */}
                <div className="absolute top-3 left-2 right-2 h-full bg-white/80 rounded-3xl shadow-lg transform -rotate-1" />
                {/* Front card */}
                <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl shadow-orange-200/50 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Vandaag</p>
                        <p className="text-sm text-muted-foreground">3 taken</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500">42</p>
                      <p className="text-xs text-muted-foreground">dagen te gaan</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <div className="w-5 h-5 rounded-full border-2 border-orange-400" />
                      <span className="text-sm text-foreground">Verhuisbedrijf boeken</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      <span className="text-sm text-muted-foreground">Adreswijziging doorgeven</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
                <div className="flex items-center gap-3 group">
                  <span className="text-muted-foreground">Start nu</span>
                  <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg 
                      className="w-5 h-5 text-background" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-lg shadow-lg p-6 md:p-8 rounded-2xl border-0">
          {step > 1 && step < 4 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                {Array.from({ length: 2 }, (_, i) => i + 1).map((num) => (
                  <div
                    key={num}
                    className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                      num <= (step - 1) ? "bg-orange-500" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Vraag {step - 1} van 2
              </p>
            </div>
          )}

          <div className="space-y-6">

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wanneer ga je verhuizen?
              </h2>
              <div className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full max-w-xs justify-start text-left font-normal h-12",
                        !movingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {movingDate ? format(movingDate, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={movingDate}
                      onSelect={setMovingDate}
                      initialFocus
                      locale={nl}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wat is je nieuwe adres?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    placeholder="1234 AB"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    maxLength={7}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseNumber">Huisnummer</Label>
                  <Input
                    id="houseNumber"
                    placeholder="12"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 py-4">
              <h2 className="text-xl md:text-2xl font-semibold text-center">
                Even geduld...
              </h2>
              <p className="text-muted-foreground text-center text-sm">
                We maken je persoonlijke verhuischecklist
              </p>
              
              <div className="space-y-3 pt-4">
                {generatingSteps.map((stepText, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                      index === currentGeneratingStep && "bg-primary/10",
                      completedSteps.includes(index) && "opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                      completedSteps.includes(index) 
                        ? "bg-primary text-primary-foreground" 
                        : index === currentGeneratingStep
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted"
                    )}>
                      {completedSteps.includes(index) && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      {index === currentGeneratingStep && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className={cn(
                      "text-sm transition-all duration-300",
                      index === currentGeneratingStep && "font-medium text-foreground",
                      completedSteps.includes(index) && "text-muted-foreground",
                      !completedSteps.includes(index) && index !== currentGeneratingStep && "text-muted-foreground/50"
                    )}>
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step === 2 && (
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

          {step === 3 && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Terug
              </Button>
              <Button
                onClick={handleStartGenerating}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Maak mijn checklist
              </Button>
            </div>
          )}
          </div>
        </Card>
      )}
    </div>
  );
};