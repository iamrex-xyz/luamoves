import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import { LuaLogo } from "@/components/LuaLogo";
import { luaExampleCategories } from "@/data/luaExamples";

const Explore = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <LuaLogo className="w-8 h-8" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Terug
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-12 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Voorbeelden uit echte verhuizingen
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Dit kan Lua allemaal voor je regelen
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Eén chat in WhatsApp, en Lua neemt het zware werk over. Bekijk hieronder
            echte voorbeelden — van verhuislift tot adreswijziging.
          </p>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-5 pb-20 space-y-16">
        {luaExampleCategories.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-24">
            <div className="mb-6 border-b border-border/60 pb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{cat.title}</h2>
              <p className="text-muted-foreground mt-1">{cat.intro}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.examples.map((ex, i) => (
                <article
                  key={i}
                  className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm flex flex-col gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-foreground text-lg leading-snug">
                      {ex.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{ex.desc}</p>
                    {ex.persona && (
                      <p className="text-xs text-muted-foreground/70 mt-2 italic">
                        {ex.persona}
                      </p>
                    )}
                  </div>
                  <WhatsAppChat messages={ex.messages} className="max-w-full" />
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="rounded-3xl bg-primary/5 border border-primary/20 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Klaar om Lua jouw verhuizing te laten regelen?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Beantwoord een paar vragen en je krijgt direct een persoonlijke checklist.
            Gratis, en Lua doet het zware werk via WhatsApp.
          </p>
          <Button asChild size="lg">
            <Link to="/aanmelden/welkom">
              Start nu
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Explore;
