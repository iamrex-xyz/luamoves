import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MovingInfo } from "@/pages/Index";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import {
  Sparkles,
  Zap,
  Truck,
  Shield,
  ExternalLink,
  Info,
  Check,
} from "lucide-react";

const CONSENT_KEY = "partnerConsent";

type PartnerDeal = {
  id: string;
  provider: string;
  category: string;
  title: string;
  description: string;
  discount?: string;
  icon: React.ReactNode;
  url: string;
};

type PartnerDealsSectionProps = {
  movingInfo: MovingInfo;
};

// Mock deals generator based on user data
const generateDeals = (movingInfo: MovingInfo): PartnerDeal[] => {
  const deals: PartnerDeal[] = [];
  const postcode = movingInfo.newAddress?.split(" ")[0] || "";

  // Energy deal - always show if we have postcode
  if (postcode) {
    deals.push({
      id: "energy-1",
      provider: "Energievergelijker.nl",
      category: "Energie",
      title: "Vergelijk energietarieven",
      description: `Speciaal voor ${postcode}: bespaar tot €400 per jaar op je energierekening`,
      discount: "Tot €400 besparen",
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      url: "#",
    });
  }

  // Moving company deal - show if we have date and address
  if (movingInfo.movingDate && movingInfo.newAddress) {
    const formattedDate = new Date(movingInfo.movingDate).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
    });
    deals.push({
      id: "moving-1",
      provider: "Verhuisbedrijven.nl",
      category: "Verhuizen",
      title: "Verhuisbedrijf offerte",
      description: `Ontvang 3 gratis offertes voor je verhuizing op ${formattedDate}`,
      discount: "3 gratis offertes",
      icon: <Truck className="w-5 h-5 text-primary" />,
      url: "#",
    });
  }

  // Insurance deal
  deals.push({
    id: "insurance-1",
    provider: "Inboedelverzekering.nl",
    category: "Verzekering",
    title: "Nieuwe woning verzekeren",
    description: "Regel direct je inboedel- en opstalverzekering voor je nieuwe woning",
    discount: "Eerste maand gratis",
    icon: <Shield className="w-5 h-5 text-green-500" />,
    url: "#",
  });

  return deals;
};

export const PartnerDealsSection = ({ movingInfo }: PartnerDealsSectionProps) => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Load consent from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    setHasConsent(stored === "true");
  }, []);

  const handleConsentChange = (checked: boolean) => {
    setHasConsent(checked);
    localStorage.setItem(CONSENT_KEY, checked ? "true" : "false");
    trackEvent(AnalyticsEvents.PARTNER_CONSENT_CHANGED, { consent: checked });
  };

  const handleDealClick = (deal: PartnerDeal) => {
    trackEvent(AnalyticsEvents.PARTNER_DEAL_CLICKED, {
      dealId: deal.id,
      provider: deal.provider,
      category: deal.category,
    });
    window.open(deal.url, "_blank");
  };

  const handlePrivacyClick = () => {
    trackEvent(AnalyticsEvents.PRIVACY_MODAL_OPENED);
    setShowPrivacyModal(true);
  };

  const deals = useMemo(() => generateDeals(movingInfo), [movingInfo]);

  // Track deal views
  useEffect(() => {
    if (hasConsent && deals.length > 0) {
      trackEvent(AnalyticsEvents.PARTNER_DEAL_VIEWED, {
        dealCount: deals.length,
        dealIds: deals.map((d) => d.id),
      });
    }
  }, [hasConsent, deals]);

  // Don't render until we've loaded consent status
  if (hasConsent === null) return null;

  return (
    <div className="mt-8 mb-6">
      <Card className="p-4">
        {/* Header with consent toggle */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Slimme verhuisdeals</h2>
              <p className="text-xs text-muted-foreground">
                Gepersonaliseerde aanbiedingen voor jouw verhuizing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={hasConsent}
              onCheckedChange={handleConsentChange}
              aria-label="Deals aan/uit"
            />
          </div>
        </div>

        {/* Consent explanation */}
        {!hasConsent && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-3">
              Ontvang slimme deals voor je verhuizing. We delen alleen noodzakelijke gegevens met geselecteerde partners.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleConsentChange(true)}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Akkoord
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePrivacyClick}
                className="gap-1.5 text-muted-foreground"
              >
                <Info className="w-3.5 h-3.5" />
                Meer info
              </Button>
            </div>
          </div>
        )}

        {/* Deals list */}
        {hasConsent && (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleDealClick(deal)}
              >
                <div className="p-2 bg-muted rounded-lg shrink-0">{deal.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{deal.title}</span>
                    {deal.discount && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-0">
                        {deal.discount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{deal.description}</p>
                  <p className="text-xs text-muted-foreground/70">{deal.provider}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}

            {/* Privacy link */}
            <button
              onClick={handlePrivacyClick}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2"
            >
              <Info className="w-3 h-3" />
              Privacy & gegevens beheren
            </button>
          </div>
        )}
      </Card>

      {/* Privacy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy & gegevensdeling</DialogTitle>
            <DialogDescription>
              Hoe we jouw gegevens gebruiken voor gepersonaliseerde deals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Welke gegevens delen we?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Postcode (voor lokale aanbiedingen)</li>
                <li>• Verhuisdatum (voor tijdgevoelige deals)</li>
                <li>• Woningtype (huur/koop)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Waarom?</h4>
              <p className="text-sm text-muted-foreground">
                Om je relevante aanbiedingen te tonen die passen bij jouw verhuissituatie.
                Zo bespaar je tijd en geld.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Jouw controle</h4>
              <p className="text-sm text-muted-foreground">
                Je kunt op elk moment je toestemming intrekken via de toggle hierboven
                of in Instellingen. We gebruiken geen cookies, alleen lokale opslag.
              </p>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Deals ontvangen</span>
                <Switch
                  checked={hasConsent}
                  onCheckedChange={(checked) => {
                    handleConsentChange(checked);
                    if (!checked) setShowPrivacyModal(false);
                  }}
                />
              </div>
            </div>
          </div>

          <Button onClick={() => setShowPrivacyModal(false)} className="w-full">
            Sluiten
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
