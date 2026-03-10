import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/taskGenerator";
import { MovingInfo } from "@/types/moving";
import { SwipeableTaskItem } from "@/components/SwipeableTaskItem";
import { hasAffiliateOptions, getTaskButtonLabel, isIntakeCompleted } from "@/lib/taskTypeHelpers";
import { Clock, Circle, CheckCircle2, ChevronRight, AlertTriangle, FileText, UserCircle, Sparkles } from "lucide-react";
import { TaskDocument } from "@/hooks/useTaskDocuments";

type TaskListItemProps = {
  task: Task;
  movingInfo?: MovingInfo;
  isCompleting: boolean;
  isNewAssignment?: boolean;
  taskDocuments?: TaskDocument[];
  onTaskClick: (task: Task) => void;
  onCheckboxClick: (e: React.MouseEvent, task: Task) => void;
  onRegelenClick: (e: React.MouseEvent, task: Task) => void;
  onDocumentClick: (e: React.MouseEvent, task: Task) => void;
  onDocumentPreviewClick?: (doc: TaskDocument) => void;
  onSwipeComplete: (taskId: string) => void;
};

export const TaskListItem = ({
  task,
  movingInfo,
  isCompleting,
  isNewAssignment,
  taskDocuments = [],
  onTaskClick,
  onCheckboxClick,
  onRegelenClick,
  onDocumentClick,
  onDocumentPreviewClick,
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

  // Check if Lua is handling this task
  const isLuaHandling = isIntakeCompleted(task, movingInfo) && task.status !== "done";

  // Determine urgency level for styling
  const getUrgencyStyles = () => {
    if (isCompleting) return "bg-primary border-l-4 border-l-primary";
    if (task.status === "done") return "bg-secondary/30 border-l-4 border-l-transparent";
    if (isLuaHandling) return "bg-primary/5 border border-primary/30 border-l-4 border-l-primary/50";
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

  // Get the first document for preview (only for incomplete tasks)
  const previewDoc = task.status !== "done" && !isCompleting && taskDocuments.length > 0 
    ? taskDocuments[0] 
    : null;

  // Truncate filename for display
  const truncateFilename = (name: string, maxLen: number = 20) => {
    if (name.length <= maxLen) return name;
    const ext = name.split('.').pop() || '';
    const baseName = name.slice(0, name.length - ext.length - 1);
    const truncatedBase = baseName.slice(0, maxLen - ext.length - 4) + '...';
    return `${truncatedBase}.${ext}`;
  };

  const handleDocumentPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewDoc && onDocumentPreviewClick) {
      onDocumentPreviewClick(previewDoc);
    }
  };

  return (
    <SwipeableTaskItem
      onSwipeComplete={() => onSwipeComplete(task.id)}
      disabled={task.status === "done" || isCompleting || isLuaHandling}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`${task.title}${task.status === "done" ? ", voltooid" : isLuaHandling ? ", Lua regelt dit" : isTaskOverdue ? ", verlopen" : isDueToday ? ", vandaag" : ""}`}
        className={`group relative px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${getUrgencyStyles()}`}
        onClick={() => !isCompleting && onTaskClick(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !isCompleting && onTaskClick(task);
          }
        }}
      >
        {/* Fixed 2-row grid: title row + date row. Checkbox spans both. */}
        <div className="grid grid-cols-[28px_1fr] grid-rows-[36px_20px] gap-x-3 gap-y-1">
          {/* Checkbox column (spans both rows) */}
          <button
            type="button"
            aria-label={
              isLuaHandling
                ? `"${task.title}" wordt door Lua geregeld`
                : task.status === "done"
                  ? `Markeer "${task.title}" als niet voltooid`
                  : `Markeer "${task.title}" als voltooid`
            }
            className="row-span-2 cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-full self-center justify-self-center disabled:cursor-not-allowed disabled:opacity-60"
            onClick={(e) => !isCompleting && !isLuaHandling && onCheckboxClick(e, task)}
            disabled={isCompleting || isLuaHandling}
          >
            {isCompleting ? (
              <CheckCircle2 className="h-6 w-6 text-primary-foreground animate-scale-in" aria-hidden="true" />
            ) : isLuaHandling ? (
              <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
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

          {/* ROW 1: Title zone (36px fixed) */}
          <div className="h-[36px] overflow-hidden min-w-0 self-start">
            <h4
              className={`font-medium text-[14px] leading-[18px] whitespace-normal break-words ${
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

          {/* ROW 2: Date + Actions (20px fixed, all actions here) */}
          <div className="h-[20px] min-w-0 flex items-center justify-between">
            {/* Left: date + badges */}
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <span
                className={`flex items-center gap-1 text-xs leading-none shrink-0 ${
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
                  className={`flex items-center gap-1 text-xs px-1.5 h-4 rounded-full shrink-0 ${
                    isNewAssignment ? "text-white bg-primary animate-pulse" : "text-primary/80 bg-primary/10"
                  }`}
                >
                  <UserCircle className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[60px]">{task.assignedToEmail}</span>
                </span>
              )}
            </div>

            {/* Right: action buttons (ONLY in date row) */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {task.status !== "done" && !isCompleting && task.hasDocumentLink && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => onDocumentClick(e, task)}
                  aria-label="Documenten bekijken"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
              {task.status !== "done" && !isCompleting && hasAffiliateOptions(task) && (
                <button
                  type="button"
                  className="flex items-center text-[12px] text-primary hover:text-primary/80 font-medium transition-colors"
                  onClick={(e) => onRegelenClick(e, task)}
                >
                  {getTaskButtonLabel(task, movingInfo)}
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Document preview row - only show for incomplete tasks with documents */}
        {previewDoc && (
          <button
            type="button"
            onClick={handleDocumentPreviewClick}
            className="mt-2 ml-[40px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors max-w-fit"
            aria-label={`Bekijk document: ${previewDoc.file_name}`}
          >
            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {truncateFilename(previewDoc.file_name)}
            </span>
            {taskDocuments.length > 1 && (
              <span className="text-[10px] text-muted-foreground/70 shrink-0">
                +{taskDocuments.length - 1}
              </span>
            )}
          </button>
        )}
      </div>
    </SwipeableTaskItem>
  );
};
