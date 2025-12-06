import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, CheckCircle, X } from "lucide-react";
import { Task } from "@/lib/taskGenerator";

type TaskDealDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TaskDealDialog = ({ task, open, onOpenChange }: TaskDealDialogProps) => {
  if (!task) return null;

  // Placeholder deals - later to be replaced with actual data
  const deals = [
    {
      id: 1,
      title: "Beste prijs-kwaliteit",
      provider: "Aanbieder A",
      price: "€99",
      rating: 4.5,
      features: ["Gratis annulering", "24/7 support", "Verzekerd"],
      url: "#", // Placeholder - will be filled later
    },
    {
      id: 2,
      title: "Populairste keuze",
      provider: "Aanbieder B",
      price: "€129",
      rating: 4.8,
      features: ["Premium service", "Gratis extra's", "Snelle levering"],
      url: "#", // Placeholder
      popular: true,
    },
    {
      id: 3,
      title: "Budget optie",
      provider: "Aanbieder C",
      price: "€79",
      rating: 4.2,
      features: ["Basis service", "Goede reviews", "Betrouwbaar"],
      url: "#", // Placeholder
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[100dvh] p-0 flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Kies de beste optie voor jouw situatie
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {deals.map((deal) => (
              <Card 
                key={deal.id} 
                className={`p-4 relative ${deal.popular ? 'border-primary border-2' : ''}`}
              >
                {deal.popular && (
                  <Badge className="absolute -top-3 left-4 bg-primary">
                    <Star className="w-3 h-3 mr-1" />
                    Meest gekozen
                  </Badge>
                )}
                
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{deal.provider}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
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

                    <div className="space-y-1.5 mb-4">
                      {deal.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {deal.price}
                    </div>
                    <Button
                      className="gap-2"
                      onClick={() => {
                        // Placeholder - will open external link later
                        console.log(`Opening deal: ${deal.id}`);
                        onOpenChange(false);
                      }}
                    >
                      Kies deze optie
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              💡 Tip: Vergelijk de opties en kies wat het beste bij jouw situatie past
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
