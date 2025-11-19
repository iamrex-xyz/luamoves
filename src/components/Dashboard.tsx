import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MovingInfo } from "@/pages/Index";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/taskGenerator";
import { BottomNav } from "@/components/BottomNav";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import {
  Home,
  Clock,
  LogOut,
  User,
  CheckCircle2,
  Plus,
  ExternalLink,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState } from "react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
  onLogout: () => void;
};

export const Dashboard = ({ movingInfo, onNavigate, onLogout }: DashboardProps) => {
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Get priority tasks (upcoming deadlines, not completed)
  const priorityTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks
      .filter(task => {
        if (task.status === "done") return false;
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 21; // Next 3 weeks for better overview
      })
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 15); // Show more tasks for better overview
  }, [tasks]);


  const getStatusBadge = (task: Task) => {
    if (task.status === "done") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 min-w-[75px] justify-center text-xs">Voltooid</Badge>;
    }
    if (task.status === "in_progress") {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 min-w-[75px] justify-center text-xs">Bezig</Badge>;
    }
    return null;
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = deadline < today && task.status !== "done";

    return (
      <div 
        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
          isOverdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={() => toggleTaskStatus(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`font-medium text-xs md:text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h4>
              {getStatusBadge(task) && (
                <div className="flex-shrink-0">
                  {getStatusBadge(task)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.deadlineLabel}
                {daysUntil === 0 && " (vandaag)"}
                {daysUntil === 1 && " (morgen)"}
                {daysUntil > 1 && ` (${daysUntil} dagen)`}
                {isOverdue && " (verlopen)"}
              </span>
              {task.assignedToEmail && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {task.assignedToEmail}
                </span>
              )}
            </div>
          </div>
          
          {task.affiliateLink && task.status !== "done" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-6 text-xs bg-accent text-accent-foreground hover:bg-accent/90 border-0 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                window.open(task.affiliateLink, "_blank");
              }}
            >
              Direct regelen
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky Header with Charly */}
      <div className="bg-primary text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                <Home className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Charly</h1>
                <p className="text-white/80 text-xs md:text-base">
                  Jouw verhuis concierge
                </p>
              </div>
            </div>
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
      </div>

      {/* Stats Card - Scrolls naturally with page */}
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-2 md:pt-3 pb-4 md:pb-6">
          <Card className="p-4 md:p-5 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-4 md:gap-6">
                {/* Circular Progress */}
                <div className="relative flex-shrink-0">
                  <svg className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - progressPercentage / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold">{Math.round(progressPercentage)}%</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl md:text-4xl font-bold">{daysUntilMove}</span>
                    <span className="text-base md:text-lg text-white/80">dagen</span>
                  </div>
                  <p className="text-xs md:text-sm text-white/80 mb-3">
                    tot {new Date(movingInfo.movingDate).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long"
                    })}
                  </p>
                  <div className="flex items-center gap-4 text-xs md:text-sm">
                    <div>
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1" />
                      <span className="font-semibold">{completedTasks}</span>
                      <span className="text-white/70">/{totalTasks}</span>
                    </div>
                  </div>
                </div>
              </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 md:p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-muted rounded-lg">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">{completedTasks}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Voltooid</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-muted rounded-lg">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-warning" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {tasks.filter(t => t.status === "in_progress").length}
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Bezig</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-muted rounded-lg">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-info" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {priorityTasks.length}
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Binnenkort</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-4 md:p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Voortgang</h3>
              <span className="text-sm font-semibold text-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedTasks} van {totalTasks} taken voltooid
            </p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 md:p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">Snelle acties</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowAddTask(true)}
              className="gap-2 h-auto py-3 flex-col items-center justify-center"
              variant="outline"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Taak toevoegen</span>
            </Button>
            <Button 
              onClick={() => onNavigate("tasks")}
              className="gap-2 h-auto py-3 flex-col items-center justify-center"
              variant="outline"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs">Alle taken</span>
            </Button>
            <Button 
              onClick={() => onNavigate("extras")}
              className="gap-2 h-auto py-3 flex-col items-center justify-center"
              variant="outline"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Extra's</span>
            </Button>
            <Button 
              onClick={() => onNavigate("settings")}
              className="gap-2 h-auto py-3 flex-col items-center justify-center"
              variant="outline"
            >
              <Zap className="w-5 h-5" />
              <span className="text-xs">Instellingen</span>
            </Button>
          </div>
        </Card>

        {/* Priority Tasks */}
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Taken laden...</p>
          </Card>
        ) : (
          <>
            {/* Priority Tasks */}
            {priorityTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <h2 className="text-base md:text-lg font-bold">Binnenkort te doen</h2>
                    <Badge variant="secondary" className="text-xs">{priorityTasks.length}</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddTask(true)}
                    className="flex items-center gap-1.5 h-8 text-xs md:text-sm"
                  >
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden md:inline">Taak toevoegen</span>
                    <span className="md:hidden">Toevoegen</span>
                  </Button>
                </div>
                <Card className="p-4">
                  <div className="space-y-3">
                    {priorityTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {priorityTasks.length === 0 && (
              <Card className="p-6 md:p-8 text-center">
                <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-base md:text-lg mb-2">Perfect! Je loopt op schema! 🎉</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  Alle dringende taken zijn onder controle. Neem even rust of bekijk wat je nog meer kunt voorbereiden.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => onNavigate("tasks")} variant="outline">
                    Bekijk alle taken
                  </Button>
                  <Button onClick={() => setShowAddTask(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Taak toevoegen
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      <AddTaskDialog 
        open={showAddTask} 
        onOpenChange={setShowAddTask}
        onTaskAdded={refreshTasks}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onTaskUpdate={refreshTasks}
      />

      <BottomNav currentView="dashboard" onNavigate={onNavigate} />
    </div>
  );
};
