import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/taskGenerator";
import { SwipeableTaskItem } from "@/components/SwipeableTaskItem";
import { hasAffiliateOptions, getTaskButtonLabel } from "@/lib/taskTypeHelpers";
import { Clock, Circle, CheckCircle2, ChevronRight, AlertTriangle, FileText, UserCircle } from "lucide-react";

type TaskListItemProps = {
  task: Task;
  isCompleting: boolean;
  isNewAssignment?: boolean;
  onTaskClick: (task: Task) => void;
  onCheckboxClick: (e: React.MouseEvent, task: Task) => void;
  onRegelenClick: (e: React.MouseEvent, task: Task) => void;
  onDocumentClick: (e: React.MouseEvent, task: Task) => void;
  onSwipeComplete: (taskId: string) => void;
};

export const TaskListItem = ({
  task,
  isCompleting,
  isNewAssignment,
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
        className={`group relative px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${getUrgencyStyles()}`}
        onClick={() => !isCompleting && onTaskClick(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !isCompleting && onTaskClick(task);
          }
        }}
      >
        <div
          className="grid grid-cols-[28px,1fr,92px] grid-rows-[36px,16px] gap-x-3"
          style={{ gridTemplateAreas: `"check title actions" "check meta actions"` }}
        >
          {/* Checkbox (spans both rows) */}
          <button
            type="button"
            aria-label={
              task.status === "done"
                ? `Markeer "${task.title}" als niet voltooid`
                : `Markeer "${task.title}" als voltooid`
            }
            className="cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-full place-self-center"
            onClick={(e) => !isCompleting && onCheckboxClick(e, task)}
            disabled={isCompleting}
            style={{ gridArea: "check" }}
          >
            {isCompleting ? (
              <CheckCircle2 className="h-6 w-6 text-primary-foreground animate-scale-in" aria-hidden="true" />
            ) : task.status === "done" ? (
              <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
            ) : (
              <Circle
                className={`h-6 w-6 transition-colors ${
                  isTaskOverdue
                    ? "text-destructive/40 group-hover:text-destructive"
                    : isDueToday
                      ? "text-warning/40 group-hover:text-warning"
                      : "text-muted-foreground/30 group-hover:text-primary/50"
                }`}
                aria-hidden="true"
              />
            )}
          </button>

          {/* Title zone (fixed height: 2 lines max) */}
          <div className="h-[36px] overflow-hidden min-w-0" style={{ gridArea: "title" }}>
            <h4
              className={`font-semibold text-[15px] leading-[18px] whitespace-normal break-words ${
                isCompleting
                  ? "line-through text-primary-foreground"
                  : task.status === "done"
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
              }`}
            >
              {task.title}
            </h4>
          </div>

          {/* Date/meta zone (fixed height) */}
          <div
            className="h-[16px] overflow-hidden min-w-0 flex items-center gap-2"
            style={{ gridArea: "meta" }}
          >
            <span
              className={`flex items-center gap-1 text-xs leading-none ${
                isCompleting
                  ? "text-primary-foreground/80"
                  : isTaskOverdue
                    ? "text-destructive/80"
                    : isDueToday
                      ? "text-warning/80"
                      : "text-muted-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {task.deadlineLabel}
            </span>
            {getUrgencyBadge()}
            {task.assignedToEmail && task.status !== "done" && !isCompleting && (
              <span
                className={`flex items-center gap-1 text-xs px-1.5 h-4 rounded-full ${
                  isNewAssignment ? "text-white bg-primary animate-pulse" : "text-primary/80 bg-primary/10"
                }`}
              >
                <UserCircle className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[80px]">{task.assignedToEmail}</span>
              </span>
            )}
          </div>

          {/* Actions (reserved width; spans both rows) */}
          <div
            className="flex items-center justify-end gap-1 place-self-center"
            style={{ gridArea: "actions" }}
          >
            {task.status !== "done" && !isCompleting && task.hasDocumentLink && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary font-medium rounded-md"
                onClick={(e) => onDocumentClick(e, task)}
              >
                <FileText className="w-3.5 h-3.5" />
              </Button>
            )}
            {task.status !== "done" && !isCompleting && hasAffiliateOptions(task) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] text-primary hover:text-primary/80 hover:bg-primary/5 font-medium rounded-md"
                onClick={(e) => onRegelenClick(e, task)}
              >
                {getTaskButtonLabel(task) || "Regelen"}
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </SwipeableTaskItem>
  );
};
