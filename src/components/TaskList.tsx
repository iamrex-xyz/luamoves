import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MovingInfo } from "@/pages/Index";
import { Task } from "@/lib/taskGenerator";
import { useTasks } from "@/hooks/useTasks";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { ShareMovingDialog } from "@/components/ShareMovingDialog";
import { AssignTaskDropdown } from "@/components/AssignTaskDropdown";
import { EditDeadlinePopover } from "@/components/EditDeadlinePopover";
import { BottomNav } from "@/components/BottomNav";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Filter,
  Clock,
  Loader2,
  LogOut,
  Plus,
  Share2,
  User,
} from "lucide-react";

type TaskListProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "timeline" | "settings") => void;
  onLogout: () => void;
};

export const TaskList = ({ movingInfo, onNavigate, onLogout }: TaskListProps) => {
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "mine" | "others">("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Gebruik de custom hook voor task management
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);

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
      
      // Assignee filter
      let assigneeMatch = true;
      if (assigneeFilter === "mine") {
        assigneeMatch = !task.assignedTo && !task.assignedToEmail;
      } else if (assigneeFilter === "others") {
        assigneeMatch = !!(task.assignedTo || task.assignedToEmail);
      }
      
      return statusMatch && categoryMatch && assigneeMatch;
    });
  }, [tasks, filter, categoryFilter, assigneeFilter]);

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


  const getStatusBadge = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    const isTaskOverdue = deadline < today;

    if (task.status === "done") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 min-w-[75px] justify-center text-xs">Voltooid</Badge>;
    }
    if (task.status === "in_progress") {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 min-w-[75px] justify-center text-xs">Bezig</Badge>;
    }
    if (isTaskOverdue) {
      return <Badge variant="destructive" className="min-w-[75px] justify-center text-xs">Verlopen</Badge>;
    }
    return <Badge variant="outline" className="min-w-[75px] justify-center text-xs">Te doen</Badge>;
  };

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-4 md:p-6 pb-6 md:pb-8 sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="text-white hover:bg-white/10 min-h-[44px] text-xs md:text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Terug
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareDialog(true)}
                className="text-white hover:bg-white/10 h-10 w-10"
                title="Verhuizing delen"
              >
                <Share2 className="w-5 h-5" />
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
          </div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl md:text-2xl font-bold">Jouw checklist</h1>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddTask(true)}
              className="gap-1.5 min-h-[40px] text-xs md:text-sm px-3"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Toevoegen</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {daysUntilMove > 0
                ? `Nog ${daysUntilMove} dagen tot verhuizing`
                : daysUntilMove === 0
                ? "Vandaag is de verhuisdag!"
                : `${Math.abs(daysUntilMove)} dagen geleden verhuisd`}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="max-w-4xl mx-auto px-4 py-2.5 sticky top-[120px] md:top-[130px] bg-background/95 backdrop-blur-lg z-10 border-b shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          
          {/* Status filters */}
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Alle ({tasks.length})
          </Button>
          <Button
            variant={filter === "todo" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("todo")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Te doen ({tasks.filter((t) => t.status === "todo").length})
          </Button>
          <Button
            variant={filter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("in_progress")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Bezig ({tasks.filter((t) => t.status === "in_progress").length})
          </Button>
          <Button
            variant={filter === "done" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("done")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Afgerond ({tasks.filter((t) => t.status === "done").length})
          </Button>
          
          <div className="w-px h-6 bg-border shrink-0" />
          
          {/* Category filters */}
          {categories.slice(0, 4).map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
            >
              {cat === "all" ? "Alle cat." : cat}
            </Button>
          ))}
          
          <div className="w-px h-6 bg-border shrink-0" />
          
          {/* Assignee filters */}
          <Button
            variant={assigneeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter("all")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Iedereen
          </Button>
          <Button
            variant={assigneeFilter === "mine" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter("mine")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Mijn taken
          </Button>
          <Button
            variant={assigneeFilter === "others" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter("others")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Toegewezen
          </Button>
        </div>
      </div>

      {/* Tasks grouped by phase */}
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Taken laden...</p>
          </Card>
        ) : Object.entries(tasksByPhase).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Geen taken gevonden voor deze filters.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div className="mb-3 sticky top-[165px] md:top-[175px] bg-background/95 backdrop-blur py-2 z-[5]">
                  <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {phase}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {phaseTasks.length} {phaseTasks.length === 1 ? "taak" : "taken"}
                  </p>
                </div>

                <div className="space-y-3">
                  {phaseTasks.map((task) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const deadline = new Date(task.deadline);
                    deadline.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isTaskOverdue = deadline < today && task.status !== "done";

                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          isTaskOverdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                        }`}
                      >
                        <Checkbox
                          checked={task.status === "done"}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className={`font-medium text-sm leading-tight ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </h4>
                            <div className="flex-shrink-0">
                              {getStatusBadge(task)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>
                                {task.deadlineLabel}
                                {daysUntil === 0 && " (vandaag)"}
                                {daysUntil === 1 && " (morgen)"}
                                {daysUntil > 1 && ` (${daysUntil} dagen)`}
                                {isTaskOverdue && " (verlopen)"}
                              </span>
                            </span>
                            {task.assignedToEmail && (
                              <>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{task.assignedToEmail}</span>
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <EditDeadlinePopover
                              taskId={task.id}
                              currentDeadline={task.deadline}
                              onDeadlineChange={refreshTasks}
                            />
                            <AssignTaskDropdown
                              taskId={task.id}
                              currentAssignedTo={task.assignedTo}
                              currentAssignedEmail={task.assignedToEmail}
                              onAssignmentChange={refreshTasks}
                            />
                            {task.affiliateLink && task.status !== "done" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-8 text-xs"
                                onClick={() => window.open(task.affiliateLink, "_blank")}
                              >
                                Direct regelen
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddTaskDialog 
        open={showAddTask} 
        onOpenChange={setShowAddTask}
        onTaskAdded={refreshTasks}
      />
      <ShareMovingDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      <BottomNav currentView="tasks" onNavigate={onNavigate} />
    </div>
  );
};
