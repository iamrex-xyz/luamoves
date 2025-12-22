import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovingInfo } from "@/pages/Index";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/taskGenerator";
import { sortTasksSmart } from "@/lib/taskSorting";
import { BottomNav } from "@/components/BottomNav";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { LuaLogo } from "@/components/LuaLogo";
import { TaskListSkeleton } from "@/components/ui/skeletons";
import { SwipeableTaskItem } from "@/components/SwipeableTaskItem";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { hasAffiliateOptions } from "@/lib/taskTypeHelpers";
import { useQuestionDialogs } from "@/hooks/useQuestionDialogs";
import { EnergyQuestionsDialog } from "@/components/EnergyQuestionsDialog";
import { InternetQuestionsDialog } from "@/components/InternetQuestionsDialog";
import { MovingQuestionsDialog } from "@/components/MovingQuestionsDialog";
import { BoxesQuestionsDialog } from "@/components/BoxesQuestionsDialog";
import { InsuranceQuestionsDialog } from "@/components/InsuranceQuestionsDialog";
import { LiabilityQuestionsDialog } from "@/components/LiabilityQuestionsDialog";
import { PostNLPreparationDialog } from "@/components/PostNLPreparationDialog";
import { ParkingQuestionsDialog } from "@/components/ParkingQuestionsDialog";
import { CleaningQuestionsDialog } from "@/components/CleaningQuestionsDialog";
import { SmokeDetectorQuestionsDialog } from "@/components/SmokeDetectorQuestionsDialog";
import { GardenQuestionsDialog } from "@/components/GardenQuestionsDialog";
import { RenovationQuestionsDialog } from "@/components/RenovationQuestionsDialog";
import {
  Clock,
  User,
  CheckCircle2,
  Plus,
  Circle,
  ArrowRight,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onTaskComplete?: (completedCount: number, totalTasks: number) => void;
  onSignupClick?: () => void;
};

export const Dashboard = ({ movingInfo, onNavigate, onTaskComplete, onSignupClick }: DashboardProps) => {
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevOpenTasksCount, setPrevOpenTasksCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Question dialogs for affiliate tasks
  const {
    activeDialog,
    handleRegelenClick,
    handleDialogComplete,
    handleDialogRedirect,
    closeActiveDialog,
  } = useQuestionDialogs(movingInfo);

  // Filter en sorteer taken voor de homepage
  const openTasks = useMemo(() => {
    const open = tasks.filter(t => t.status !== "done");
    const sorted = sortTasksSmart(open);
    
    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      return sorted.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return sorted;
  }, [tasks, searchQuery]);

  // Get top 5 sorted tasks, ensuring at least 1 affiliate task is visible
  const displayTasks = useMemo(() => {
    const top5 = openTasks.slice(0, 5);
    const hasAffiliate = top5.some(t => hasAffiliateOptions(t));
    
    if (hasAffiliate) {
      return top5;
    }
    
    // Find first affiliate task not in top 5 and swap it in
    const firstAffiliateTask = openTasks.find((t, idx) => idx >= 5 && hasAffiliateOptions(t));
    if (firstAffiliateTask && top5.length === 5) {
      return [...top5.slice(0, 4), firstAffiliateTask];
    }
    
    return top5;
  }, [openTasks]);

  // Detect when all tasks become completed
  useEffect(() => {
    if (prevOpenTasksCount !== null && prevOpenTasksCount > 0 && openTasks.length === 0 && tasks.length > 0) {
      setShowConfetti(true);
    }
    setPrevOpenTasksCount(openTasks.length);
  }, [openTasks.length, tasks.length, prevOpenTasksCount]);

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
      onTaskComplete(newCompletedCount, tasks.length);
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
    const isDueToday = daysUntil === 0 && task.status !== "done";
    const isDueSoon = daysUntil === 1 && task.status !== "done";
    const isCompleting = completingTasks.has(task.id);

    // Determine urgency level for styling
    const getUrgencyStyles = () => {
      if (isCompleting) return "bg-primary animate-task-complete border-l-4 border-l-primary";
      if (task.status === "done") return "bg-secondary/30 border-l-4 border-l-transparent";
      if (isOverdue) return "bg-destructive/8 border-l-4 border-l-destructive hover:bg-destructive/12";
      if (isDueToday) return "bg-warning/10 border-l-4 border-l-warning hover:bg-warning/15";
      if (isDueSoon) return "bg-primary/5 border-l-4 border-l-primary/50 hover:bg-primary/10";
      return "bg-secondary/50 border-l-4 border-l-transparent hover:bg-secondary";
    };

    const getUrgencyLabel = () => {
      if (task.status === "done" || isCompleting) return null;
      if (isOverdue) return <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">Verlopen</span>;
      if (isDueToday) return <span className="text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">Vandaag</span>;
      if (isDueSoon) return <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Morgen</span>;
      return null;
    };

    return (
      <SwipeableTaskItem
        onSwipeComplete={() => handleTaskToggle(task.id)}
        disabled={task.status === "done" || isCompleting}
      >
        <div 
          className={`group relative px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${getUrgencyStyles()}`}
          onClick={() => !isCompleting && handleTaskClick(task)}
        >
          <div className="flex items-center gap-3">
            <div 
              className="shrink-0 cursor-pointer transition-transform duration-200 hover:scale-110"
              onClick={(e) => !isCompleting && handleCheckboxClick(e, task)}
            >
              {isCompleting ? (
                <CheckCircle2 className="h-5 w-5 text-primary-foreground animate-scale-in" />
              ) : task.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className={`h-5 w-5 transition-colors ${
                  isOverdue 
                    ? "text-destructive/60 group-hover:text-destructive" 
                    : isDueToday 
                      ? "text-warning/60 group-hover:text-warning"
                      : "text-muted-foreground/50 group-hover:text-primary/50"
                }`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className={`font-medium text-sm leading-snug ${
                  isCompleting 
                    ? "line-through text-primary-foreground" 
                    : task.status === "done" 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground"
                }`}>
                  {task.title}
                </h4>
                <div className="shrink-0">
                  {getUrgencyLabel()}
                </div>
              </div>
              <div className={`flex items-center justify-between text-[11px] ${
                isCompleting 
                  ? "text-primary-foreground/80" 
                  : isOverdue 
                    ? "text-destructive/70"
                    : isDueToday
                      ? "text-warning/70"
                      : "text-muted-foreground"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.deadlineLabel}
                  </span>
                  {task.assignedToEmail && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assignedToEmail}
                    </span>
                  )}
                </div>
                {task.status !== "done" && !isCompleting && hasAffiliateOptions(task) && (
                  <button
                    className="flex items-center text-[11px] text-primary hover:text-primary/80 hover:underline font-medium"
                    onClick={(e) => handleRegelenClick(e, task)}
                  >
                    Regelen
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SwipeableTaskItem>
    );
  };

  return (
    <main 
      id="main-content" 
      tabIndex={-1}
      className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white focus:outline-none"
      aria-label="Dashboard"
    >
      <PullToRefresh onRefresh={refreshTasks} className="min-h-screen">
      <ConfettiCelebration trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <LuaLogo size="md" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(!showSearch)}
          className="h-10 w-10 rounded-xl"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek taken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-xl border-0 bg-white shadow-sm"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Moving Date Card */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/15">
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
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-4 sm:px-6">
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
          <TaskListSkeleton count={5} />
        ) : openTasks.length > 0 ? (
          <div className="space-y-2 p-4 rounded-3xl bg-white shadow-lg shadow-primary/10">
            {displayTasks.map((task) => (
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
          <div className="p-8 text-center rounded-3xl bg-white shadow-lg shadow-primary/10">
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
        onSignupClick={onSignupClick}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onTaskUpdate={refreshTasks}
        onToggleStatus={handleTaskToggle}
      />

      {/* Question Dialogs */}
      <EnergyQuestionsDialog
        open={activeDialog === "energy"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("energy")}
      />
      <InternetQuestionsDialog
        open={activeDialog === "internet"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("internet")}
      />
      <MovingQuestionsDialog
        open={activeDialog === "moving"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("moving")}
      />
      <BoxesQuestionsDialog
        open={activeDialog === "boxes"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("boxes")}
      />
      <InsuranceQuestionsDialog
        open={activeDialog === "insurance"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("insurance")}
      />
      <LiabilityQuestionsDialog
        open={activeDialog === "liability"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("liability")}
      />
      <PostNLPreparationDialog
        open={activeDialog === "postNLPreparation"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={{
          oldAddress: movingInfo.oldAddress,
          newAddress: movingInfo.newAddress,
          movingDate: movingInfo.movingDate ? new Date(movingInfo.movingDate) : undefined,
        }}
        onUpdateMovingInfo={(data) => {
          handleDialogComplete({
            ...data,
            movingDate: data.movingDate?.toISOString(),
          });
        }}
      />
      <ParkingQuestionsDialog
        open={activeDialog === "parking"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("parking")}
      />
      <CleaningQuestionsDialog
        open={activeDialog === "cleaning"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("cleaning")}
      />
      <SmokeDetectorQuestionsDialog
        open={activeDialog === "smokeDetector"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("smokeDetector")}
      />
      <GardenQuestionsDialog
        open={activeDialog === "garden"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("garden")}
      />
      <RenovationQuestionsDialog
        open={activeDialog === "renovation"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        existingData={{
          renovationBudget: movingInfo.renovationBudget,
          renovationStartDate: movingInfo.renovationStartDate ? new Date(movingInfo.renovationStartDate) : undefined,
        }}
        onComplete={(data) => {
          handleDialogComplete({
            ...data,
            renovationStartDate: data.renovationStartDate?.toISOString(),
          });
        }}
        onRedirect={() => handleDialogRedirect("renovation")}
      />

      </PullToRefresh>

      <BottomNav currentView="dashboard" onNavigate={onNavigate} />
    </main>
  );
};
