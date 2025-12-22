import { useState, useMemo, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MovingInfo } from "@/pages/Index";
import { Task } from "@/lib/taskGenerator";
import { useTasks } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { useMilestones } from "@/hooks/useMilestones";
import { useQuestionDialogs } from "@/hooks/useQuestionDialogs";
import { isEnergyTask, isMovingTask } from "@/lib/taskTypeHelpers";
import { sortTasksSmart } from "@/lib/taskSorting";
import { LuaLogo } from "@/components/LuaLogo";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { ShareMovingDialog } from "@/components/ShareMovingDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { TaskDealDialog } from "@/components/TaskDealDialog";
import { ContextualPromptDialog } from "@/components/ContextualPromptDialog";
import { SmartQuestionDialog } from "@/components/SmartQuestionDialog";
import { EnergyQuestionsDialog } from "@/components/EnergyQuestionsDialog";
import { InternetQuestionsDialog } from "@/components/InternetQuestionsDialog";
import { MovingQuestionsDialog } from "@/components/MovingQuestionsDialog";
import { BoxesQuestionsDialog } from "@/components/BoxesQuestionsDialog";
import { InsuranceQuestionsDialog } from "@/components/InsuranceQuestionsDialog";
import { LiabilityQuestionsDialog } from "@/components/LiabilityQuestionsDialog";
import { ForwardingQuestionsDialog } from "@/components/ForwardingQuestionsDialog";
import { PostNLPreparationDialog } from "@/components/PostNLPreparationDialog";
import { ParkingQuestionsDialog } from "@/components/ParkingQuestionsDialog";
import { CleaningQuestionsDialog } from "@/components/CleaningQuestionsDialog";
import { SmokeDetectorQuestionsDialog } from "@/components/SmokeDetectorQuestionsDialog";
import { GardenQuestionsDialog } from "@/components/GardenQuestionsDialog";
import { RenovationQuestionsDialog } from "@/components/RenovationQuestionsDialog";
import { InvitePartnerDialog } from "@/components/InvitePartnerDialog";
import { BottomNav } from "@/components/BottomNav";
import { TaskListItem } from "@/components/TaskListItem";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { DocumentUploadSheet } from "@/components/DocumentUploadSheet";
import { TaskListSkeleton } from "@/components/ui/skeletons";
import { useNavigate } from "react-router-dom";
import { shouldShowTask } from "@/lib/smartQuestions";
import {
  Filter,
  Share2,
  User,
  Search,
  ArrowRight,
} from "lucide-react";

type TaskListProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onTaskComplete?: (completedCount: number, totalTasks: number) => void;
  onUpdateMovingInfo?: (data: Partial<MovingInfo>) => void;
  isGuest?: boolean;
  showAccountBadge?: boolean;
  onAccountBadgeClick?: () => void;
  onSignupClick?: () => void;
};

export const TaskList = ({ 
  movingInfo, 
  onNavigate, 
  onTaskComplete, 
  onUpdateMovingInfo, 
  isGuest,
  showAccountBadge,
  onAccountBadgeClick,
  onSignupClick
}: TaskListProps) => {
  const [filter, setFilter] = useState<"open" | "done">("open");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dealTask, setDealTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [taskPartnerInviteShown, setTaskPartnerInviteShown] = useState(() =>
    sessionStorage.getItem("lua_task_partner_invite_shown") === "true"
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevOpenTasksCount, setPrevOpenTasksCount] = useState<number | null>(null);
  const [documentTask, setDocumentTask] = useState<Task | null>(null);

  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use the question dialogs hook
  const {
    activeDialog,
    setActiveDialog,
    smartQuestion,
    setSmartQuestion,
    contextualPrompt,
    setContextualPrompt,
    handleRegelenClick,
    handleDialogComplete,
    handleDialogRedirect,
    handleSmartQuestionComplete,
    handleContextualPromptComplete,
  } = useQuestionDialogs(movingInfo, onUpdateMovingInfo, isGuest);

  // Milestone celebrations
  const completedTasksCount = tasks.filter(t => t.status === "done").length;
  const openTasksCount = tasks.filter(t => t.status !== "done").length;
  useMilestones(completedTasksCount, tasks.length);

  // Calculate days until move
  const daysUntilMove = useMemo(() => {
    if (!movingInfo.movingDate) return 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const moveDate = new Date(movingInfo.movingDate);
    moveDate.setHours(0, 0, 0, 0);
    return Math.ceil((moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [movingInfo.movingDate]);

  // Detect when all tasks become completed
  useEffect(() => {
    if (prevOpenTasksCount !== null && prevOpenTasksCount > 0 && openTasksCount === 0 && tasks.length > 0) {
      setShowConfetti(true);
    }
    setPrevOpenTasksCount(openTasksCount);
  }, [openTasksCount, tasks.length, prevOpenTasksCount]);

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

    // Check if we should show partner invite after completing energy or moving tasks
    if (wasNotDone && task && !taskPartnerInviteShown && !isGuest) {
      const isRelevantTask = isEnergyTask(task) || isMovingTask(task);
      if (isRelevantTask) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("household_type")
            .eq("user_id", user.id)
            .single();
          
          if (profile?.household_type === "single") return;

          const { data: collaborators } = await supabase
            .from("moving_collaborators")
            .select("id")
            .or(`owner_user_id.eq.${user.id},collaborator_user_id.eq.${user.id}`)
            .limit(1);
          
          if (!collaborators || collaborators.length === 0) {
            setTimeout(() => {
              setActiveDialog("partnerInvite");
              setTaskPartnerInviteShown(true);
              sessionStorage.setItem("lua_task_partner_invite_shown", "true");
            }, 800);
          }
        }
      }
    }
  };

  // Calculate categories
  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return Array.from(cats);
  }, [tasks]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!shouldShowTask(task.id, task.title, movingInfo)) return false;
      
      const statusMatch = filter === "done" ? task.status === "done" : task.status !== "done";
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(task.category);
      const searchMatch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && categoryMatch && searchMatch;
    });
  }, [tasks, filter, selectedCategories, searchQuery, movingInfo]);

  // Group tasks by phase and sort by urgency
  const tasksByPhase = useMemo(() => {
    const phaseOrder = [
      "Fase 1 - Je nieuwe thuis is bevestigd",
      "Fase 2 - De voorbereidingen beginnen",
      "Fase 3 - Sleutels in handen",
      "Fase 4 - De laatste voorbereidingen",
      "Fase 5 - Afscheid van je oude plek",
      "Fase 6 - De grote dag",
      "Fase 7 - Thuis in je nieuwe woning",
      "Eigen taken"
    ];
    
    const phases: { [key: string]: Task[] } = {};
    filteredTasks.forEach((task) => {
      if (!phases[task.phase]) phases[task.phase] = [];
      phases[task.phase].push(task);
    });
    
    // Sort tasks within each phase by urgency/deadline
    const sortedPhases: { [key: string]: Task[] } = {};
    phaseOrder.forEach(phase => {
      if (phases[phase]) {
        sortedPhases[phase] = sortTasksSmart(phases[phase]);
      }
    });
    Object.keys(phases).forEach(phase => {
      if (!sortedPhases[phase]) {
        sortedPhases[phase] = sortTasksSmart(phases[phase]);
      }
    });
    
    return sortedPhases;
  }, [filteredTasks]);

  const getCountdownText = () => {
    if (!movingInfo.movingDate) return null;
    if (daysUntilMove === 0) return "Vandaag is de grote dag!";
    if (daysUntilMove === 1) return "Nog 1 dag tot je verhuizing";
    if (daysUntilMove < 0) return `${Math.abs(daysUntilMove)} dagen geleden verhuisd`;
    return `Nog ${daysUntilMove} dagen tot je verhuizing`;
  };

  return (
    <main 
      id="main-content" 
      tabIndex={-1}
      className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white focus:outline-none"
      aria-label="Takenlijst"
    >
      <ConfettiCelebration trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header with Logo */}
      <div className="px-4 pt-4 pb-2">
        <LuaLogo size="md" />
      </div>
      
      {/* Compact Header with Search */}
      <div className="px-3 sm:px-4 pb-3 sticky top-0 bg-gradient-to-br from-primary-light/95 via-primary-light/80 to-white/95 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="flex items-center gap-3">
          {/* Filter button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-background z-50 rounded-2xl" align="start">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-3">Status</h3>
                  <RadioGroup value={filter} onValueChange={(val: "open" | "done") => setFilter(val)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="open" id="open" />
                      <Label htmlFor="open" className="text-sm cursor-pointer">
                        Open ({tasks.filter((t) => t.status !== "done").length})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="done" id="done" />
                      <Label htmlFor="done" className="text-sm cursor-pointer">
                        Voltooid ({tasks.filter((t) => t.status === "done").length})
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3">Categorieën</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <div 
                        key={cat} 
                        className={`flex items-center space-x-2 p-2 rounded-xl cursor-pointer transition-colors ${
                          selectedCategories.includes(cat) ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => toggleCategory(cat)}
                      >
                        <Label htmlFor={cat} className="text-sm cursor-pointer flex-1">{cat}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek taken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl border-0 bg-secondary/50"
            />
          </div>

          {/* Action buttons */}
          <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)} className="h-10 w-10 rounded-xl">
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Account reminder badge */}
        {showAccountBadge && (
          <button
            onClick={onAccountBadgeClick}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
          >
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Sla je voortgang op met een gratis account</span>
            <ArrowRight className="w-4 h-4 text-primary ml-auto" />
          </button>
        )}
        
        {/* Mini progress indicator */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{tasks.filter(t => t.status === "done").length} van {tasks.length} voltooid</span>
          <span>{daysUntilMove > 0 ? `${daysUntilMove} dagen tot verhuizing` : getCountdownText()}</span>
        </div>
      </div>

      {/* Tasks with Pull to Refresh */}
      <PullToRefresh onRefresh={refreshTasks} className="px-3 sm:px-4 py-3">
        {isLoading ? (
          <TaskListSkeleton count={8} />
        ) : Object.entries(tasksByPhase).length === 0 ? (
          <div className="p-8 text-center text-muted-foreground rounded-3xl bg-white shadow-lg shadow-primary/10">
            Geen taken gevonden. Probeer een andere zoekopdracht!
          </div>
        ) : (
          <div className="space-y-4 p-4 rounded-3xl bg-white shadow-lg shadow-primary/10">
            {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="text-sm font-medium text-foreground">{phase}</span>
                  <span className="text-xs text-muted-foreground">({phaseTasks.length})</span>
                </div>

                <div className="space-y-2">
                  {phaseTasks.map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      isCompleting={completingTasks.has(task.id)}
                      onTaskClick={handleTaskClick}
                      onCheckboxClick={handleCheckboxClick}
                      onRegelenClick={handleRegelenClick}
                      onDocumentClick={(e, task) => {
                        e.stopPropagation();
                        setDocumentTask(task);
                      }}
                      onSwipeComplete={handleTaskToggle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PullToRefresh>

      {/* Dialogs */}
      <AddTaskDialog 
        open={showAddTask} 
        onOpenChange={setShowAddTask}
        onTaskAdded={refreshTasks}
        onSignupClick={onSignupClick}
      />
      <ShareMovingDialog open={showShareDialog} onOpenChange={setShowShareDialog} />
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onTaskUpdate={refreshTasks}
        onToggleStatus={handleTaskToggle}
      />
      <TaskDealDialog task={dealTask} open={!!dealTask} onOpenChange={(open) => !open && setDealTask(null)} />
      
      <ContextualPromptDialog
        open={!!contextualPrompt}
        onOpenChange={(open) => !open && setContextualPrompt(null)}
        promptType={contextualPrompt?.type || "oldAddress"}
        taskTitle={contextualPrompt?.task.title}
        onComplete={handleContextualPromptComplete}
      />

      <SmartQuestionDialog
        open={!!smartQuestion}
        onOpenChange={(open) => !open && setSmartQuestion(null)}
        questionType={smartQuestion?.type || null}
        taskTitle={smartQuestion?.task.title}
        onComplete={handleSmartQuestionComplete}
      />

      <EnergyQuestionsDialog
        open={activeDialog === "energy"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("energy")}
      />

      <InternetQuestionsDialog
        open={activeDialog === "internet"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("internet")}
      />

      <MovingQuestionsDialog
        open={activeDialog === "moving"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("moving")}
      />

      <BoxesQuestionsDialog
        open={activeDialog === "boxes"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("boxes")}
      />

      <InsuranceQuestionsDialog
        open={activeDialog === "insurance"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("insurance")}
      />

      <LiabilityQuestionsDialog
        open={activeDialog === "liability"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("liability")}
      />

      <ForwardingQuestionsDialog
        open={activeDialog === "forwarding"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onComplete={(data) => handleDialogComplete(data)}
        onRedirect={() => handleDialogRedirect("forwarding")}
        existingData={{
          forwardingStartDate: movingInfo.forwardingStartDate,
          forwardingDuration: movingInfo.forwardingDuration,
          householdNames: movingInfo.householdNames
        }}
      />

      <PostNLPreparationDialog
        open={activeDialog === "postNLPreparation"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={{
          oldAddress: movingInfo.oldAddress,
          newAddress: movingInfo.newAddress,
          movingDate: movingInfo.movingDate ? new Date(movingInfo.movingDate) : undefined,
        }}
        onUpdateMovingInfo={onUpdateMovingInfo ? (data) => {
          const updateData: Partial<MovingInfo> = {};
          if (data.oldAddress) updateData.oldAddress = data.oldAddress;
          if (data.newAddress) updateData.newAddress = data.newAddress;
          if (data.movingDate) updateData.movingDate = data.movingDate.toISOString();
          onUpdateMovingInfo(updateData);
        } : undefined}
      />

      <ParkingQuestionsDialog
        open={activeDialog === "parking"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("parking")}
      />

      <CleaningQuestionsDialog
        open={activeDialog === "cleaning"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("cleaning")}
      />

      <SmokeDetectorQuestionsDialog
        open={activeDialog === "smokeDetector"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("smokeDetector")}
      />

      <GardenQuestionsDialog
        open={activeDialog === "garden"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        movingInfo={movingInfo}
        onComplete={handleDialogComplete}
        onRedirect={() => handleDialogRedirect("garden")}
      />

      <RenovationQuestionsDialog
        open={activeDialog === "renovation"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onComplete={(data) => {
          if (onUpdateMovingInfo) {
            onUpdateMovingInfo({
              renovationBudget: data.renovationBudget,
              renovationStartDate: data.renovationStartDate?.toISOString().split('T')[0],
            } as Partial<MovingInfo>);
          }
        }}
        onRedirect={() => handleDialogRedirect("renovation")}
        existingData={{
          renovationBudget: (movingInfo as any).renovationBudget,
          renovationStartDate: (movingInfo as any).renovationStartDate ? new Date((movingInfo as any).renovationStartDate) : undefined,
        }}
      />

      <InvitePartnerDialog
        open={activeDialog === "partnerInvite"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onInviteSent={() => setActiveDialog(null)}
      />

      <DocumentUploadSheet
        open={!!documentTask}
        onOpenChange={(open) => !open && setDocumentTask(null)}
        task={documentTask}
      />

      <BottomNav currentView="tasks" onNavigate={onNavigate} />
    </main>
  );
};
