import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MovingInfo } from "@/pages/Index";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/taskGenerator";
import { BottomNav } from "@/components/BottomNav";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { LuaLogo } from "@/components/LuaLogo";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  LogOut,
  User,
  CheckCircle2,
  Plus,
  ExternalLink,
  Circle,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
  onLogout: () => void;
  onTaskComplete?: (completedCount: number) => void;
};

export const Dashboard = ({ movingInfo, onNavigate, onLogout, onTaskComplete }: DashboardProps) => {
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Filter alleen niet-afgeronde taken voor de homepage
  const openTasks = tasks.filter(t => t.status !== "done");

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCheckboxClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    handleTaskToggle(task.id);
  };

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const wasNotDone = task?.status !== "done";
    
    setCompletingTasks(prev => new Set(prev).add(taskId));
    
    // Wacht op animatie
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Update status
    await toggleTaskStatus(taskId);
    
    // Verwijder uit animating set
    setCompletingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });

    // Trigger signup prompt if task was completed (not uncompleted)
    if (wasNotDone && onTaskComplete) {
      const newCompletedCount = tasks.filter(t => t.status === "done").length + 1;
      onTaskComplete(newCompletedCount);
    }
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const moveDate = new Date(movingInfo.movingDate);
  const dayOfWeek = moveDate.toLocaleDateString("nl-NL", { weekday: "short" });
  const dayNumber = moveDate.getDate();
  const monthName = moveDate.toLocaleDateString("nl-NL", { month: "long" });

  const TaskItem = ({ task }: { task: Task }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = deadline < today && task.status !== "done";
    const isCompleting = completingTasks.has(task.id);

    return (
      <div 
        className={`group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
          isCompleting 
            ? "bg-primary/10 scale-95 opacity-0" 
            : isOverdue 
              ? "bg-destructive/5 hover:bg-destructive/10" 
              : "bg-secondary/50 hover:bg-secondary"
        }`}
        onClick={() => !isCompleting && handleTaskClick(task)}
      >
        <div className="flex items-start gap-4">
          <div 
            className="mt-0.5 shrink-0 cursor-pointer transition-transform duration-200 hover:scale-110"
            onClick={(e) => !isCompleting && handleCheckboxClick(e, task)}
          >
            {isCompleting ? (
              <CheckCircle2 className="h-5 w-5 text-primary animate-scale-in" />
            ) : task.status === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm mb-1 transition-colors ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.deadlineLabel}
                {daysUntil === 0 && " (vandaag)"}
                {daysUntil === 1 && " (morgen)"}
                {isOverdue && <span className="text-destructive ml-1">(verlopen)</span>}
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
              variant="ghost"
              className="shrink-0 h-8 px-3 text-xs text-primary hover:text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/deals?task=${encodeURIComponent(task.title)}`);
              }}
            >
              Regelen
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <LuaLogo size="lg" />
            <p className="text-sm text-muted-foreground mt-0.5">Jouw verhuis assistent</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-10 w-10 rounded-full hover:bg-secondary"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Moving Date Card */}
      <div className="px-6 mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative p-6">
            <div className="flex items-center gap-6">
              {/* Date Display */}
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
                <span className="text-xs uppercase tracking-wide opacity-80">{dayOfWeek}</span>
                <span className="text-3xl font-bold">{dayNumber}</span>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Verhuisdatum</p>
                <h2 className="text-xl font-semibold text-foreground mb-1">{monthName}</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
                    {daysUntilMove} dagen
                  </span>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="hsl(var(--muted))"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-primary"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{completedTasks}</p>
                  <p className="text-xs text-muted-foreground">voltooid</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{openTasks.length}</p>
                  <p className="text-xs text-muted-foreground">open</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Jouw taken</h2>
            <p className="text-xs text-muted-foreground">Recente taken om te voltooien</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAddTask(true)}
            className="h-9 px-3 rounded-full bg-primary-light text-primary hover:bg-primary-muted"
          >
            <Plus className="w-4 h-4 mr-1" />
            Toevoegen
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 rounded-3xl bg-white shadow-lg">
            <p className="text-center text-muted-foreground">Taken laden...</p>
          </div>
        ) : openTasks.length > 0 ? (
          <div className="space-y-2">
            {openTasks.slice(0, 5).map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
            {openTasks.length > 5 && (
              <Button
                variant="ghost"
                className="w-full h-12 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => onNavigate("tasks")}
              >
                Bekijk alle {openTasks.length} taken
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-white shadow-lg">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">Alle taken voltooid!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voeg een nieuwe taak toe om verder te gaan.
            </p>
            <Button onClick={() => setShowAddTask(true)} className="rounded-full bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Taak toevoegen
            </Button>
          </div>
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
        onToggleStatus={handleTaskToggle}
      />

      <BottomNav currentView="dashboard" onNavigate={onNavigate} />
    </div>
  );
};
