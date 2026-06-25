import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LuaLogo } from "@/components/LuaLogo";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <LuaLogo className="w-8 h-8" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug
        </Link>
      </div>
    </header>

    <main className="flex-1 px-5 py-14">
      <div className="max-w-[68ch] mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
          Privacybeleid
        </h1>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Lua hecht veel waarde aan de bescherming van jouw persoonsgegevens. In dit privacybeleid
          leggen we uit welke gegevens we verzamelen, hoe we deze gebruiken en hoe we jouw privacy
          waarborgen.
        </p>

        <h2 className="font-display text-xl font-semibold text-foreground mt-10 mb-3">
          Welke gegevens verzamelen we?
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Wanneer je Lua gebruikt via WhatsApp, verwerken we de informatie die je zelf met ons deelt
          — zoals je verhuisdatum, adres en contactgegevens. We gebruiken deze uitsluitend om onze
          dienstverlening te kunnen bieden.
        </p>

        <h2 className="font-display text-xl font-semibold text-foreground mt-10 mb-3">
          Hoe gebruiken we jouw gegevens?
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Jouw gegevens worden gebruikt om je te helpen met je verhuizing: het opstellen van een
          checklist, het aanvragen van offertes en het bewaken van deadlines. We verkopen jouw
          gegevens nooit aan derden.
        </p>

        <h2 className="font-display text-xl font-semibold text-foreground mt-10 mb-3">
          Contact
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Heb je vragen over ons privacybeleid? Neem contact op via{" "}
          <a
            href="https://wa.me/31685303918"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      </div>
    </main>

    <Footer />
  </div>
);

export default Privacy;
