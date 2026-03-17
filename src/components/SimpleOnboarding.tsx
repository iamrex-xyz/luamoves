import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Check, Circle, CheckCircle2, Key, Home, HelpCircle, Building2, Trees, Car, Users, Dog, Baby, Briefcase, Minus, Plus, Phone, ArrowRight, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { MovingInfo } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { LuaLogo } from "@/components/LuaLogo";

// WhatsApp/Telegram CTA URL — switch to WhatsApp URL for production
const CHAT_CTA_URL = "https://t.me/Lua_verhuis_bot"; // Production: "https://wa.me/31XXXXXXXXX?text=Hoi%20Lua!"
const CHAT_CTA_LABEL = "Start met Lua op WhatsApp";
const CHAT_CTA_SUBLABEL = "Gratis en zonder gedoe geregeld";


const testimonials = [
  { name: "Lisa", location: "Amsterdam", text: "Lua hielp me alles op tijd te regelen. Super handig!" },
  { name: "Mark", location: "Rotterdam", text: "Eindelijk overzicht tijdens mijn verhuizing. Aanrader!" },
  { name: "Sophie", location: "Utrecht", text: "Dankzij Lua vergat ik niks. Gratis en makkelijk." },
  { name: "Tom", location: "Den Haag", text: "De checklist was precies wat ik nodig had." },
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonial = testimonials[currentIndex];

  return (
    <section className="px-5 py-16 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Wat anderen zeggen
        </h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm min-h-[140px] flex flex-col justify-center">
          <p className="text-lg text-foreground mb-4 italic">"{testimonial.text}"</p>
          <p className="text-sm text-muted-foreground">
            — {testimonial.name}, {testimonial.location}
          </p>
        </div>
      </div>
    </section>
  );
};

const countryCodes = [
  { code: "+31", country: "NL" },
  { code: "+32", country: "BE" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+44", country: "UK" },
  { code: "+1", country: "US" },
  { code: "+34", country: "ES" },
  { code: "+39", country: "IT" },
  { code: "+48", country: "PL" },
  { code: "+90", country: "TR" },
  { code: "+212", country: "MA" },
  { code: "+597", country: "SR" },
  { code: "+599", country: "CW" },
  { code: "+297", country: "AW" },
];

type SimpleOnboardingProps = {
  onComplete: (info: MovingInfo) => void;
  onLogin: () => void;
  /** Optional: Start at a specific step (for URL-based routing) */
  initialStep?: number;
  /** Optional: Callback when step changes (for URL sync) */
  onStepChange?: (step: number) => void;
};

const generatingSteps = [
  "Je verhuisdatum bekijken...",
  "Slimme deadlines instellen...",
  "Taken op maat samenstellen...",
  "Bijna klaar!",
];

export const SimpleOnboarding = ({ onComplete, onLogin, initialStep = 1, onStepChange }: SimpleOnboardingProps) => {
  const [step, setStepInternal] = useState(initialStep);
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
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [petsCount, setPetsCount] = useState(0);
  const [hasJob, setHasJob] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+31");

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

  const totalSteps = 5; // Welcome, date, housing+property, address, generating (phone moved to Settings)

  // Wrapper for setStep that also notifies parent for URL routing
  const setStep = (newStep: number) => {
    setStepInternal(newStep);
    onStepChange?.(newStep);
  };

  // Sync step from URL on initial load or when initialStep changes
  useEffect(() => {
    if (initialStep !== step) {
      setStepInternal(initialStep);
    }
  }, [initialStep]);

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
    if (step === 5) {
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
          adults: adultsCount,
          children: childrenCount,
          pets: petsCount,
          phone: phoneNumber ? `${countryCode}${phoneNumber}` : undefined,
        });
      }, generatingSteps.length * 800 + 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [step, postcode, houseNumber, streetName, cityName, movingDate, housingType, propertyType, hasGarden, hasParking, hasJob, childrenCount, petsCount, phoneNumber, countryCode, onComplete]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleStartGenerating = () => {
    setStep(5);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return true;
      case 2: return !!movingDate;
      case 3: return !!housingType && !!propertyType;
      case 4: return postcode.length >= 4 && houseNumber.length > 0;
      default: return false;
    }
  };


  const CounterControl = ({ value, onChange, label, icon: Icon, min = 0 }: { value: number; onChange: (v: number) => void; label: string; icon: any; min?: number }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-40"
          disabled={value <= min}
        >
          <Minus className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="w-6 text-center font-semibold text-lg tabular-nums">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );

  const ToggleOption = ({ active, onClick, icon: Icon, label, description }: { active: boolean; onClick: () => void; icon: any; label: string; description?: string }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all flex-1 min-h-[100px]",
        active ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/50"
      )}
    >
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0",
        active ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted"
      )}>
        <Icon className={cn("w-5 h-5", active ? "text-white" : "text-muted-foreground")} />
      </div>
      <div className="flex flex-col items-center text-center">
        <span className={cn("text-sm font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
        {description && (
          <span className={cn("text-xs mt-0.5", active ? "text-muted-foreground" : "text-muted-foreground/70")}>{description}</span>
        )}
      </div>
    </button>
  );

  // Step 1: Welcome screen
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white overflow-y-auto">
        {/* Hero Section - Above the fold */}
        <div className="min-h-screen flex flex-col">
          <div className="px-5 pt-5 pb-3 flex justify-between items-center">
            <LuaLogo size="md" />
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onLogin(); }} className="text-sm text-muted-foreground hover:text-foreground">
              Inloggen
            </Button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-5 pb-8 max-w-2xl mx-auto w-full">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Jouw verhuizing,<br /><span className="text-primary">geregeld.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">
                  Lua is je slimme verhuisassistent. Jij focust op je nieuwe thuis, wij regelen de rest.
                </p>
              </div>

              {/* WhatsApp CTA */}
              <div className="flex flex-col items-center gap-2">
                <a
                  href={CHAT_CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold shadow-lg shadow-green-500/20 transition-colors text-base"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {CHAT_CTA_LABEL}
                </a>
                <p className="text-sm text-muted-foreground">{CHAT_CTA_SUBLABEL}</p>
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

        </div>
        {/* Floating WhatsApp FAB — disabled */}

        {/* Below the fold content - Click doesn't trigger navigation */}
        <div onClick={(e) => e.stopPropagation()}>
          {/* Section 1: Waarom Lua helpt */}
          <section className="px-5 py-16 bg-white">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Waarom Lua helpt tijdens je verhuizing
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto mb-8">
                Verhuizen is chaotisch: tientallen taken, onvoorspelbare deadlines, en veel om te onthouden. 
                Lua geeft je rust en overzicht, zodat jij minder hoeft na te denken.
              </p>
              <div className="flex flex-col items-center gap-2">
                <a
                  href={CHAT_CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-8 text-sm rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold shadow-md transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {CHAT_CTA_LABEL}
                </a>
                <p className="text-sm text-muted-foreground">{CHAT_CTA_SUBLABEL}</p>
              </div>
            </div>
          </section>

          {/* Section 2: Zo werkt Lua */}
          <section className="px-5 py-16 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
                Zo werkt Lua
              </h2>
              <div className="grid gap-6">
                {[
                  { step: "1", title: "Start met je gepersonaliseerde verhuischecklist", desc: "Vul je verhuisdatum en adres in" },
                  { step: "2", title: "Vul alleen in wat nodig is", desc: "We vragen alleen wat relevant is voor jou" },
                  { step: "3", title: "Lua regelt of komt bij je terug", desc: "Wij doen het werk, jij houdt overzicht" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Wat Lua voor je regelt */}
          <section className="px-5 py-16 bg-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">
                Wat Lua gratis voor je regelt
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Lua helpt je bij alle belangrijke verhuistaken
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Energie", desc: "Vergelijk en sluit je nieuwe energiecontract af" },
                  { title: "Internet", desc: "Vind de beste provider voor jouw nieuwe adres" },
                  { title: "Verhuisbedrijf", desc: "Vraag offertes aan bij betrouwbare verhuizers" },
                  { title: "Verzekeringen", desc: "Pas je inboedel- en aansprakelijkheidsverzekering aan" },
                  { title: "Post doorsturen", desc: "Regel je postdoorstuurservice bij PostNL" },
                  { title: "Adreswijzigingen", desc: "Geef je nieuwe adres door aan alle instanties" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 p-4 bg-primary-light/50 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Testimonials */}
          <TestimonialCarousel />

          {/* Section 5: Tweede CTA */}
          <section className="px-5 py-16 bg-white">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Klaar om te verhuizen?
              </h2>
              <p className="text-muted-foreground mb-6">
                Start wanneer jij wilt. Geen verplichtingen.
              </p>
              <div className="flex flex-col items-center gap-2">
                <a
                  href={CHAT_CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold shadow-lg shadow-green-500/20 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {CHAT_CTA_LABEL}
                </a>
                <p className="text-sm text-muted-foreground">{CHAT_CTA_SUBLABEL}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Step 2: Moving date
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center shrink-0">
          <LuaLogo size="md" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-8 h-1 rounded-full transition-all ${num <= 1 ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-lg mx-auto flex flex-col justify-center min-h-[calc(100vh-180px)]">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Wanneer is de<br /><span className="text-primary">grote dag?</span>
              </h1>
              <p className="text-sm text-muted-foreground">Met je verhuisdatum maken we een persoonlijk stappenplan voor je.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-4 sm:p-6">
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary-light/50",
                    movingDate ? "border-primary bg-primary-light/50" : "border-muted"
                  )}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors", movingDate ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                        <CalendarIcon className={cn("w-5 h-5 sm:w-6 sm:h-6", movingDate ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <div className="text-left">
                        <p className={cn("font-semibold text-sm sm:text-base", movingDate ? "text-foreground" : "text-muted-foreground")}>
                          {movingDate ? format(movingDate, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{movingDate ? "Je verhuisdatum" : "Klik om te selecteren"}</p>
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
          </div>
        </div>

        {/* Fixed footer navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary-light via-primary-light to-transparent pt-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span>Terug</span>
            </button>
            <button onClick={handleNext} disabled={!isStepValid()} className={cn("flex items-center gap-3 group", !isStepValid() && "opacity-40 pointer-events-none")}>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Volgende</span>
              <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Housing type + Property details (combined)
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center shrink-0">
          <LuaLogo size="md" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-8 h-1 rounded-full transition-all ${num <= 2 ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-lg mx-auto">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Vertel ons over<br /><span className="text-primary">je nieuwe thuis</span>
              </h1>
              <p className="text-sm text-muted-foreground">Zo maken we je checklist op maat.</p>
            </div>

            {/* Huren of kopen */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Ga je huren of kopen?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setHousingType('rent')} className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  housingType === 'rent' ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/50"
                )}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0", housingType === 'rent' ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                    <Key className={cn("w-5 h-5", housingType === 'rent' ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <span className={cn("text-sm font-medium", housingType === 'rent' ? "text-foreground" : "text-muted-foreground")}>Huren</span>
                </button>
                <button onClick={() => setHousingType('buy')} className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  housingType === 'buy' ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/50"
                )}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0", housingType === 'buy' ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                    <Home className={cn("w-5 h-5", housingType === 'buy' ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <span className={cn("text-sm font-medium", housingType === 'buy' ? "text-foreground" : "text-muted-foreground")}>Kopen</span>
                </button>
              </div>
            </div>

            {/* Woningtype */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Wat voor woning?</Label>
              <div className="grid grid-cols-2 gap-3">
                <ToggleOption active={propertyType === 'apartment'} onClick={() => setPropertyType('apartment')} icon={Building2} label="Appartement" description="Met VvE of huurflat" />
                <ToggleOption active={propertyType === 'house'} onClick={() => setPropertyType('house')} icon={Home} label="Huis" description="Vrijstaand of rijtje" />
              </div>
            </div>

            {/* Voorzieningen (optioneel) */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Voorzieningen (optioneel)</Label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setHasGarden(!hasGarden)} className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  hasGarden ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/50"
                )}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0", hasGarden ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                    <Trees className={cn("w-5 h-5", hasGarden ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <span className={cn("text-sm font-medium", hasGarden ? "text-foreground" : "text-muted-foreground")}>Tuin</span>
                </button>
                <button onClick={() => setHasParking(!hasParking)} className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  hasParking ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/50"
                )}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0", hasParking ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted")}>
                    <Car className={cn("w-5 h-5", hasParking ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <span className={cn("text-sm font-medium", hasParking ? "text-foreground" : "text-muted-foreground")}>Parkeren</span>
                </button>
              </div>
            </div>

            {/* Huishouden (optioneel) */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Je huishouden (optioneel)</Label>
              <div className="space-y-2">
                <CounterControl value={adultsCount} onChange={setAdultsCount} label="Volwassenen" icon={Users} min={1} />
                <CounterControl value={childrenCount} onChange={setChildrenCount} label="Kinderen" icon={Baby} />
                <CounterControl value={petsCount} onChange={setPetsCount} label="Huisdieren" icon={Dog} />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary-light via-primary-light to-transparent pt-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span>Terug</span>
            </button>
            <button onClick={handleNext} disabled={!isStepValid()} className={cn("flex items-center gap-3 group", !isStepValid() && "opacity-40 pointer-events-none")}>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Volgende</span>
              <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Address
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center shrink-0">
          <LuaLogo size="md" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-8 h-1 rounded-full transition-all ${num <= 3 ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-lg mx-auto flex flex-col justify-center min-h-[calc(100vh-180px)]">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Waar ga je<br /><span className="text-primary">naartoe?</span>
              </h1>
              <p className="text-sm text-muted-foreground">Met je adres maken we taken op maat voor jouw gemeente.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-sm font-medium text-muted-foreground">Postcode</Label>
                  <Input id="postcode" placeholder="1234 AB" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} maxLength={7} className="h-12 text-base rounded-xl border-2 border-muted focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseNumber" className="text-sm font-medium text-muted-foreground">Huisnummer</Label>
                  <Input id="houseNumber" placeholder="12" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className="h-12 text-base rounded-xl border-2 border-muted focus:border-primary" />
                </div>
              </div>
              {postcode && houseNumber && (
                <div className="flex items-center gap-3 p-3 bg-primary-light rounded-2xl animate-in fade-in duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shrink-0">
                    {isLoadingAddress ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-5 h-5 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{streetName ? `${streetName} ${houseNumber}` : `${postcode} ${houseNumber}`}</p>
                    <p className="text-xs text-muted-foreground truncate">{streetName && cityName ? `${postcode}, ${cityName}` : "Je nieuwe adres"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed footer navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary-light via-primary-light to-transparent pt-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span>Terug</span>
            </button>
            <button onClick={handleStartGenerating} disabled={!isStepValid()} className={cn("flex items-center gap-3 group", !isStepValid() && "opacity-40 pointer-events-none")}>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">Genereer checklist</span>
              <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Generating
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center shrink-0">
        <LuaLogo size="md" />
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="w-8 h-1 rounded-full transition-all bg-primary" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-lg mx-auto flex flex-col justify-center min-h-[calc(100vh-180px)]">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Momentje,<br /><span className="text-primary">we regelen het!</span>
            </h1>
            <p className="text-sm text-muted-foreground">Je persoonlijke checklist wordt voor je klaargezet.</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-4 sm:p-6">
            <div className="space-y-2">
              {generatingSteps.map((stepText, index) => (
                <div key={index} className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl transition-all duration-300",
                  index === currentGeneratingStep && "bg-primary-light",
                  completedSteps.includes(index) && "opacity-60"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0",
                    completedSteps.includes(index) ? "bg-gradient-to-br from-primary to-primary/80" : index === currentGeneratingStep ? "bg-primary-light border-2 border-primary" : "bg-muted"
                  )}>
                    {completedSteps.includes(index) && <Check className="w-5 h-5 text-white" />}
                    {index === currentGeneratingStep && <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />}
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-all duration-300",
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
