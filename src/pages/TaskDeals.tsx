import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, CheckCircle, ExternalLink, TrendingUp, DollarSign } from "lucide-react";

export const TaskDeals = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskTitle = searchParams.get("task") || "Deze taak";

  const deals = [
    {
      id: 1,
      title: "Beste prijs-kwaliteit",
      provider: "Aanbieder A",
      price: "€99",
      rating: 4.5,
      features: ["Gratis annulering", "24/7 support", "Verzekerd"],
      url: "https://example.com/deal1", // Placeholder
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: 2,
      title: "Populairste keuze",
      provider: "Aanbieder B",
      price: "€129",
      rating: 4.8,
      features: ["Premium service", "Gratis extra's", "Snelle levering"],
      url: "https://example.com/deal2", // Placeholder
      popular: true,
      icon: <Star className="w-5 h-5" />,
      iconBg: "bg-yellow-50 text-yellow-600",
    },
    {
      id: 3,
      title: "Budget optie",
      provider: "Aanbieder C",
      price: "€79",
      rating: 4.2,
      features: ["Basis service", "Goede reviews", "Betrouwbaar"],
      url: "https://example.com/deal3", // Placeholder
      icon: <DollarSign className="w-5 h-5" />,
      iconBg: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-primary-light/95 via-primary-light/80 to-white/95 backdrop-blur-lg border-b border-primary/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary-light active:scale-95 transition-transform"
              onClick={() => navigate("/", { replace: true })}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground">Kies de beste optie</h1>
              <p className="text-sm text-muted-foreground truncate">{taskTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        <p className="text-xs text-muted-foreground mb-2">
          Vergelijk de opties en kies wat het beste bij jouw situatie past
        </p>

        {deals.map((deal) => (
          <div 
            key={deal.id} 
            className={`p-3 md:p-4 relative rounded-3xl bg-white shadow-lg ${deal.popular ? 'ring-2 ring-primary shadow-primary/20' : 'shadow-primary/10'}`}
          >
            {deal.popular && (
              <span className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                Meest gekozen
              </span>
            )}
            
            <div className="flex gap-3 md:gap-4">
              {/* Left side - Icon & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 md:gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${deal.iconBg} flex-shrink-0`}>
                    {React.cloneElement(deal.icon, { className: "w-4 h-4" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-0.5 truncate">{deal.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{deal.provider}</p>
                    
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(deal.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {deal.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-2">
                  {deal.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs">
                      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Price & CTA */}
              <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    {deal.price}
                  </div>
                  <p className="text-[10px] text-muted-foreground">per dienst</p>
                </div>
                <Button
                  className="gap-1.5 text-xs h-9 px-4 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 active:scale-95 transition-transform"
                  onClick={() => {
                    window.open(deal.url, "_blank");
                  }}
                >
                  Kies
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-4 bg-white rounded-2xl shadow-sm border border-primary/10">
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: Vergelijk de opties rustig en kies wat het beste bij jouw budget en wensen past
          </p>
        </div>
      </div>
    </div>
  );
};
