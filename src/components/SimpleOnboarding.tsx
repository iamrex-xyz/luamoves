import { useState, useEffect } from "react";
import lisaImg from "@/assets/testimonial-lisa.png";
import videoStillWoman from "@/assets/video-still-woman.jpg";
import markImg from "@/assets/testimonial-mark.png";
import sophieImg from "@/assets/testimonial-sophie.png";
import tomImg from "@/assets/testimonial-tom.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Check, Circle, CheckCircle2, Key, Home, HelpCircle, Building2, Trees, Car, Users, Dog, Baby, Briefcase, Minus, Plus, Phone, ArrowRight, ArrowLeft, ArrowDown, Zap, Wifi, Truck, Shield, Mail, MapPin, Play } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { MovingInfo } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { LuaLogo } from "@/components/LuaLogo";
import { WhatsAppChat, type ChatMessage } from "@/components/WhatsAppChat";

const heroChat: ChatMessage[] = [
  { from: "lua", text: "Hoi Lisa! 👋 Ik ben Lua. Wanneer en waarheen ga je verhuizen?", time: "09:38" },
  { from: "user", text: "12 juli, naar Amsterdam 🎉", time: "09:39" },
  { from: "lua", text: "Gefeliciteerd! 🎉 Ik heb meteen je checklist klaargezet: 14 taken, netjes op volgorde. Drie ervan hebben een deadline deze maand.", time: "09:39" },
  { from: "user", text: "Oef, waar moet ik beginnen?", time: "09:40" },
  { from: "lua", text: "Geen stress, ik neem het zware werk over. Zal ik 3 offertes voor een verhuisbedrijf opvragen?", time: "09:40" },
  { from: "user", text: "Ja, top!", time: "09:41" },
  { from: "lua", text: "Geregeld ✅ Offertes liggen morgen klaar. Ik hou je hier op de hoogte en stuur op tijd een seintje voor elke deadline.", time: "09:41" },
];

const exampleChats: { label: string; messages: ChatMessage[] }[] = [
  {
    label: "Energie & internet",
    messages: [
      { from: "lua", text: "Je oude energiecontract loopt af. Zal ik op je nieuwe adres een goede deal regelen?", time: "10:12" },
      { from: "user", text: "Doen 👍", time: "10:13" },
      { from: "lua", text: "Geregeld ✅ Internet staat klaar op je nieuwe adres vanaf 12 juli.", time: "10:13" },
    ],
  },
  {
    label: "Verhuisbedrijf",
    messages: [
      { from: "user", text: "Kun je een verhuisbedrijf regelen voor de 12e?", time: "14:02" },
      { from: "lua", text: "Zeker! 3 betrouwbare verhuizers beschikbaar. Goedkoopste: €495 incl. inpakken.", time: "14:03" },
      { from: "user", text: "Boek die maar", time: "14:04" },
      { from: "lua", text: "Geboekt ✅ Ze bellen je woensdag om alles af te stemmen.", time: "14:04" },
    ],
  },
  {
    label: "Adreswijziging",
    messages: [
      { from: "lua", text: "Vergeet je adreswijziging niet. Zal ik 'm doorgeven aan gemeente, bank en PostNL?", time: "16:30" },
      { from: "user", text: "Ja, allemaal graag", time: "16:31" },
      { from: "lua", text: "Doorgegeven ✅ Je post wordt 3 maanden doorgestuurd.", time: "16:31" },
    ],
  },
];

const testimonials = [
  { name: "Lisa", location: "Amsterdam", text: "Lua hielp me alles op tijd te regelen. Super handig!", image: lisaImg },
  { name: "Mark", location: "Rotterdam", text: "Eindelijk overzicht tijdens mijn verhuizing. Aanrader!", image: markImg },
  { name: "Sophie", location: "Utrecht", text: "Dankzij Lua vergat ik niks. Gratis en makkelijk.", image: sophieImg },
  { name: "Tom", location: "Den Haag", text: "De checklist was precies wat ik nodig had.", image: tomImg },
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
    <section className="px-5 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Waarom anderen enthousiast zijn
        </h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm min-h-[140px] flex flex-col items-center justify-center">
          <p className="text-lg text-foreground mb-4 italic">"{testimonial.text}"</p>
          <div className="flex items-center gap-3">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              loading="lazy"
              width={40}
              height={40}
            />
            <p className="text-sm text-muted-foreground">
              {testimonial.name}, {testimonial.location}
            </p>
          </div>
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
  const [exampleIndex, setExampleIndex] = useState(0);
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
      <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light overflow-y-auto">
        {/* Hero Section - Above the fold */}
        <div className="min-h-screen flex flex-col cursor-pointer" onClick={handleNext}>
          <div className="px-5 pt-5 pb-8 flex justify-between items-center">
            <LuaLogo size="md" />
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onLogin(); }} className="text-sm text-muted-foreground hover:text-foreground">
              Inloggen
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10 max-w-3xl mx-auto w-full text-center">
            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-[25px]">
              <div className="flex -space-x-1.5">
                <img src="https://i.pravatar.cc/40?img=12" alt="Verhuizer" className="w-5 h-5 rounded-full object-cover border-2 border-primary-light" />
                <img src="https://i.pravatar.cc/40?img=32" alt="Verhuizer" className="w-5 h-5 rounded-full object-cover border-2 border-primary-light" />
                <img src="https://i.pravatar.cc/40?img=45" alt="Verhuizer" className="w-5 h-5 rounded-full object-cover border-2 border-primary-light" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">522 verhuizers deze maand</span>
            </div>

            {/* Headline */}
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h1 className="text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight md:text-6xl">
                Jouw verhuizing,<br />
                <span className="text-primary font-italiana italic font-semibold">geregeld.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-[19px]">
                Lua is je slimme AI verhuisassistent, volledig via WhatsApp.<br />Jij stuurt een berichtje, Lua regelt de rest.
              </p>
            </div>

            {/* CTA group */}
            <div className="flex flex-col items-center gap-4 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Button
                asChild
                className="h-14 px-8 text-base rounded-2xl shadow-xl shadow-primary/25 hover:-translate-y-0.5 transition-transform"
              >
                <a href="https://wa.me/31685303918" target="_blank" rel="noopener noreferrer">
                  Start je verhuizing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[11px] text-muted-foreground/70 uppercase tracking-widest font-normal">Gratis · Geen verplichtingen</p>
              </div>
            </div>

            {/* Mockup area - WhatsApp conversation */}
            <div className="relative w-full flex flex-col items-center mt-[86px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 mb-5">
                <span className="text-xs font-semibold text-[#0d8a4f] uppercase tracking-wider">Geen app · Makkelijk via WhatsApp</span>
              </div>
              <WhatsAppChat messages={heroChat} animated className="animate-in fade-in slide-in-from-bottom-8 duration-700" />

              {/* Affordance */}
              <div className="mt-10 flex flex-col items-center gap-1.5 text-muted-foreground/50 animate-bounce">
                <span className="text-[11px] font-bold uppercase tracking-widest">Ontdek hoe het werkt</span>
                <ArrowDown className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Below the fold content - Click doesn't trigger navigation */}
        <div onClick={(e) => e.stopPropagation()}>
          {/* Section 1: Waarom Lua helpt */}
          <section className="px-5 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Waarom Lua helpt tijdens je verhuizing
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto mb-8">
                Verhuizen is chaotisch: tientallen taken, onvoorspelbare deadlines, en veel om te onthouden.
                Lua geeft je rust en overzicht, zodat jij minder hoeft na te denken.
              </p>
              <p className="text-sm text-muted-foreground">Gratis en zonder gedoe geregeld</p>
            </div>
          </section>

          {/* Section 2: Zo werkt Lua */}
          <section className="px-5 py-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
                Zo werkt Lua
              </h2>
              <div className="grid gap-6">
                {[
                  { step: "1", title: "Krijg direct je gepersonaliseerde verhuischecklist", desc: "Vul je verhuisdatum en adres in en zie meteen wat er geregeld moet worden" },
                  { step: "2", title: "Beantwoord een paar simpele vragen", desc: "Geen overbodige formulieren, alleen wat écht relevant is voor jouw verhuizing" },
                  { step: "3", title: "Lua regelt het werk voor je", desc: "Wij nemen de taken uit handen, jij houdt altijd het overzicht" },
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
          <section className="px-5 py-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">
                Wat Lua voor je regelt, gratis
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Lua helpt je bij alle belangrijke verhuistaken en meer
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Energie", desc: "Vergelijk en sluit je nieuwe energiecontract af", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
                  { title: "Internet", desc: "Vind de beste provider voor jouw nieuwe adres", icon: Wifi, color: "text-sky-500", bg: "bg-sky-500/10" },
                  { title: "Verhuisbedrijf", desc: "Vraag offertes aan bij betrouwbare verhuizers", icon: Truck, color: "text-primary", bg: "bg-primary/10" },
                  { title: "Verzekeringen", desc: "Pas je inboedel- en aansprakelijkheidsverzekering aan", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { title: "Post doorsturen", desc: "Regel je postdoorstuurservice bij PostNL", icon: Mail, color: "text-rose-500", bg: "bg-rose-500/10" },
                  { title: "Adreswijzigingen", desc: "Geef je nieuwe adres door aan alle instanties", icon: MapPin, color: "text-violet-500", bg: "bg-violet-500/10" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group flex items-start gap-3 p-4 bg-white border border-border/60 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110", item.bg)}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3b: WhatsApp voorbeeldgesprekken */}
          <section className="px-5 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 mb-4">
                  <span className="text-xs font-semibold text-[#0d8a4f] uppercase tracking-wider">Eenvoudig via WhatsApp</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Zo regelt Lua het, gewoon in je chat
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
                  Geen app, geen inloggen, geen ingewikkelde portalen. Je appt met Lua zoals met een vriend en Lua regelt het echte werk.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 md:gap-6">
                <button
                  type="button"
                  onClick={() => setExampleIndex((i) => (i - 1 + exampleChats.length) % exampleChats.length)}
                  aria-label="Vorige voorbeeld"
                  className="shrink-0 w-11 h-11 rounded-full bg-white border border-primary/20 text-primary flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center gap-3 w-full max-w-[320px] md:max-w-[300px]">
                  <span className="text-sm font-semibold text-primary">{exampleChats[exampleIndex].label}</span>
                  <WhatsAppChat key={exampleIndex} messages={exampleChats[exampleIndex].messages} animated />
                </div>
                <button
                  type="button"
                  onClick={() => setExampleIndex((i) => (i + 1) % exampleChats.length)}
                  aria-label="Volgende voorbeeld"
                  className="shrink-0 w-11 h-11 rounded-full bg-white border border-primary/20 text-primary flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Section: Video */}
          <section className="px-5 py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                Een stressvrije verhuizing door Lua
              </h2>
              <div className="relative rounded-3xl overflow-hidden border-4 border-primary/40 shadow-xl group cursor-pointer">
                <img
                  src={videoStillWoman}
                  alt="Bekijk hoe Lua je verhuizing regelt"
                  loading="lazy"
                  width={1280}
                  height={768}
                  className="w-full h-auto object-cover aspect-video"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow-lg text-foreground font-medium group-hover:scale-105 transition-transform">
                    <Play className="w-5 h-5 text-primary fill-primary" />
                    Bekijk: Lua in actie
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Testimonials */}
          <TestimonialCarousel />

          {/* Section 4b: FAQ */}
          <section className="px-5 py-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">
                Veelgestelde vragen
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Alles wat je wilt weten over Lua
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="cost" className="border-b border-border/60 bg-white rounded-2xl px-5 mb-3 border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 text-left">Is Lua gratis?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Ja, Lua is volledig gratis. We verdienen aan partnerdeals (bijv. energie en internet), zodat jij kunt verhuizen zonder extra kosten. Geen verplichtingen, geen verborgen kosten.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="privacy" className="border-b border-border/60 bg-white rounded-2xl px-5 mb-3 border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 text-left">Hoe gaat Lua om met mijn gegevens?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Je privacy staat voorop. We delen je gegevens nooit met derden zonder toestemming en gebruiken ze niet om AI-modellen te trainen. Je verhuizing is tussen jou en Lua.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="app" className="border-b border-border/60 bg-white rounded-2xl px-5 mb-3 border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 text-left">Heb ik een app nodig?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Nee. Je kunt Lua gebruiken via WhatsApp of de web-app — wat jij prettig vindt. Geen gedoe met downloads of inloggegevens.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="how" className="border-b border-border/60 bg-white rounded-2xl px-5 mb-3 border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 text-left">Hoe werkt Lua precies?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Je deelt je verhuisdatum en adres, en Lua maakt een persoonlijke checklist. Voor elke taak vraagt Lua kort wat je nodig hebt — dan regelen wij offertes, contracten en afspraken. Jij houdt overzicht, Lua doet het werk.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="deadline" className="border-b border-border/60 bg-white rounded-2xl px-5 mb-3 border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 text-left">Wat als mijn verhuisdatum verandert?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Geen probleem. Pas je verhuisdatum aan in je profiel en Lua herberekent automatisch alle deadlines en herinnert je opnieuw op de juiste momenten.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="quotes" className="border-b border-border/60 bg-white rounded-2xl px-5 mb-3 border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 text-left">Hoe snel krijg ik offertes binnen?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Meestal binnen 24 uur. Voor drukke periodes kan het 2-3 werkdagen duren. Je krijgt altijd een berichtje van Lua zodra de offertes voor je klaarliggen.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="delete" className="border-b border-border/60 bg-white rounded-2xl px-5 mb-3 border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 text-left">Kan ik mijn account en gegevens verwijderen?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Absoluut. Je kunt op elk moment je profiel en alle gegevens verwijderen. Geen vragen, geen gedoe — gewoon weg als je dat wilt.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Section 5: Tweede CTA */}
          <section className="px-5 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Klaar om te verhuizen?
              </h2>
              <p className="text-muted-foreground mb-6">
                Start wanneer jij wilt. Geen verplichtingen.
              </p>
              <Button
                asChild
                className="h-14 px-8 text-base rounded-2xl shadow-xl shadow-primary/25 hover:-translate-y-0.5 transition-transform mb-2"
              >
                <a href="https://wa.me/31685303918" target="_blank" rel="noopener noreferrer">
                  Start je verhuizing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">Gratis en zonder gedoe geregeld</p>
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
