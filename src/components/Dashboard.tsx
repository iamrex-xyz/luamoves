import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MovingInfo } from "@/pages/Index";
import {
  Home,
  Zap,
  Wifi,
  Shield,
  Mail,
  Truck,
  Sparkles,
  FileText,
  Clock,
  ListChecks,
} from "lucide-react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "timeline") => void;
};

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  total: number;
  completed: number;
  color: string;
};

export const Dashboard = ({ movingInfo, onNavigate }: DashboardProps) => {
  // Mock data - in real app this would come from database
  const categories: Category[] = [
    {
      id: "general",
      name: "Algemeen",
      icon: <Home className="w-5 h-5" />,
      total: 8,
      completed: 2,
      color: "bg-primary/10 text-primary",
    },
    {
      id: "utilities",
      name: "Nutsvoorzieningen",
      icon: <Zap className="w-5 h-5" />,
      total: 4,
      completed: 1,
      color: "bg-warning/10 text-warning",
    },
    {
      id: "services",
      name: "Diensten",
      icon: <Wifi className="w-5 h-5" />,
      total: 3,
      completed: 0,
      color: "bg-info/10 text-info",
    },
    {
      id: "insurance",
      name: "Verzekeringen",
      icon: <Shield className="w-5 h-5" />,
      total: 2,
      completed: 0,
      color: "bg-accent/10 text-accent",
    },
    {
      id: "admin",
      name: "Administratie",
      icon: <FileText className="w-5 h-5" />,
      total: 5,
      completed: 1,
      color: "bg-secondary text-foreground",
    },
  ];

  if (movingInfo.type === "rent") {
    categories.push({
      id: "rental",
      name: "Huur specifiek",
      icon: <Home className="w-5 h-5" />,
      total: 4,
      completed: 0,
      color: "bg-primary/10 text-primary",
    });
  } else {
    categories.push({
      id: "purchase",
      name: "Koop specifiek",
      icon: <FileText className="w-5 h-5" />,
      total: 5,
      completed: 0,
      color: "bg-primary/10 text-primary",
    });
  }

  const totalTasks = categories.reduce((sum, cat) => sum + cat.total, 0);
  const completedTasks = categories.reduce((sum, cat) => sum + cat.completed, 0);
  const progressPercentage = (completedTasks / totalTasks) * 100;

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-5 md:p-6 pb-8 md:pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 md:p-2 bg-white/10 rounded-lg backdrop-blur">
              <Home className="w-7 h-7 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Jouw verhuizing</h1>
              <p className="text-white/80 text-sm md:text-base mt-1">
                {movingInfo.oldAddress} → {movingInfo.newAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5 text-sm md:text-base">
            <Clock className="w-5 h-5 md:w-4 md:h-4" />
            <span>
              Nog {daysUntilMove} dagen tot {new Date(movingInfo.movingDate).toLocaleDateString("nl-NL")}
            </span>
          </div>

          <Card className="p-5 md:p-4 bg-white/10 backdrop-blur border-white/20">
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="font-semibold text-base md:text-sm">Totale voortgang</span>
              <span className="text-3xl md:text-2xl font-bold">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-4 md:h-3" />
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            className="h-auto py-5 md:py-4 flex flex-col gap-2 shadow-md min-h-[100px]"
            onClick={() => onNavigate("tasks")}
          >
            <ListChecks className="w-7 h-7 md:w-6 md:h-6" />
            <span className="text-base md:text-sm font-semibold">Alle taken</span>
          </Button>
          <Button
            variant="secondary"
            className="h-auto py-5 md:py-4 flex flex-col gap-2 shadow-md min-h-[100px]"
            onClick={() => onNavigate("timeline")}
          >
            <Clock className="w-7 h-7 md:w-6 md:h-6" />
            <span className="text-base md:text-sm font-semibold">Tijdlijn</span>
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-5">Categorieën</h2>
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="p-5 md:p-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => onNavigate("tasks")}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3.5 md:p-3 rounded-lg ${category.color}`}>
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-2 text-base md:text-sm">{category.name}</h3>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={(category.completed / category.total) * 100}
                      className="flex-1 h-2.5 md:h-2"
                    />
                    <span className="text-base md:text-sm text-muted-foreground whitespace-nowrap">
                      {category.completed}/{category.total}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
