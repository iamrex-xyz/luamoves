import { useState, useMemo } from "react";
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
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { ShareMovingDialog } from "@/components/ShareMovingDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { TaskDealDialog } from "@/components/TaskDealDialog";
import { BottomNav } from "@/components/BottomNav";
import {
  ArrowLeft,
  ExternalLink,
  Filter,
  Clock,
  Loader2,
  LogOut,
  Plus,
  Share2,
  User,
  FileText,
  Search,
  Package,
  PackageOpen,
} from "lucide-react";

type TaskListProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
  onLogout: () => void;
};

export const TaskList = ({ movingInfo, onNavigate, onLogout }: TaskListProps) => {
  const [filter, setFilter] = useState<"open" | "done">("open");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dealTask, setDealTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());

  // Gebruik de custom hook voor task management
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);

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

  // Filter taken
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
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
  }, [tasks, filter, selectedCategories, searchQuery]);

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
    if (task.status === "done") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 min-w-[75px] justify-center text-xs">Voltooid</Badge>;
    }
    if (task.status === "in_progress") {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 min-w-[75px] justify-center text-xs">Bezig</Badge>;
    }
    return null;
  };

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Unified Header */}
      <header className="bg-primary text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Taken</h1>
                <p className="text-white/80 text-xs">Jouw verhuischecklist</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)} className="text-white hover:bg-white/10 h-10 w-10">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onLogout} className="text-white hover:bg-white/10 h-10 w-10">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar met Filter */}
      <div className="max-w-4xl mx-auto px-4 py-3 sticky top-[73px] bg-background/95 backdrop-blur-lg z-10 border-b">
        <div className="flex items-center gap-2">
          {/* Filter knop */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-background z-50" align="start">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-3">Status</h3>
                  <RadioGroup value={filter} onValueChange={(val: "open" | "done") => setFilter(val)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="open" id="open" />
                      <Label htmlFor="open" className="text-sm cursor-pointer">
                        Open taken ({tasks.filter((t) => t.status !== "done").length})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="done" id="done" />
                      <Label htmlFor="done" className="text-sm cursor-pointer">
                        Afgeronde taken ({tasks.filter((t) => t.status === "done").length})
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3">Categorieën</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div 
                        key={cat} 
                        className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
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
              placeholder="Zoek taken op titel, beschrijving of categorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
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
                <div className="mb-3 sticky top-[134px] md:top-[144px] bg-background/95 backdrop-blur py-2 z-[5]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {phase}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {phaseTasks.length} {phaseTasks.length === 1 ? "taak" : "taken"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
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
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ${
                          isCompleting 
                            ? "bg-primary/20 border-primary/40 scale-95 -translate-y-2" 
                            : isTaskOverdue 
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
                            <PackageOpen className="h-[16px] w-[16px] text-primary animate-scale-in" />
                          ) : task.status === "done" ? (
                            <PackageOpen className="h-[16px] w-[16px] text-primary animate-scale-in" />
                          ) : (
                            <Package className="h-[16px] w-[16px] text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-1">
                                <h4 
                                  className={`font-medium text-sm md:text-base ${!isCompleting && "cursor-pointer hover:text-primary"} transition-colors ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                                  onClick={(e) => {
                                    if (!isCompleting) {
                                      e.stopPropagation();
                                      setSelectedTask(task);
                                    }
                                  }}
                                >
                                  {task.title}
                                </h4>
                                {task.notes && (
                                  <div title="Heeft notitie">
                                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                                  </div>
                                )}
                              </div>
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
                                {isTaskOverdue && " (verlopen)"}
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
                                  setDealTask(task);
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
                                setDealTask(task);
                              }}
                            >
                              Direct regelen
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
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
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onTaskUpdate={refreshTasks}
      />
      <TaskDealDialog
        task={dealTask}
        open={!!dealTask}
        onOpenChange={(open) => !open && setDealTask(null)}
      />

      <BottomNav currentView="tasks" onNavigate={onNavigate} />
    </div>
  );
};
