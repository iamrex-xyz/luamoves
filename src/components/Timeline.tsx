import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MovingInfo } from "@/pages/Index";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, LogOut } from "lucide-react";

type TimelineProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "timeline" | "settings") => void;
  onLogout: () => void;
};

type TimelineEvent = {
  id: string;
  title: string;
  date: string;
  category: string;
  status: "completed" | "upcoming" | "overdue";
  tasks: string[];
};

export const Timeline = ({ movingInfo, onNavigate, onLogout }: TimelineProps) => {
  const movingDate = new Date(movingInfo.movingDate);

  const keyHandoverDate = movingInfo.keyHandoverDate 
    ? new Date(movingInfo.keyHandoverDate) 
    : new Date(movingDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getPhaseStatus = (phaseDate: Date): "completed" | "upcoming" | "overdue" => {
    if (phaseDate < today) return "completed";
    return "upcoming";
  };

  // Timeline data met de 8 fases
  const events: TimelineEvent[] = [
    {
      id: "1",
      title: "Fase 1 - Je nieuwe thuis is bevestigd",
      date: new Date(movingDate.getTime() - 45 * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL"),
      category: "Planning",
      status: getPhaseStatus(new Date(movingDate.getTime() - 45 * 24 * 60 * 60 * 1000)),
      tasks: ["Huurcontract tekenen", "Opzegtermijn checken", "Verhuisbudget bepalen"],
    },
    {
      id: "2",
      title: "Fase 2 - De voorbereidingen beginnen",
      date: new Date(movingDate.getTime() - 35 * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL"),
      category: "Administratie",
      status: getPhaseStatus(new Date(movingDate.getTime() - 35 * 24 * 60 * 60 * 1000)),
      tasks: ["Huidige huur opzeggen", "Gemeente informeren", "Adreswijzigingen doorgeven"],
    },
    {
      id: "3",
      title: "Fase 3 - Sleutels in handen",
      date: keyHandoverDate.toLocaleDateString("nl-NL"),
      category: "Inspectie",
      status: getPhaseStatus(keyHandoverDate),
      tasks: ["Woning inspecteren", "Ruimtes opmeten", "Verbouwplannen maken"],
    },
    {
      id: "4",
      title: "Fase 4 - De laatste voorbereidingen",
      date: new Date(movingDate.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL"),
      category: "Inpakken",
      status: getPhaseStatus(new Date(movingDate.getTime() - 3 * 24 * 60 * 60 * 1000)),
      tasks: ["Resterende spullen inpakken", "Schoonmaak oude woning", "Verhuizers bevestigen"],
    },
    {
      id: "5",
      title: "Fase 5 - Afscheid van je oude plek",
      date: movingDate.toLocaleDateString("nl-NL"),
      category: "Afronding",
      status: getPhaseStatus(movingDate),
      tasks: ["Sleutels inleveren", "Meterstanden noteren"],
    },
    {
      id: "6",
      title: "Fase 6 - De verhuisdag zelf",
      date: movingDate.toLocaleDateString("nl-NL"),
      category: "Verhuizing",
      status: getPhaseStatus(movingDate),
      tasks: ["Transport naar nieuwe woning", "Belangrijke spullen apart houden", "Voorzieningen controleren"],
    },
    {
      id: "7",
      title: "Fase 7 - Aankomen in je nieuwe thuis",
      date: new Date(movingDate.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL"),
      category: "Inrichten",
      status: getPhaseStatus(new Date(movingDate.getTime() + 3 * 24 * 60 * 60 * 1000)),
      tasks: ["Basismeubels neerzetten", "Dozen uitpakken", "Veiligheidsvoorzieningen checken"],
    },
    {
      id: "8",
      title: "Fase 8 - Alles op orde",
      date: new Date(movingDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL"),
      category: "Afwerking",
      status: getPhaseStatus(new Date(movingDate.getTime() + 14 * 24 * 60 * 60 * 1000)),
      tasks: ["Woning definitief inrichten", "Gemeentelijke belastingen checken", "Nieuwe buren ontmoeten"],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-accent" />;
      case "overdue":
        return <Clock className="w-6 h-6 text-destructive" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-accent bg-accent/5";
      case "overdue":
        return "border-destructive bg-destructive/5";
      default:
        return "border-border";
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar overzicht
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-white hover:bg-white/10 h-10 w-10"
              title="Uitloggen"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold mb-2">Tijdlijn</h1>
          <p className="text-sm md:text-base text-white/90">
            Je verhuizing in 8 fases van begin tot eind
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-12">
                {/* Icon */}
                <div className="absolute left-0 top-0 bg-background p-1 rounded-full border-2 border-border">
                  {getStatusIcon(event.status)}
                </div>

                {/* Content */}
                <Card className={`p-3 md:p-4 border-2 ${getStatusColor(event.status)}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-base md:text-lg mb-1.5">{event.title}</h3>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {event.category}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-semibold text-foreground/80">
                      Belangrijkste taken:
                    </p>
                    <ul className="space-y-2">
                      {event.tasks.map((task, taskIndex) => (
                        <li
                          key={taskIndex}
                          className="text-xs md:text-sm flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                          <span className="leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav currentView="timeline" onNavigate={onNavigate} />
    </div>
  );
};
