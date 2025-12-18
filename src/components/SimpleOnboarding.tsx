import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, Circle, CheckCircle2, Key, Home, HelpCircle, Building2, Trees, Car, Users, Dog, Baby, Briefcase, Minus, Plus, Phone } from "lucide-react";
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
  const [housingType, setHousingType] = useState<'rent' | 'buy' | 'unknown' | null>(null);
  const [postcode, setPostcode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [cityName, setCityName] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentGeneratingStep, setCurrentGeneratingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [taskStartIndex, setTaskStartIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'checking' | 'sliding'>('idle');
  
  // Nieuwe personalisatie state
  const [propertyType, setPropertyType] = useState<'apartment' | 'house' | null>(null);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);
  const [petsCount, setPetsCount] = useState(0);
  const [hasJob, setHasJob] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

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

  const totalSteps = 6; // Welcome, date, housing+property, address, phone (optional), generating

  // Animate tasks on welcome screen
  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setAnimationPhase('checking');
        setTimeout(() => setAnimationPhase('sliding'), 600);
        setTimeout(() => {
          setTaskStartIndex((prev) => (prev + 1) % animatedTasks.length);
          setAnimationPhase('idle');
        }, 1000);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    const lookupAddress = async () => {
      const cleanPostcode = postcode.replace(/\s/g, "");
      if (cleanPostcode.length >= 6 && houseNumber.length > 0) {
        setIsLoadingAddress(true);
        try {
          const searchQuery = `${cleanPostcode} ${houseNumber}`;
          const apiUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(searchQuery)}&fq=type:(adres)&rows=1`;
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
    if (step === 6) {
      const interval = setInterval(() => {
        setCurrentGeneratingStep((prev) => {
          if (prev < generatingSteps.length - 1) {
            setCompletedSteps((completed) => [...completed, prev]);
            return prev + 1;
          }
          return prev;
        });
      }, 800);

      const timeout = setTimeout(() => {
        const fullAddress = streetName && cityName 
          ? `${streetName} ${houseNumber}, ${postcode} ${cityName}`
          : `${postcode} ${houseNumber}`.trim();
        
        onComplete({
          oldAddress: "",
          newAddress: fullAddress,
          movingDate: movingDate ? format(movingDate, "yyyy-MM-dd") : "",
          type: housingType === 'buy' ? 'buy' : 'rent',
          renovationType: "none",
          needsContractorHelp: false,
          propertyType: propertyType || undefined,
          hasGarden,
          hasParking,
          isVve: propertyType === 'apartment',
          hasJob,
          children: childrenCount,
          pets: petsCount,
          phone: phoneNumber || undefined,
        });
      }, generatingSteps.length * 800 + 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [step, postcode, houseNumber, streetName, cityName, movingDate, housingType, propertyType, hasGarden, hasParking, hasJob, childrenCount, petsCount, phoneNumber, onComplete]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleStartGenerating = () => {
    setStep(6);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return true;
      case 2: return !!movingDate;
      case 3: return !!housingType; // Property type is now optional
      case 4: return postcode.length >= 4 && houseNumber.length > 0;
      case 5: return true; // Phone is optional
      default: return false;
    }
  };

  const CounterControl = ({ value, onChange, label, icon: Icon }: { value: number; onChange: (v: number) => void; label: string; icon: any }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-muted">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          disabled={value === 0}
        >
          <Minus className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="w-8 text-center font-semibold text-lg">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );

  const ToggleOption = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all flex-1",
        active ? "border-primary bg-primary-light" : "border-muted bg-white hover:border-primary/50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
        active ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted"
      )}>
        <Icon className={cn("w-5 h-5", active ? "text-white" : "text-muted-foreground")} />
      </div>
      <span className={cn("font-medium", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
      {active && (
        <div className="ml-auto w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );

  // Step 1: Welcome screen
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
        <div className="min-h-screen flex flex-col cursor-pointer" onClick={handleNext}>
          <div className="px-5 pt-5 pb-3 flex justify-between items-center">
            <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onLogin(); }} className="text-sm text-muted-foreground hover:text-foreground">
              Inloggen
            </Button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-5 pb-8 max-w-2xl mx-auto w-full">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Jouw verhuizing,<br /><span className="text-primary">georganiseerd.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">
                  Lua is jouw persoonlijke verhuis assistent. Slim, snel en gratis!
                </p>
              </div>
              <div className="relative h-52 md:h-56">
                <div className="absolute top-5 left-3 right-3 h-full bg-white/60 rounded-2xl shadow-lg transform rotate-2" />
                <div className="absolute top-2.5 left-1.5 right-1.5 h-full bg-white/80 rounded-2xl shadow-lg transform -rotate-1" />
                <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl shadow-primary/20 p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">Jouw taken voor vandaag</p>
                  </div>
                  <div className="relative overflow-hidden" style={{ height: '124px' }}>
                    <div className="flex flex-col gap-2" style={{
                      transition: animationPhase === 'sliding' ? 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                      transform: animationPhase === 'sliding' ? 'translateY(-44px)' : 'translateY(0)',
                    }}>
                      {[0, 1, 2, 3].map((offset) => {
                        const taskIndex = (taskStartIndex + offset) % animatedTasks.length;
                        const isFirst = offset === 0;
                        const isChecked = isFirst && (animationPhase === 'checking' || animationPhase === 'sliding');
                        let bgClass = 'bg-secondary/50';
                        let iconClass = 'text-muted-foreground/30';
                        let textClass = 'text-muted-foreground/70';
                        if (isFirst && !isChecked) {
                          bgClass = 'bg-primary-light';
                          iconClass = 'text-primary';
                          textClass = 'text-foreground font-medium';
                        } else if (offset === 1) {
                          bgClass = 'bg-secondary';
                          iconClass = 'text-muted-foreground/40';
                          textClass = 'text-muted-foreground';
                        }
                        return (
                          <div key={`task-${taskIndex}-${offset}`} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl shrink-0 ${isChecked ? 'bg-primary/10' : bgClass}`} style={{ height: '36px' }}>
                            <div className="w-5 h-5 shrink-0 flex items-center justify-center" style={{ transition: 'transform 0.2s ease', transform: isChecked && animationPhase === 'checking' ? 'scale(1.15)' : 'scale(1)' }}>
                              {isChecked ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className={`w-5 h-5 ${iconClass}`} />}
                            </div>
                            <span className={`text-sm ${isChecked ? 'line-through text-primary/50' : textClass}`}>{animatedTasks[taskIndex]}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: 'linear-gradient(to top, white 0%, transparent 100%)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 right-5">
            <div className="flex items-center gap-2.5 group">
              <span className="text-sm text-muted-foreground">Start nu</span>
              <div className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Moving date
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-8 h-1 rounded-full transition-all ${num <= 1 ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Wanneer is de<br /><span className="text-primary">grote dag?</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">We gebruiken je verhuisdatum om slimme deadlines te berekenen.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6">
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary-light/50",
                    movingDate ? "border-primary bg-primary-light/50" : "border-muted"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", movingDate ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                        <CalendarIcon className={cn("w-6 h-6", movingDate ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <div className="text-left">
                        <p className={cn("font-semibold", movingDate ? "text-foreground" : "text-muted-foreground")}>
                          {movingDate ? format(movingDate, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                        </p>
                        <p className="text-sm text-muted-foreground">{movingDate ? "Je verhuisdatum" : "Klik om te selecteren"}</p>
                      </div>
                    </div>
                    {movingDate && <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar mode="single" selected={movingDate} onSelect={setMovingDate} initialFocus locale={nl} disabled={(date) => date < new Date()} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Terug</span>
              </button>
              <button onClick={handleNext} disabled={!isStepValid()} className={cn("flex items-center gap-3 group", !isStepValid() && "opacity-40 pointer-events-none")}>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Volgende</span>
                <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Housing type + Property details (combined)
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-8 h-1 rounded-full transition-all ${num <= 2 ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col px-6 pb-12 max-w-2xl mx-auto w-full overflow-y-auto">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 py-4">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
                Vertel ons over<br /><span className="text-primary">je nieuwe thuis</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-md">Zo maken we je checklist op maat.</p>
            </div>

            {/* Huren of kopen */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Ga je huren of kopen?</Label>
              <div className="space-y-2">
                <button onClick={() => setHousingType('rent')} className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                  housingType === 'rent' ? "border-primary bg-primary-light" : "border-muted bg-white hover:border-primary/50"
                )}>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", housingType === 'rent' ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                    <Key className={cn("w-6 h-6", housingType === 'rent' ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={cn("font-semibold", housingType === 'rent' ? "text-foreground" : "text-muted-foreground")}>Huren</p>
                  </div>
                  {housingType === 'rent' && <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                </button>
                <button onClick={() => setHousingType('buy')} className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                  housingType === 'buy' ? "border-primary bg-primary-light" : "border-muted bg-white hover:border-primary/50"
                )}>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", housingType === 'buy' ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                    <Home className={cn("w-6 h-6", housingType === 'buy' ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={cn("font-semibold", housingType === 'buy' ? "text-foreground" : "text-muted-foreground")}>Kopen</p>
                  </div>
                  {housingType === 'buy' && <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                </button>
              </div>
            </div>

            {/* Woningtype (optioneel) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Wat voor woning? (optioneel)</Label>
              <div className="flex gap-3">
                <ToggleOption active={propertyType === 'apartment'} onClick={() => setPropertyType(propertyType === 'apartment' ? null : 'apartment')} icon={Building2} label="Appartement" />
                <ToggleOption active={propertyType === 'house'} onClick={() => setPropertyType(propertyType === 'house' ? null : 'house')} icon={Home} label="Huis" />
              </div>
            </div>

            {/* Voorzieningen (optioneel) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Voorzieningen (optioneel)</Label>
              <div className="flex gap-3">
                <ToggleOption active={hasGarden} onClick={() => setHasGarden(!hasGarden)} icon={Trees} label="Tuin" />
                <ToggleOption active={hasParking} onClick={() => setHasParking(!hasParking)} icon={Car} label="Parkeerplek" />
              </div>
            </div>

            {/* Huishouden (optioneel) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Je huishouden (optioneel)</Label>
              <div className="space-y-2">
                <CounterControl value={childrenCount} onChange={setChildrenCount} label="Kinderen" icon={Baby} />
                <CounterControl value={petsCount} onChange={setPetsCount} label="Huisdieren" icon={Dog} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Terug</span>
              </button>
              <button onClick={handleNext} disabled={!isStepValid()} className={cn("flex items-center gap-3 group", !isStepValid() && "opacity-40 pointer-events-none")}>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Volgende</span>
                <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Address
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-8 h-1 rounded-full transition-all ${num <= 3 ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Waar ga je<br /><span className="text-primary">naartoe?</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">Je nieuwe adres helpt ons om relevante taken toe te voegen.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-sm font-medium text-muted-foreground">Postcode</Label>
                  <Input id="postcode" placeholder="1234 AB" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} maxLength={7} className="h-14 text-lg rounded-xl border-2 border-muted focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseNumber" className="text-sm font-medium text-muted-foreground">Huisnummer</Label>
                  <Input id="houseNumber" placeholder="12" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className="h-14 text-lg rounded-xl border-2 border-muted focus:border-primary" />
                </div>
              </div>
              {postcode && houseNumber && (
                <div className="flex items-center gap-3 p-4 bg-primary-light rounded-2xl animate-in fade-in duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    {isLoadingAddress ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{streetName ? `${streetName} ${houseNumber}` : `${postcode} ${houseNumber}`}</p>
                    <p className="text-sm text-muted-foreground">{streetName && cityName ? `${postcode}, ${cityName}` : "Je nieuwe adres"}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Terug</span>
              </button>
              <button onClick={handleNext} disabled={!isStepValid()} className={cn("flex items-center gap-3 group", !isStepValid() && "opacity-40 pointer-events-none")}>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Volgende</span>
                <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Phone number (optional)
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="w-8 h-1 rounded-full bg-primary" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Hoe kunnen we<br /><span className="text-primary">je bereiken?</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">Optioneel: ontvang handige tips via WhatsApp.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Telefoonnummer (optioneel)</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">+31</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="6 12345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="h-14 text-lg rounded-xl border-2 border-muted focus:border-primary pl-24"
                    maxLength={10}
                  />
                </div>
              </div>
              {phoneNumber.length >= 9 && (
                <div className="flex items-center gap-3 p-4 bg-primary-light rounded-2xl animate-in fade-in duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">+31 {phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">Je ontvangt handige tips via WhatsApp</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Terug</span>
              </button>
              <div className="flex items-center gap-3">
                {!phoneNumber && (
                  <button onClick={handleStartGenerating} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Overslaan
                  </button>
                )}
                <button onClick={handleStartGenerating} className="flex items-center gap-3 group">
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {phoneNumber ? "Genereer checklist" : "Start"}
                  </span>
                  <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Generating
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Even<br /><span className="text-primary">geduld...</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">We maken je persoonlijke verhuischecklist.</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6">
            <div className="space-y-3">
              {generatingSteps.map((stepText, index) => (
                <div key={index} className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                  index === currentGeneratingStep && "bg-primary-light",
                  completedSteps.includes(index) && "opacity-60"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    completedSteps.includes(index) ? "bg-gradient-to-br from-primary to-primary/80" : index === currentGeneratingStep ? "bg-primary-light border-2 border-primary" : "bg-muted"
                  )}>
                    {completedSteps.includes(index) && <Check className="w-5 h-5 text-white" />}
                    {index === currentGeneratingStep && <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />}
                  </div>
                  <span className={cn(
                    "font-medium transition-all duration-300",
                    index === currentGeneratingStep && "text-foreground",
                    completedSteps.includes(index) && "text-muted-foreground",
                    index > currentGeneratingStep && "text-muted-foreground/50"
                  )}>{stepText}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
