import { Button } from "@/components/ui/button";
import { MovingInfo } from "@/pages/Index";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/taskGenerator";
import { sortTasksSmart } from "@/lib/taskSorting";
import { BottomNav } from "@/components/BottomNav";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { LuaLogo } from "@/components/LuaLogo";
import { TaskListSkeleton } from "@/components/ui/skeletons";
import { TaskListItem } from "@/components/TaskListItem";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { InviteHouseholdDialog } from "@/components/InviteHouseholdDialog";
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
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onTaskComplete?: (completedCount: number, totalTasks: number) => void;
  onSignupClick?: () => void;
};

export const Dashboard = ({ movingInfo, onNavigate, onTaskComplete, onSignupClick }: DashboardProps) => {
  const { tasks, isLoading, toggleTaskStatus, updateTaskAssignment, refreshTasks } = useTasks(movingInfo);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevOpenTasksCount, setPrevOpenTasksCount] = useState<number | null>(null);
  // Removed scroll-based search hiding - Home is now static

  // Question dialogs for affiliate tasks
  const {
    activeDialog,
    handleRegelenClick,
    handleDialogComplete,
    handleDialogRedirect,
    closeActiveDialog,
    handleCompleteCurrentTask,
  } = useQuestionDialogs(movingInfo, undefined, undefined, toggleTaskStatus);

  // Filter en sorteer taken voor de homepage
  const openTasks = useMemo(() => {
    const open = tasks.filter(t => t.status !== "done");
    return sortTasksSmart(open);
  }, [tasks]);

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

  // Handler for document click (opens document upload sheet)
  const handleDocumentClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    // Document click handler - can be extended if needed
    handleTaskClick(task);
  };

  return (
    <main 
      id="main-content" 
      tabIndex={-1}
      className="h-screen overflow-hidden pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white focus:outline-none"
      aria-label="Dashboard"
    >
      <ConfettiCelebration trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <LuaLogo size="md" />
      </div>

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
              <button 
                onClick={() => onNavigate("tasks")}
                className="relative w-16 h-16 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                aria-label={`${Math.round(progressPercentage)}% voltooid - Bekijk alle taken`}
              >
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
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Jouw taken</h2>
            <p className="text-xs text-muted-foreground">Dit pak je als eerste aan</p>
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
          <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 max-h-[calc(100vh-340px)] overflow-y-auto">
            <div className="space-y-2 p-4">
              {displayTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  isCompleting={completingTasks.has(task.id)}
                  onTaskClick={handleTaskClick}
                  onCheckboxClick={handleCheckboxClick}
                  onRegelenClick={handleRegelenClick}
                  onDocumentClick={handleDocumentClick}
                  onSwipeComplete={handleTaskToggle}
                />
              ))}
              {openTasks.length > 5 && (
                <Button
                  variant="ghost"
                  className="w-full h-12 text-sm text-muted-foreground hover:text-foreground sticky bottom-0 bg-white"
                  onClick={() => onNavigate("tasks")}
                >
                  Bekijk alle {openTasks.length} taken
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-white shadow-lg shadow-primary/10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">Lekker bezig! Alles is afgevinkt 🎉</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Heb je nog iets te doen? Voeg het hieronder toe.
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
        onTaskAssignment={updateTaskAssignment}
        onToggleStatus={handleTaskToggle}
      />

      <InviteHouseholdDialog
        open={activeDialog === "inviteHousehold"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        onInvitesSent={refreshTasks}
        onRequestLogin={onSignupClick}
        onCompleteTask={handleCompleteCurrentTask}
      />
      <EnergyQuestionsDialog
        open={activeDialog === "energy"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("energy")}
        onCompleteTask={handleCompleteCurrentTask}
      />
      <InternetQuestionsDialog
        open={activeDialog === "internet"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("internet")}
        onCompleteTask={handleCompleteCurrentTask}
      />
      <MovingQuestionsDialog
        open={activeDialog === "moving"}
        onOpenChange={(open) => !open && closeActiveDialog()}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("moving")}
        onCompleteTask={handleCompleteCurrentTask}
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
        onCompleteTask={handleCompleteCurrentTask}
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
        onCompleteTask={handleCompleteCurrentTask}
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

      <BottomNav currentView="dashboard" onNavigate={onNavigate} />
    </main>
  );
};
