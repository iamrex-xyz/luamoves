import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MovingInfo } from "@/pages/Index";
import { generateTasksForRenter, Task } from "@/lib/taskGenerator";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Filter,
  Clock,
} from "lucide-react";

type TaskListProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "timeline") => void;
};

export const TaskList = ({ movingInfo, onNavigate }: TaskListProps) => {
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Genereer dynamische taken
  const generatedTasks = useMemo(() => {
    if (movingInfo.type === "rent") {
      return generateTasksForRenter(movingInfo);
    }
    return [];
  }, [movingInfo]);

  const [tasks, setTasks] = useState<Task[]>(generatedTasks);

  // Bereken categorieën
  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, [tasks]);

  // Filter taken
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = filter === "all" || task.status === filter;
      const categoryMatch = categoryFilter === "all" || task.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [tasks, filter, categoryFilter]);

  // Groepeer taken per fase
  const tasksByPhase = useMemo(() => {
    const phases: { [key: string]: Task[] } = {};
    filteredTasks.forEach((task) => {
      if (!phases[task.phase]) {
        phases[task.phase] = [];
      }
      phases[task.phase].push(task);
    });
    return phases;
  }, [filteredTasks]);

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
        return "bg-accent/10 text-accent border-accent/20";
      case "in_progress":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return "✓ Afgerond";
      case "in_progress":
        return "⏳ Bezig";
      default:
        return "○ Te doen";
    }
  };

  const isOverdue = (deadline: Date) => {
    return new Date() > deadline;
  };

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-5 md:p-6 pb-8 sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("dashboard")}
            className="text-white hover:bg-white/10 mb-4 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Terug naar dashboard
          </Button>
          <h1 className="text-3xl md:text-2xl font-bold mb-2">Jouw checklist</h1>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-5 h-5" />
            <span className="text-base md:text-sm">
              {daysUntilMove > 0
                ? `Nog ${daysUntilMove} dagen tot verhuizing`
                : daysUntilMove === 0
                ? "Vandaag is de verhuisdag!"
                : `${Math.abs(daysUntilMove)} dagen geleden verhuisd`}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-5 sticky top-[140px] md:top-[130px] bg-background/95 backdrop-blur-lg z-10 border-b shadow-sm">
        <div className="space-y-3">
          {/* Status filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Status</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="min-h-[44px] whitespace-nowrap"
              >
                Alle ({tasks.length})
              </Button>
              <Button
                variant={filter === "todo" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("todo")}
                className="min-h-[44px] whitespace-nowrap"
              >
                Te doen ({tasks.filter((t) => t.status === "todo").length})
              </Button>
              <Button
                variant={filter === "in_progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("in_progress")}
                className="min-h-[44px] whitespace-nowrap"
              >
                Bezig ({tasks.filter((t) => t.status === "in_progress").length})
              </Button>
              <Button
                variant={filter === "done" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("done")}
                className="min-h-[44px] whitespace-nowrap"
              >
                Afgerond ({tasks.filter((t) => t.status === "done").length})
              </Button>
            </div>
          </div>

          {/* Category filter */}
          <div>
            <span className="text-sm font-medium text-muted-foreground mb-2 block">
              Categorie
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className="min-h-[44px] whitespace-nowrap"
                >
                  {cat === "all" ? "Alle" : cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks grouped by phase */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {Object.entries(tasksByPhase).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Geen taken gevonden voor deze filters.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div className="mb-4 sticky top-[280px] md:top-[260px] bg-background/95 backdrop-blur py-2 z-[5]">
                  <h2 className="text-xl md:text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {phase}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {phaseTasks.length} {phaseTasks.length === 1 ? "taak" : "taken"}
                  </p>
                </div>

                <div className="space-y-3">
                  {phaseTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={`p-5 md:p-4 transition-all active:scale-[0.98] ${
                        task.status === "done" ? "opacity-60" : ""
                      } ${
                        isOverdue(task.deadline) && task.status !== "done"
                          ? "border-destructive/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={task.status === "done"}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                          className="mt-1.5 min-w-[24px] min-h-[24px]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2.5 md:p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                {task.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-semibold text-base md:text-sm mb-1 ${
                                    task.status === "done" ? "line-through" : ""
                                  }`}
                                >
                                  {task.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="text-xs md:text-[11px]"
                                >
                                  {task.category}
                                </Badge>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                task.status
                              )} shrink-0 text-xs md:text-[11px]`}
                            >
                              {getStatusLabel(task.status)}
                            </Badge>
                          </div>

                          <p className="text-sm md:text-[13px] text-muted-foreground mb-3 leading-relaxed">
                            {task.description}
                          </p>

                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div
                              className={`flex items-center gap-2 text-sm md:text-xs ${
                                isOverdue(task.deadline) && task.status !== "done"
                                  ? "text-destructive font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                              <span>{task.deadlineLabel}</span>
                            </div>
                            {task.affiliateLink && task.status !== "done" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 min-h-[40px] md:min-h-[36px]"
                                onClick={() =>
                                  window.open(task.affiliateLink, "_blank")
                                }
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
