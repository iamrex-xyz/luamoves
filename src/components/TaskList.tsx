import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MovingInfo } from "@/pages/Index";
import {
  ArrowLeft,
  Home,
  Zap,
  Wifi,
  Shield,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react";

type TaskListProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "timeline") => void;
};

type Task = {
  id: string;
  title: string;
  category: string;
  description: string;
  deadline: string;
  status: "todo" | "in_progress" | "done";
  affiliateLink?: string;
  icon: React.ReactNode;
};

export const TaskList = ({ movingInfo, onNavigate }: TaskListProps) => {
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");

  // Mock tasks - in real app from database
  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Adreswijziging doorgeven gemeente",
      category: "Administratie",
      description: "Geef je nieuwe adres door aan de gemeente binnen 5 dagen na verhuizing.",
      deadline: "5 dagen na verhuizing",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "2",
      title: "Energie overstappen",
      category: "Nutsvoorzieningen",
      description: "Vergelijk energieleveranciers en sluit een nieuw contract af.",
      deadline: "2 weken voor verhuizing",
      status: "in_progress",
      affiliateLink: "https://example.com",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "3",
      title: "Internetprovider kiezen",
      category: "Diensten",
      description: "Kies een internetprovider en regel de aansluiting.",
      deadline: "3 weken voor verhuizing",
      status: "done",
      affiliateLink: "https://example.com",
      icon: <Wifi className="w-4 h-4" />,
    },
    {
      id: "4",
      title: "Inboedelverzekering aanpassen",
      category: "Verzekeringen",
      description: "Update je inboedelverzekering met het nieuwe adres en waarde.",
      deadline: "1 week voor verhuizing",
      status: "todo",
      affiliateLink: "https://example.com",
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  if (movingInfo.type === "rent") {
    mockTasks.push({
      id: "5",
      title: "Huurcontract tekenen",
      category: "Huur",
      description: "Lees het contract goed door en teken deze.",
      deadline: "Voor sleuteloverdracht",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
    });
  } else {
    mockTasks.push({
      id: "6",
      title: "Notarisafspraak plannen",
      category: "Koop",
      description: "Maak een afspraak met de notaris voor de overdracht.",
      deadline: "2 weken voor verhuizing",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
    });
  }

  const [tasks, setTasks] = useState(mockTasks);

  const filteredTasks = tasks.filter((task) =>
    filter === "all" ? true : task.status === filter
  );

  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "done" ? "todo" : "done",
            }
          : task
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-accent/10 text-accent";
      case "in_progress":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return "Afgerond";
      case "in_progress":
        return "Bezig";
      default:
        return "Te doen";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 pb-8 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("dashboard")}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar overzicht
          </Button>
          <h1 className="text-2xl font-bold">Alle taken</h1>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-4xl mx-auto px-4 py-4 sticky top-[120px] bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Alle ({tasks.length})
          </Button>
          <Button
            variant={filter === "todo" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("todo")}
          >
            Te doen ({tasks.filter((t) => t.status === "todo").length})
          </Button>
          <Button
            variant={filter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("in_progress")}
          >
            Bezig ({tasks.filter((t) => t.status === "in_progress").length})
          </Button>
          <Button
            variant={filter === "done" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("done")}
          >
            Afgerond ({tasks.filter((t) => t.status === "done").length})
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`p-4 transition-all ${
                task.status === "done" ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => toggleTaskStatus(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        {task.icon}
                      </div>
                      <h3
                        className={`font-semibold ${
                          task.status === "done" ? "line-through" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{task.deadline}</span>
                    </div>
                    {task.affiliateLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(task.affiliateLink, "_blank")}
                      >
                        Direct regelen
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
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
