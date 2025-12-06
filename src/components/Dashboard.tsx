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
import { useNavigate } from "react-router-dom";
import {
  Home,
  Clock,
  LogOut,
  User,
  CheckCircle2,
  Plus,
  ExternalLink,
  Circle,
} from "lucide-react";
import { useState } from "react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
  onLogout: () => void;
};

export const Dashboard = ({ movingInfo, onNavigate, onLogout }: DashboardProps) => {
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Filter alleen niet-afgeronde taken voor de homepage
  const openTasks = tasks.filter(t => t.status !== "done");

  const handleTaskToggle = async (taskId: string) => {
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
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );


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
    const isCompleting = completingTasks.has(task.id);

    return (
      <div 
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ${
          isCompleting 
            ? "bg-primary/20 border-primary/40 scale-95 -translate-y-2" 
            : isOverdue 
              ? "border-destructive/30 bg-destructive/5 hover:bg-muted/50" 
              : "border-border bg-card hover:bg-muted/50"
        } cursor-pointer`}
        style={isCompleting ? { 
          opacity: 0,
          transition: 'opacity 0.3s ease-out 0.3s, transform 0.5s ease-out, background-color 0.5s ease-out, border-color 0.5s ease-out'
        } : undefined}
        onClick={() => !isCompleting && handleTaskToggle(task.id)}
      >
        <div 
          className="mt-0.5 shrink-0 cursor-pointer transition-all duration-300 hover:scale-110"
        >
          {isCompleting ? (
            <CheckCircle2 className="h-[18px] w-[18px] text-primary animate-scale-in" />
          ) : task.status === "done" ? (
            <CheckCircle2 className="h-[18px] w-[18px] text-primary" />
          ) : (
            <Circle className="h-[18px] w-[18px] text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 
              className={`font-medium text-xs md:text-sm ${!isCompleting && "cursor-pointer hover:text-primary"} transition-colors ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
              onClick={(e) => {
                if (!isCompleting) {
                  e.stopPropagation();
                  setSelectedTask(task);
                }
              }}
            >
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
          
          {task.affiliateLink && task.status !== "done" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90 border-0 mt-2 md:hidden"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/deals?task=${encodeURIComponent(task.title)}`);
              }}
            >
              Direct regelen
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {task.affiliateLink && task.status !== "done" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-6 text-xs bg-accent text-accent-foreground hover:bg-accent/90 border-0 shrink-0 hidden md:flex"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/deals?task=${encodeURIComponent(task.title)}`);
            }}
          >
            Direct regelen
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
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
                      <div className="text-xl md:text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl md:text-4xl font-bold text-white">{daysUntilMove}</span>
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
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1 text-white" />
                      <span className="font-semibold text-white">{completedTasks}</span>
                      <span className="text-white/70"> voltooid</span>
                    </div>
                  </div>
                </div>
              </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Taken laden...</p>
          </Card>
        ) : openTasks.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-foreground">Jouw taken</h2>
                <Badge variant="secondary" className="text-xs">{openTasks.length}</Badge>
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
                {openTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-6 md:p-8 text-center">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-base md:text-lg mb-2 text-foreground">Je hebt nog geen taken</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Voeg je eerste taak toe om te beginnen met de voorbereiding van je verhuizing.
            </p>
            <Button onClick={() => setShowAddTask(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Taak toevoegen
            </Button>
          </Card>
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
