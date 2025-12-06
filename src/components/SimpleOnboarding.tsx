import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, Circle, CheckCircle2 } from "lucide-react";
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
  const [streetName, setStreetName] = useState("");
  const [cityName, setCityName] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentGeneratingStep, setCurrentGeneratingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [taskStartIndex, setTaskStartIndex] = useState(0);
  const [isCheckingTask, setIsCheckingTask] = useState(false);

  const animatedTasks = [
    "Verhuisbedrijf boeken",
    "Adreswijziging doorgeven",
    "Energiecontract afsluiten",
    "Internet overzetten",
    "Verzekeringen aanpassen",
    "Verhuisdozen bestellen",
    "Sleutels ophalen",
    "Meter standen noteren",
  ];

  const totalSteps = 4; // Welcome, date, address, generating

  // Animate tasks on welcome screen - check off top task periodically
  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        // Start checking animation
        setIsCheckingTask(true);
        
        // After check animation, move to next task
        setTimeout(() => {
          setTaskStartIndex((prev) => (prev + 1) % animatedTasks.length);
          setIsCheckingTask(false);
        }, 600);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    const lookupAddress = async () => {
      // Clean postcode (remove spaces)
      const cleanPostcode = postcode.replace(/\s/g, "");
      
      if (cleanPostcode.length >= 6 && houseNumber.length > 0) {
        setIsLoadingAddress(true);
        try {
          const searchQuery = `${cleanPostcode} ${houseNumber}`;
          const apiUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(
            searchQuery
          )}&fq=type:(adres)&rows=1`;
          
          const response = await fetch(apiUrl);
          const data = await response.json();
          
          if (data.response?.docs?.[0]) {
            const result = data.response.docs[0];
            setStreetName(result.straatnaam || "");
            setCityName(result.woonplaatsnaam || "");
          } else {
            setStreetName("");
            setCityName("");
          }
        } catch (error) {
          console.error("Fout bij ophalen adres:", error);
          setStreetName("");
          setCityName("");
        } finally {
          setIsLoadingAddress(false);
        }
      } else {
        setStreetName("");
        setCityName("");
      }
    };

    const timeoutId = setTimeout(lookupAddress, 500);
    return () => clearTimeout(timeoutId);
  }, [postcode, houseNumber]);

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
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {step === 1 ? (
        <div 
          className="min-h-screen flex flex-col cursor-pointer"
          onClick={handleNext}
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center">
            <span className="text-2xl font-light text-foreground tracking-wide">lua</span>
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
                  <span className="text-primary">georganiseerd.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  Lua is jouw persoonlijke verhuis assistent. Slim, snel en gratis! Meld je aan voor de slimme verhuis to-do lijst.
                </p>
              </div>

              {/* Stacked preview cards */}
              <div className="relative h-48 md:h-56 mt-8">
                {/* Back card */}
                <div className="absolute top-6 left-4 right-4 h-full bg-white/60 rounded-3xl shadow-lg transform rotate-2" />
                {/* Middle card */}
                <div className="absolute top-3 left-2 right-2 h-full bg-white/80 rounded-3xl shadow-lg transform -rotate-1" />
                {/* Front card */}
                <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-semibold text-foreground">Jouw taken voor vandaag</p>
                  </div>
                  
                  <div className="space-y-2 overflow-hidden relative h-[120px]">
                    {/* First task - gets checked off */}
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ease-out ${
                        isCheckingTask 
                          ? "bg-primary/10 scale-95 opacity-0 -translate-y-2" 
                          : "bg-primary-light"
                      }`}
                    >
                      <div className="shrink-0 transition-transform duration-300">
                        {isCheckingTask ? (
                          <CheckCircle2 className="w-5 h-5 text-primary animate-scale-in" />
                        ) : (
                          <Circle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-all duration-300 ${
                        isCheckingTask ? "line-through text-primary/60" : "text-foreground"
                      }`}>
                        {animatedTasks[taskStartIndex % animatedTasks.length]}
                      </span>
                    </div>
                    
                    {/* Second task */}
                    <div 
                      className={`flex items-center gap-3 p-3 bg-secondary rounded-xl transition-all duration-500 ease-out ${
                        isCheckingTask ? "-translate-y-1" : ""
                      }`}
                    >
                      <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {animatedTasks[(taskStartIndex + 1) % animatedTasks.length]}
                      </span>
                    </div>
                    
                    {/* Third task */}
                    <div 
                      className={`flex items-center gap-3 p-3 bg-secondary/50 rounded-xl transition-all duration-500 ease-out ${
                        isCheckingTask ? "-translate-y-1 opacity-80" : "opacity-60"
                      }`}
                    >
                      <Circle className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                      <span className="text-sm text-muted-foreground/70">
                        {animatedTasks[(taskStartIndex + 2) % animatedTasks.length]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
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
      ) : step === 2 ? (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="p-6 flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2].map((num) => (
                  <div
                    key={num}
                    className={`w-8 h-1 rounded-full transition-all ${
                      num <= 1 ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Large headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Wanneer is de
                  <br />
                  <span className="text-primary">grote dag?</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  We gebruiken je verhuisdatum om slimme deadlines te berekenen.
                </p>
              </div>

              {/* Date picker card */}
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary-light/50",
                          movingDate ? "border-primary bg-primary-light/50" : "border-muted"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            movingDate ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted"
                          )}>
                            <CalendarIcon className={cn(
                              "w-6 h-6",
                              movingDate ? "text-white" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="text-left">
                            <p className={cn(
                              "font-semibold",
                              movingDate ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {movingDate ? format(movingDate, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {movingDate ? "Je verhuisdatum" : "Klik om te selecteren"}
                            </p>
                          </div>
                        </div>
                        {movingDate && (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
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

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Terug</span>
                </button>
                
                <button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className={cn(
                    "flex items-center gap-3 group",
                    !isStepValid() && "opacity-40 pointer-events-none"
                  )}
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Volgende</span>
                  <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : step === 3 ? (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="p-6 flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2].map((num) => (
                  <div
                    key={num}
                    className={`w-8 h-1 rounded-full transition-all ${
                      num <= 2 ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Large headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Waar ga je
                  <br />
                  <span className="text-primary">naartoe?</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  Je nieuwe adres helpt ons om relevante taken toe te voegen.
                </p>
              </div>

              {/* Address input card */}
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postcode" className="text-sm font-medium text-muted-foreground">Postcode</Label>
                      <Input
                        id="postcode"
                        placeholder="1234 AB"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        maxLength={7}
                        className="h-14 text-lg rounded-xl border-2 border-muted focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="houseNumber" className="text-sm font-medium text-muted-foreground">Huisnummer</Label>
                      <Input
                        id="houseNumber"
                        placeholder="12"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        className="h-14 text-lg rounded-xl border-2 border-muted focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  {postcode && houseNumber && (
                    <div className="flex items-center gap-3 p-4 bg-primary-light rounded-2xl animate-in fade-in duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                        {isLoadingAddress ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {streetName ? `${streetName} ${houseNumber}` : `${postcode} ${houseNumber}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {streetName && cityName ? `${postcode}, ${cityName}` : "Je nieuwe adres"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Terug</span>
                </button>
                
                <button 
                  onClick={handleStartGenerating}
                  disabled={!isStepValid()}
                  className={cn(
                    "flex items-center gap-3 group",
                    !isStepValid() && "opacity-40 pointer-events-none"
                  )}
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Genereer checklist</span>
                  <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="p-6 flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Large headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Even
                  <br />
                  <span className="text-primary">geduld...</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  We maken je persoonlijke verhuischecklist.
                </p>
              </div>

              {/* Progress card */}
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6">
                  <div className="space-y-3">
                    {generatingSteps.map((stepText, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                          index === currentGeneratingStep && "bg-primary-light",
                          completedSteps.includes(index) && "opacity-60"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                          completedSteps.includes(index) 
                            ? "bg-gradient-to-br from-primary to-primary/80" 
                            : index === currentGeneratingStep
                              ? "bg-primary-light border-2 border-primary"
                              : "bg-muted"
                        )}>
                          {completedSteps.includes(index) && (
                            <Check className="w-5 h-5 text-white" />
                          )}
                          {index === currentGeneratingStep && (
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <span className={cn(
                          "font-medium transition-all duration-300",
                          index === currentGeneratingStep && "text-foreground",
                          completedSteps.includes(index) && "text-muted-foreground",
                          !completedSteps.includes(index) && index !== currentGeneratingStep && "text-muted-foreground/50"
                        )}>
                          {stepText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};