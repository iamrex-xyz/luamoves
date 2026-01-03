import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/taskGenerator";
import { SwipeableTaskItem } from "@/components/SwipeableTaskItem";
import { hasAffiliateOptions, getTaskButtonLabel } from "@/lib/taskTypeHelpers";
import { Clock, Circle, CheckCircle2, ChevronRight, AlertTriangle, FileText } from "lucide-react";

type TaskListItemProps = {
  task: Task;
  isCompleting: boolean;
  onTaskClick: (task: Task) => void;
  onCheckboxClick: (e: React.MouseEvent, task: Task) => void;
  onRegelenClick: (e: React.MouseEvent, task: Task) => void;
  onDocumentClick: (e: React.MouseEvent, task: Task) => void;
  onSwipeComplete: (taskId: string) => void;
};

export const TaskListItem = ({
  task,
  isCompleting,
  onTaskClick,
  onCheckboxClick,
  onRegelenClick,
  onDocumentClick,
  onSwipeComplete,
}: TaskListItemProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isTaskOverdue = deadline < today && task.status !== "done";
  const isDueToday = daysUntil === 0 && task.status !== "done";
  const isDueSoon = daysUntil === 1 && task.status !== "done";

  // Determine urgency level for styling
  const getUrgencyStyles = () => {
    if (isCompleting) return "bg-primary border-l-4 border-l-primary";
    if (task.status === "done") return "bg-secondary/30 border-l-4 border-l-transparent";
    if (isTaskOverdue) return "bg-destructive/8 border-l-4 border-l-destructive hover:bg-destructive/12";
    if (isDueToday) return "bg-warning/10 border-l-4 border-l-warning hover:bg-warning/15";
    if (isDueSoon) return "bg-primary/5 border-l-4 border-l-primary/50 hover:bg-primary/10";
    return "bg-secondary/50 border-l-4 border-l-transparent hover:bg-secondary";
  };

  const getUrgencyBadge = () => {
    if (task.status === "done" || isCompleting) return null;
    if (isTaskOverdue) {
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-medium">
          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
          Verlopen
        </Badge>
      );
    }
    if (isDueToday) {
      return (
        <Badge className="text-[10px] px-1.5 py-0 h-4 font-medium bg-warning text-warning-foreground">
          Vandaag
        </Badge>
      );
    }
    if (isDueSoon) {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium text-primary">
          Morgen
        </Badge>
      );
    }
    return null;
  };

  return (
    <SwipeableTaskItem
      onSwipeComplete={() => onSwipeComplete(task.id)}
      disabled={task.status === "done" || isCompleting}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`${task.title}${task.status === "done" ? ", voltooid" : isTaskOverdue ? ", verlopen" : isDueToday ? ", vandaag" : ""}`}
        className={`group relative px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${getUrgencyStyles()}`}
        onClick={() => !isCompleting && onTaskClick(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !isCompleting && onTaskClick(task);
          }
        }}
      >
        <div className="flex items-start gap-2">
          {/* Checkbox - fixed width */}
          <button 
            type="button"
            aria-label={task.status === "done" ? `Markeer "${task.title}" als niet voltooid` : `Markeer "${task.title}" als voltooid`}
            className="shrink-0 mt-0.5 cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-full"
            onClick={(e) => !isCompleting && onCheckboxClick(e, task)}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <CheckCircle2 className="h-5 w-5 text-primary-foreground animate-scale-in" aria-hidden="true" />
            ) : task.status === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            ) : (
              <Circle className={`h-5 w-5 transition-colors ${
                isTaskOverdue 
                  ? "text-destructive/60 group-hover:text-destructive" 
                  : isDueToday 
                    ? "text-warning/60 group-hover:text-warning"
                    : "text-muted-foreground/50 group-hover:text-primary/50"
              }`} aria-hidden="true" />
            )}
          </button>
          
          {/* Content area - two column grid */}
          <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-2">
            {/* Left column: title + timing (fixed position) */}
            <div className="min-w-0">
              <div className="flex items-start gap-2">
                <h4 className={`font-medium text-sm leading-snug transition-all duration-200 ${
                  isCompleting 
                    ? "line-through text-primary-foreground" 
                    : task.status === "done" 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground"
                }`}>
                  {task.title}
                </h4>
                {getUrgencyBadge()}
              </div>
              <span className={`flex items-center gap-1 text-xs mt-0.5 transition-colors duration-200 ${
                isCompleting 
                  ? "text-primary-foreground/80" 
                  : isTaskOverdue 
                    ? "text-destructive/80"
                    : isDueToday
                      ? "text-warning/80"
                      : "text-muted-foreground"
              }`}>
                <Clock className="w-3 h-3 shrink-0" />
                {task.deadlineLabel}
              </span>
            </div>
            
            {/* Right column: actions (optional, does not affect left column) */}
            <div className="flex items-center gap-1 self-center">
              {task.status !== "done" && !isCompleting && task.hasDocumentLink && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 px-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary font-medium"
                  onClick={(e) => onDocumentClick(e, task)}
                >
                  <FileText className="w-3 h-3 mr-0.5" />
                  Docs
                </Button>
              )}
              {task.status !== "done" && !isCompleting && hasAffiliateOptions(task) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 px-1.5 text-[11px] text-primary hover:text-primary/80 hover:bg-primary/5 font-medium"
                  onClick={(e) => onRegelenClick(e, task)}
                >
                  {getTaskButtonLabel(task) || "Regelen"}
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SwipeableTaskItem>
  );
};
