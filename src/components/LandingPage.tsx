import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LuaLogo } from "@/components/LuaLogo";
import { Check, CheckCircle2, Circle, MessageCircle } from "lucide-react";

// Testing URL - switch to WhatsApp later
const CTA_URL = "https://t.me/lua_moves_bot";

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

export const LandingPage = () => {
  const [taskStartIndex, setTaskStartIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'checking' | 'sliding'>('idle');

  // Animate tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase('checking');
      setTimeout(() => setAnimationPhase('sliding'), 600);
      setTimeout(() => {
        setTaskStartIndex((prev) => (prev + 1) % animatedTasks.length);
        setAnimationPhase('idle');
      }, 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white overflow-y-auto">
      {/* Hero Section - Above the fold */}
      <div className="min-h-screen flex flex-col">
        <div className="px-5 pt-5 pb-3">
          <LuaLogo size="md" />
        </div>
        <div className="flex-1 flex flex-col justify-center px-5 pb-8 max-w-2xl mx-auto w-full">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Jouw verhuizing,<br /><span className="text-primary">helemaal geregeld</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">
                Lua is je persoonlijke verhuisassistent. Alles op één plek, altijd binnen handbereik.
              </p>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col gap-3">
              <a href={CTA_URL} target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg"
                  className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start met Lua op WhatsApp
                </Button>
              </a>
              <p className="text-sm text-muted-foreground text-center">
                Gratis • Geen account nodig • Direct beginnen
              </p>
            </div>

            {/* Animated Task Preview */}
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

      {/* Features Section */}
      <section className="px-5 py-16 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
            Waarom Lua?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Persoonlijke checklist</h3>
              <p className="text-sm text-muted-foreground">Taken op maat, afgestemd op jouw situatie</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Slimme herinneringen</h3>
              <p className="text-sm text-muted-foreground">Je krijgt een seintje op het juiste moment</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Alles op één plek</h3>
              <p className="text-sm text-muted-foreground">Geen gedoe met apps of accounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Final CTA */}
      <section className="px-5 py-16 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Klaar om te verhuizen?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start wanneer jij wilt. Geen verplichtingen.
          </p>
          <a href={CTA_URL} target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg"
              className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start met Lua op WhatsApp
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 bg-gradient-to-br from-primary-light via-primary-light/80 to-white border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <LuaLogo size="sm" className="mb-3 justify-center" />
          <p className="text-xs text-muted-foreground">
            © 2024 Lua. Jouw persoonlijke verhuisassistent.
          </p>
        </div>
      </footer>
    </div>
  );
};
