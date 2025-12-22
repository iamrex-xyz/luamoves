import { Button } from "@/components/ui/button";
import { MovingInfo } from "@/pages/Index";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/taskGenerator";
import { sortTasksSmart } from "@/lib/taskSorting";
import { BottomNav } from "@/components/BottomNav";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { LuaLogo } from "@/components/LuaLogo";
import { SwipeableTaskItem } from "@/components/SwipeableTaskItem";
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
import { CleaningQuestionsDialog } from "@/components/CleaningQuestionsDialog";
import { SmokeDetectorQuestionsDialog } from "@/components/SmokeDetectorQuestionsDialog";
import { GardenQuestionsDialog } from "@/components/GardenQuestionsDialog";
import { RenovationQuestionsDialog } from "@/components/RenovationQuestionsDialog";
import { BudgetDialog } from "@/components/BudgetDialog";
import {
  Clock,
  CheckCircle2,
  Plus,
  Circle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const MAX_TASKS_ON_HOME = 5;

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

  // Question dialogs for affiliate tasks
  const {
    activeDialog,
    handleRegelenClick,
    handleDialogComplete,
    handleDialogRedirect,
    closeActiveDialog,
  } = useQuestionDialogs(movingInfo);

  // Filter and sort tasks for homepage
  const openTasks = useMemo(() => {
    const open = tasks.filter(t => t.status !== "done");
    return sortTasksSmart(open);
  }, [tasks]);

  // Get top tasks, ensuring at least 1 affiliate/"regelen" task is visible
  const displayTasks = useMemo(() => {
    const topTasks = openTasks.slice(0, MAX_TASKS_ON_HOME);
    const hasAffiliate = topTasks.some(t => hasAffiliateOptions(t));
    
    if (hasAffiliate) {
      return topTasks;
    }
    
    // Find first affiliate task not in top and swap it in
    const firstAffiliateTask = openTasks.find((t, idx) => idx >= MAX_TASKS_ON_HOME && hasAffiliateOptions(t));
    if (firstAffiliateTask && topTasks.length === MAX_TASKS_ON_HOME) {
      return [...topTasks.slice(0, MAX_TASKS_ON_HOME - 1), firstAffiliateTask];
    }
    
    return topTasks;
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
    
    await new Promise(resolve => setTimeout(resolve, 600));
    await toggleTaskStatus(taskId);
    
    setCompletingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });

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
  const monthName = moveDate.toLocaleDateString("nl-NL", { month: "short" });

  const CompactTaskItem = ({ task, index }: { task: Task; index: number }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = deadline < today && task.status !== "done";
    const isDueToday = daysUntil === 0 && task.status !== "done";
    const isCompleting = completingTasks.has(task.id);
    const isAffiliate = hasAffiliateOptions(task);

    const getUrgencyStyles = () => {
      if (isCompleting) return "bg-primary";
      if (isOverdue) return "bg-destructive/8";
      if (isDueToday) return "bg-warning/8";
      if (isAffiliate) return "bg-primary/5";
      return "bg-secondary/30 hover:bg-secondary/50";
    };

    return (
      <SwipeableTaskItem
        onSwipeComplete={() => handleTaskToggle(task.id)}
        disabled={task.status === "done" || isCompleting}
      >
        <div 
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer animate-fade-in ${getUrgencyStyles()}`}
          style={{ 
            animationDelay: `${index * 50}ms`, 
            animationFillMode: 'backwards',
          }}
          onClick={() => !isCompleting && handleTaskClick(task)}
        >
          {/* Checkbox */}
          <button 
            className="shrink-0 w-5 h-5 flex items-center justify-center"
            onClick={(e) => !isCompleting && handleCheckboxClick(e, task)}
          >
            {isCompleting ? (
              <CheckCircle2 className="w-5 h-5 text-primary-foreground animate-scale-in" />
            ) : (
              <Circle className={`w-5 h-5 transition-colors ${
                isOverdue ? "text-destructive" : isDueToday ? "text-warning" : "text-muted-foreground/40 hover:text-primary/60"
              }`} />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${
              isCompleting ? "text-primary-foreground" : "text-foreground"
            }`}>
              {task.title}
            </span>
            {isOverdue && !isCompleting && (
              <span className="shrink-0 text-[9px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">!</span>
            )}
            {isDueToday && !isOverdue && !isCompleting && (
              <span className="shrink-0 text-[9px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded">Nu</span>
            )}
          </div>

          {/* Right side: Regelen button or deadline */}
          <div className="shrink-0 flex items-center">
            {isAffiliate && !isCompleting ? (
              <button
                className="flex items-center gap-0.5 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                onClick={(e) => handleRegelenClick(e, task)}
              >
                Regelen
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className={`text-[10px] flex items-center gap-1 ${
                isCompleting ? "text-primary-foreground/80" : isOverdue ? "text-destructive/70" : isDueToday ? "text-warning/70" : "text-muted-foreground"
              }`}>
                <Clock className="w-3 h-3" />
                {task.deadlineLabel}
              </span>
            )}
          </div>
        </div>
      </SwipeableTaskItem>
    );
  };

  return (
    <main 
      id="main-content" 
      tabIndex={-1}
      className="h-[100dvh] flex flex-col overflow-hidden bg-gradient-to-br from-primary-light via-primary-light/80 to-white focus:outline-none"
      aria-label="Dashboard"
    >
      <ConfettiCelebration trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header - Compact */}
      <header className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between">
        <LuaLogo size="sm" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddTask(true)}
          className="h-8 px-3 rounded-full bg-primary-light text-primary hover:bg-primary-muted text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Taak
        </Button>
      </header>

      {/* Main Content - Fixed height, no scroll */}
      <div className="flex-1 flex flex-col px-4 pb-2 overflow-hidden">
        {/* Moving Date Card - Compact */}
        <div className="shrink-0 mb-4">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg shadow-primary/10">
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Date Display - Compact */}
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-md">
                  <span className="text-[9px] uppercase tracking-wide opacity-80">{dayOfWeek}</span>
                  <span className="text-xl font-bold leading-none">{dayNumber}</span>
                  <span className="text-[9px] opacity-80">{monthName}</span>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Verhuizing over</p>
                  <p className="text-lg font-semibold text-foreground">{daysUntilMove} dagen</p>
                </div>

                {/* Progress Ring - Compact & Interactive */}
                <button
                  onClick={() => onNavigate("tasks")}
                  className="relative w-12 h-12 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  aria-label="Bekijk alle taken"
                >
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      className="stroke-primary"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">{Math.round(progressPercentage)}%</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-foreground">Dit pak je als eerste aan</h2>
            <span className="text-xs text-muted-foreground">{completedTasks}/{totalTasks} klaar</span>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm">
              <div className="animate-pulse text-muted-foreground text-sm">Laden...</div>
            </div>
          ) : openTasks.length > 0 ? (
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm p-2.5 overflow-hidden">
              <div className="flex-1 space-y-1 overflow-hidden">
                {displayTasks.map((task, index) => (
                  <CompactTaskItem key={task.id} task={task} index={index} />
                ))}
              </div>
              
              {/* Always visible: View all tasks button */}
              {openTasks.length > MAX_TASKS_ON_HOME && (
                <Button
                  variant="ghost"
                  className="shrink-0 w-full h-9 mt-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl"
                  onClick={() => onNavigate("tasks")}
                >
                  Bekijk alle {openTasks.length} taken
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-md shadow-primary/5 p-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-foreground">Alles is afgevinkt!</h3>
              <p className="text-xs text-muted-foreground text-center">
                Goed bezig. Voeg nieuwe taken toe als dat nodig is.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentView="dashboard" onNavigate={onNavigate} />

      {/* Dialogs */}
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
      <BudgetDialog
        open={activeDialog === "budget"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        currentBudget={(movingInfo as any).movingBudget}
        onComplete={(budget) => {
          handleDialogComplete({ movingBudget: budget } as any);
          closeActiveDialog();
        }}
      />
    </main>
  );
};
