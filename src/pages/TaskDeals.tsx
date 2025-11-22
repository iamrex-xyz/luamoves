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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-bold">Kies de beste optie</h1>
              <p className="text-sm text-white/80">{taskTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Vergelijk de opties en kies wat het beste bij jouw situatie past
        </p>

        {deals.map((deal) => (
          <Card 
            key={deal.id} 
            className={`p-6 relative ${deal.popular ? 'border-primary border-2 shadow-lg' : 'shadow-md'}`}
          >
            {deal.popular && (
              <Badge className="absolute -top-3 left-6 bg-primary h-6 px-3">
                <Star className="w-3 h-3 mr-1" />
                Meest gekozen
              </Badge>
            )}
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left side - Icon & Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${deal.iconBg} flex-shrink-0`}>
                    {deal.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{deal.provider}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(deal.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {deal.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {deal.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Price & CTA */}
              <div className="flex flex-col items-center justify-center md:items-end md:justify-between gap-4 md:w-48">
                <div className="text-center md:text-right">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {deal.price}
                  </div>
                  <p className="text-xs text-muted-foreground">per dienst</p>
                </div>
                <Button
                  className="gap-2 w-full md:w-auto"
                  size="lg"
                  onClick={() => {
                    window.open(deal.url, "_blank");
                  }}
                >
                  Kies deze optie
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: Vergelijk de opties rustig en kies wat het beste bij jouw budget en wensen past
          </p>
        </div>
      </div>
    </div>
  );
};
