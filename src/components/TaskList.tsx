import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MovingInfo } from "@/pages/Index";
import { Task } from "@/lib/taskGenerator";
import { useTasks } from "@/hooks/useTasks";
import { useMilestones } from "@/hooks/useMilestones";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { ShareMovingDialog } from "@/components/ShareMovingDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { TaskDealDialog } from "@/components/TaskDealDialog";
import { ContextualPromptDialog, getRequiredPromptForTask, PromptType } from "@/components/ContextualPromptDialog";
import { SmartQuestionDialog } from "@/components/SmartQuestionDialog";
import { InvitePartnerDialog } from "@/components/InvitePartnerDialog";
import { InAppReminderBanner } from "@/components/InAppReminderBanner";
import { ProgressBanner } from "@/components/ProgressBanner";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { getSmartQuestionForTask, shouldShowTask, SmartQuestionType } from "@/lib/smartQuestions";
import {
  ExternalLink,
  Filter,
  Clock,
  Loader2,
  LogOut,
  Share2,
  User,
  FileText,
  Search,
  Circle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type TaskListProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onLogout: () => void;
  onTaskComplete?: (completedCount: number) => void;
  onUpdateMovingInfo?: (data: Partial<MovingInfo>) => void;
  isGuest?: boolean;
  showAccountBadge?: boolean;
  onAccountBadgeClick?: () => void;
  onSignupClick?: () => void;
};

export const TaskList = ({ 
  movingInfo, 
  onNavigate, 
  onLogout, 
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
  const [contextualPrompt, setContextualPrompt] = useState<{ type: PromptType; task: Task } | null>(null);
  const [smartQuestion, setSmartQuestion] = useState<{ type: SmartQuestionType; task: Task; afterQuestions?: 'deal' | 'complete' } | null>(null);
  const [showPartnerInvite, setShowPartnerInvite] = useState(false);
  const [partnerInviteShown, setPartnerInviteShown] = useState(() => 
    sessionStorage.getItem("lua_partner_invite_shown") === "true"
  );

  // Gebruik de custom hook voor task management
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);
  const navigate = useNavigate();

  // Milestone celebrations
  const completedTasksCount = tasks.filter(t => t.status === "done").length;
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

  const handleTaskClick = (task: Task) => {
    // Open the task detail dialog instead of toggling status
    setSelectedTask(task);
  };

  const handleCheckboxClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    // Checkbox alleen voor afvinken, geen smart questions hier
    handleTaskToggle(task.id);
  };

  // Regelen knop: eerst smart questions, daarna deals
  const handleRegelenClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    
    // Check of er nog smart questions nodig zijn
    if (!isGuest) {
      const smartQuestionType = getSmartQuestionForTask(task.id, task.title, movingInfo);
      if (smartQuestionType) {
        // Na beantwoording → toon deals
        setSmartQuestion({ type: smartQuestionType, task, afterQuestions: 'deal' });
        return;
      }
    }
    
    // Geen vragen nodig → direct naar deals
    navigate(`/deals?task=${encodeURIComponent(task.title)}`);
  };

  const handleContextualPromptComplete = (data: Partial<MovingInfo>) => {
    if (onUpdateMovingInfo) {
      onUpdateMovingInfo(data);
    }
    setContextualPrompt(null);
  };

  const handleSmartQuestionComplete = (data: Partial<MovingInfo> & Record<string, any>) => {
    if (onUpdateMovingInfo) {
      onUpdateMovingInfo(data as Partial<MovingInfo>);
    }
    
    const currentTask = smartQuestion?.task;
    const afterAction = smartQuestion?.afterQuestions;
    setSmartQuestion(null);
    
    if (currentTask) {
      // Check of er nog meer vragen zijn voor deze taak
      const nextQuestion = getSmartQuestionForTask(currentTask.id, currentTask.title, { ...movingInfo, ...data });
      
      if (nextQuestion) {
        // Nog een vraag nodig
        setSmartQuestion({ type: nextQuestion, task: currentTask, afterQuestions: afterAction });
        return;
      }
      
      // Alle vragen beantwoord
      if (afterAction === 'deal') {
        // Navigeer naar deals pagina
        navigate(`/deals?task=${encodeURIComponent(currentTask.title)}`);
      }
    }
    
    // Show partner invite after first few tasks if not shown yet
    const completedCount = tasks.filter(t => t.status === "done").length;
    if (completedCount >= 3 && !partnerInviteShown && !isGuest) {
      const hasPartner = (data as any).currentSituation === "partner" || 
                         (data as any).currentSituation === "family" ||
                         (data as any).currentSituation === "roommates";
      if (hasPartner) {
        setShowPartnerInvite(true);
        setPartnerInviteShown(true);
        sessionStorage.setItem("lua_partner_invite_shown", "true");
      }
    }
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
      // Calculate new completed count (current + 1 since we just completed one)
      const newCompletedCount = tasks.filter(t => t.status === "done").length + 1;
      onTaskComplete(newCompletedCount);
    }
  };

  // Bereken categorieën
  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return Array.from(cats);
  }, [tasks]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filter taken - inclusief dynamische filtering op basis van profiel
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Dynamische filtering op basis van profiel data
      if (!shouldShowTask(task.id, task.title, movingInfo)) {
        return false;
      }
      
      // Filter logica voor Open en Afgerond
      const statusMatch = 
        filter === "done"
          ? task.status === "done"
          : task.status !== "done"; // "open" toont todo + in_progress
      
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(task.category);
      
      // Zoek filter
      const searchMatch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && categoryMatch && searchMatch;
    });
  }, [tasks, filter, selectedCategories, searchQuery, movingInfo]);

  // Groepeer taken per fase met correcte volgorde
  const tasksByPhase = useMemo(() => {
    const phaseOrder = [
      "Direct regelen",
      "6-8 weken voor",
      "4-6 weken voor",
      "2-4 weken voor",
      "1-2 weken voor",
      "Laatste week",
      "Verhuisdag",
      "Na de verhuizing"
    ];
    
    const phases: { [key: string]: Task[] } = {};
    filteredTasks.forEach((task) => {
      if (!phases[task.phase]) {
        phases[task.phase] = [];
      }
      phases[task.phase].push(task);
    });
    
    // Sorteer de phases op volgorde
    const sortedPhases: { [key: string]: Task[] } = {};
    phaseOrder.forEach(phase => {
      if (phases[phase]) {
        sortedPhases[phase] = phases[phase];
      }
    });
    // Voeg eventuele onbekende phases toe aan het einde
    Object.keys(phases).forEach(phase => {
      if (!sortedPhases[phase]) {
        sortedPhases[phase] = phases[phase];
      }
    });
    
    return sortedPhases;
  }, [filteredTasks]);


  const getStatusBadge = (task: Task) => {
    if (task.status === "done") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 min-w-[75px] justify-center text-xs">Voltooid</Badge>;
    }
    if (task.status === "in_progress") {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 min-w-[75px] justify-center text-xs">Bezig</Badge>;
    }
    return null;
  };

  const getCountdownText = () => {
    if (!movingInfo.movingDate) return null;
    if (daysUntilMove === 0) return "Vandaag is de grote dag!";
    if (daysUntilMove === 1) return "Nog 1 dag tot je verhuizing";
    if (daysUntilMove < 0) return `${Math.abs(daysUntilMove)} dagen geleden verhuisd`;
    return `Nog ${daysUntilMove} dagen tot je verhuizing`;
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {/* Header with Logo */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
      </div>
      
      {/* Compact Header with Search */}
      <div className="px-4 pb-3 sticky top-0 bg-gradient-to-br from-primary-light/95 via-primary-light/80 to-white/95 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="flex items-center gap-3">
          {/* Filter knop */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl"
              >
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
                        <Label htmlFor={cat} className="text-sm cursor-pointer flex-1">
                          {cat}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Zoekbalk */}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShareDialog(true)}
            className="h-10 w-10 rounded-xl"
          >
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-10 w-10 rounded-xl"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Account reminder badge */}
        {showAccountBadge && (
          <button
            onClick={onAccountBadgeClick}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
          >
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Bewaar je voortgang met een account</span>
            <ArrowRight className="w-4 h-4 text-primary ml-auto" />
          </button>
        )}
        
        {/* Mini progress indicator */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{tasks.filter(t => t.status === "done").length} van {tasks.length} voltooid</span>
          <span>{daysUntilMove > 0 ? `${daysUntilMove} dagen tot verhuizing` : getCountdownText()}</span>
        </div>
      </div>

      {/* Tasks */}
      <div className="px-4 py-3">
        {isLoading ? (
          <div className="p-8 text-center rounded-3xl bg-white shadow-lg shadow-primary/10">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
          </div>
        ) : Object.entries(tasksByPhase).length === 0 ? (
          <div className="p-8 text-center text-muted-foreground rounded-3xl bg-white shadow-lg shadow-primary/10">
            Geen taken gevonden.
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

                <div className="space-y-1">
                  {phaseTasks.map((task) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const deadline = new Date(task.deadline);
                    deadline.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isTaskOverdue = deadline < today && task.status !== "done";
                    const isCompleting = completingTasks.has(task.id);

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          isCompleting 
                            ? "bg-primary/10 scale-95 opacity-0" 
                            : isTaskOverdue 
                              ? "bg-destructive/5 hover:bg-destructive/10" 
                              : "hover:bg-secondary/50"
                        } cursor-pointer`}
                        onClick={() => !isCompleting && handleTaskClick(task)}
                      >
                        <div 
                          className="shrink-0 cursor-pointer transition-transform duration-200 hover:scale-110"
                          onClick={(e) => !isCompleting && handleCheckboxClick(e, task)}
                        >
                          {isCompleting ? (
                            <CheckCircle2 className="h-5 w-5 text-primary animate-scale-in" />
                          ) : task.status === "done" ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.deadlineLabel}
                            {isTaskOverdue && <span className="text-destructive ml-1">(verlopen)</span>}
                          </p>
                        </div>
                        {task.affiliateLink && task.status !== "done" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0 h-8 px-3 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => handleRegelenClick(e, task)}
                          >
                            Regelen
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
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
        onSignupClick={onSignupClick}
      />
      <ShareMovingDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onTaskUpdate={refreshTasks}
        onToggleStatus={handleTaskToggle}
      />
      <TaskDealDialog
        task={dealTask}
        open={!!dealTask}
        onOpenChange={(open) => !open && setDealTask(null)}
      />
      
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

      <InvitePartnerDialog
        open={showPartnerInvite}
        onOpenChange={setShowPartnerInvite}
        onInviteSent={() => setShowPartnerInvite(false)}
      />

      <BottomNav currentView="tasks" onNavigate={onNavigate} />
    </div>
  );
};
