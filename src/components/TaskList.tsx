import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

  // Gebruik de custom hook voor task management
  const { tasks, isLoading, toggleTaskStatus, refreshTasks } = useTasks(movingInfo);

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

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 py-3 sticky top-[120px] md:top-[130px] bg-background/95 backdrop-blur-lg z-10 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek taken op titel, beschrijving of categorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Compact Filters */}
      <div className="max-w-4xl mx-auto px-4 py-2.5 sticky top-[190px] md:top-[200px] bg-background/95 backdrop-blur-lg z-10 border-b shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          
          {/* Status filters */}
          <Button
            variant={filter === "open" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("open")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Open ({tasks.filter((t) => t.status !== "done").length})
          </Button>
          <Button
            variant={filter === "done" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("done")}
            className="min-h-[32px] whitespace-nowrap text-xs px-2.5 py-1"
          >
            Afgerond ({tasks.filter((t) => t.status === "done").length})
          </Button>
        </div>
        
        {/* Category filters - Multi-select checkboxes */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-2">
          <span className="text-xs text-muted-foreground shrink-0">Categorieën:</span>
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-1.5 cursor-pointer bg-secondary hover:bg-secondary/80 rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-colors"
            >
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
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
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                          isTaskOverdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
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
                              <div className="flex items-center gap-2 flex-1">
                                <h4 className={`font-medium text-xs md:text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
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
                          </div>
                          
                          {task.affiliateLink && task.status !== "done" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 h-6 text-xs bg-accent text-accent-foreground hover:bg-accent/90 border-0 shrink-0"
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
