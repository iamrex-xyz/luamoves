import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type TaskDealOptionsProps = {
  taskTitle: string;
};

export const TaskDealOptions = ({ taskTitle }: TaskDealOptionsProps) => {
  const deals = [
    {
      id: 1,
      title: "Beste prijs-kwaliteit",
      price: "€99",
      icon: <TrendingUp className="w-4 h-4" />,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: 2,
      title: "Populairste keuze",
      price: "€129",
      icon: <Star className="w-4 h-4" />,
      iconBg: "bg-yellow-50 text-yellow-600",
      popular: true,
    },
    {
      id: 3,
      title: "Budget optie",
      price: "€79",
      icon: <DollarSign className="w-4 h-4" />,
      iconBg: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
      {deals.map((deal) => (
        <Card
          key={deal.id}
          className={`p-3 relative cursor-pointer hover:shadow-md transition-shadow ${
            deal.popular ? "border-primary ring-1 ring-primary" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            console.log(`Opening deal: ${deal.id}`);
          }}
        >
          {deal.popular && (
            <Badge className="absolute -top-2 -right-2 bg-primary h-5 px-1.5">
              <Star className="w-3 h-3" />
            </Badge>
          )}

          <div className="flex items-start gap-2">
            <div className={`p-1.5 rounded ${deal.iconBg} flex-shrink-0`}>
              {deal.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{deal.title}</div>
              <div className="text-sm font-bold text-primary mt-0.5">
                {deal.price}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full mt-2 h-7 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Selecting deal: ${deal.id}`);
            }}
          >
            Kies
            <ExternalLink className="w-3 h-3" />
          </Button>
        </Card>
      ))}
    </div>
  );
};
