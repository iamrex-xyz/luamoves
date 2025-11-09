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
  LogOut,
} from "lucide-react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "timeline") => void;
  onLogout: () => void;
};

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  total: number;
  completed: number;
  color: string;
};

export const Dashboard = ({ movingInfo, onNavigate, onLogout }: DashboardProps) => {
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
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-white hover:bg-white/10 h-12 w-12 md:h-10 md:w-10"
              title="Uitloggen"
            >
              <LogOut className="w-6 h-6 md:w-5 md:h-5" />
            </Button>
          </div>

          <Card className="p-6 md:p-5 bg-white/10 backdrop-blur border-white/20">
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="relative flex-shrink-0">
                <svg className="w-28 h-28 md:w-24 md:h-24 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    className="md:cx-48 md:cy-48 md:r-42"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    className="md:cx-48 md:cy-48 md:r-42"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPercentage / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl md:text-2xl font-bold text-white">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-3 text-white">
                <div>
                  <h3 className="text-lg md:text-base font-semibold mb-1">Jouw voortgang</h3>
                  <p className="text-white/80 text-sm">
                    {completedTasks} van {totalTasks} taken voltooid
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-2xl md:text-xl font-bold">{totalTasks - completedTasks}</div>
                    <div className="text-xs text-white/80">Te doen</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-2xl md:text-xl font-bold">{daysUntilMove}</div>
                    <div className="text-xs text-white/80">Dagen resterend</div>
                  </div>
                </div>
              </div>
            </div>
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
