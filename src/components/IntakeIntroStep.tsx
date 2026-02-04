import { Button } from "@/components/ui/button";
import { Sparkles, Gift, Clock, CheckCircle } from "lucide-react";

type IntakeIntroStepProps = {
  taskType: string;
  onContinue: () => void;
  onCancel: () => void;
};

const taskDescriptions: Record<string, { title: string; benefits: string[] }> = {
  energy: {
    title: "Energie vergelijken",
    benefits: [
      "We vergelijken alle energieleveranciers",
      "Je krijgt de beste deal voor jouw situatie",
      "Gemiddeld €300 besparing per jaar",
    ],
  },
  internet: {
    title: "Internet regelen",
    benefits: [
      "We vergelijken alle providers",
      "Advies op basis van jouw behoeften",
      "Vaak exclusieve kortingen",
    ],
  },
  moving: {
    title: "Verhuisbedrijf vinden",
    benefits: [
      "We zoeken betrouwbare verhuizers",
      "Offertes afgestemd op jouw verhuizing",
      "Bespaar tijd en stress",
    ],
  },
  boxes: {
    title: "Verhuisdozen bestellen",
    benefits: [
      "Het juiste aantal voor jouw woning",
      "Sterke, duurzame dozen",
      "Snel thuisbezorgd",
    ],
  },
  insurance: {
    title: "Inboedelverzekering checken",
    benefits: [
      "We vergelijken de beste opties",
      "Advies op basis van je nieuwe woning",
      "Direct goed verzekerd",
    ],
  },
  liability: {
    title: "Aansprakelijkheidsverzekering",
    benefits: [
      "Persoonlijk advies voor jouw situatie",
      "We vergelijken aanbieders",
      "Snel en makkelijk geregeld",
    ],
  },
  forwarding: {
    title: "Post doorsturen",
    benefits: [
      "Nooit meer post missen",
      "Makkelijk online regelen",
      "Direct actief na verhuizing",
    ],
  },
  verhuislift: {
    title: "Verhuislift regelen",
    benefits: [
      "We zoeken beschikbare liften",
      "Advies voor jouw gebouw",
      "Veilig je spullen verhuizen",
    ],
  },
  cleaning: {
    title: "Schoonmaak regelen",
    benefits: [
      "Betrouwbare schoonmaakpartners",
      "Op maat voor jouw woning",
      "Zorgeloos verhuizen",
    ],
  },
  smokeDetector: {
    title: "Rookmelders regelen",
    benefits: [
      "Verplicht in elke woning",
      "Advies op basis van je indeling",
      "Direct veilig wonen",
    ],
  },
  garden: {
    title: "Tuinonderhoud regelen",
    benefits: [
      "Partners in jouw regio",
      "Advies voor jouw tuin",
      "Eenmalig of doorlopend",
    ],
  },
  renovation: {
    title: "Aannemer vinden",
    benefits: [
      "Betrouwbare aannemers",
      "Offertes op maat",
      "Hulp bij jouw verbouwing",
    ],
  },
  hypotheek: {
    title: "Hypotheekadvies",
    benefits: [
      "Onafhankelijk advies",
      "We zoeken de beste rente",
      "Persoonlijke begeleiding",
    ],
  },
  notaris: {
    title: "Notaris regelen",
    benefits: [
      "Vergelijk notariskosten",
      "Betrouwbare partners",
      "Soepele overdracht",
    ],
  },
  taxatie: {
    title: "Taxatie regelen",
    benefits: [
      "Gecertificeerde taxateurs",
      "Snel een afspraak",
      "Erkend rapport",
    ],
  },
  bouwkundig: {
    title: "Bouwkundige keuring",
    benefits: [
      "Ervaren inspecteurs",
      "Duidelijk rapport",
      "Weet wat je koopt",
    ],
  },
  opstal: {
    title: "Opstalverzekering",
    benefits: [
      "Verplicht bij hypotheek",
      "We vergelijken premies",
      "Direct goed verzekerd",
    ],
  },
  slot: {
    title: "Slotcilinders vervangen",
    benefits: [
      "Veilig in je nieuwe huis",
      "Gekeurde sloten",
      "Snel geregeld",
    ],
  },
  default: {
    title: "Dit regelen",
    benefits: [
      "Persoonlijk advies",
      "De beste opties voor jou",
      "Snel en makkelijk",
    ],
  },
};

export const IntakeIntroStep = ({ taskType, onContinue, onCancel }: IntakeIntroStepProps) => {
  const config = taskDescriptions[taskType] || taskDescriptions.default;

  return (
    <div className="flex-1 flex flex-col px-6 py-6">
      {/* Lua avatar + intro */}
      <div className="flex gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">Lua</p>
          <h2 className="text-xl font-bold text-foreground">
            {config.title}
          </h2>
        </div>
      </div>

      {/* Main message */}
      <div className="bg-gradient-to-br from-primary-light to-primary-light/50 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Gift className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-1">
              Gratis & vrijblijvend
            </p>
            <p className="text-sm text-muted-foreground">
              Lua zoekt voor jou de beste deals. Je betaalt niks extra en bent nergens aan gebonden.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-1">
              Even wat info nodig
            </p>
            <p className="text-sm text-muted-foreground">
              We stellen je een paar korte vragen zodat we de beste optie voor jou kunnen vinden.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3 mb-8">
        <p className="text-sm font-medium text-muted-foreground">Wat je krijgt:</p>
        {config.benefits.map((benefit, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span className="text-sm text-foreground">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        <Button 
          onClick={onContinue}
          className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Laten we beginnen
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full h-10 text-muted-foreground"
        >
          Misschien later
        </Button>
      </div>
    </div>
  );
};
