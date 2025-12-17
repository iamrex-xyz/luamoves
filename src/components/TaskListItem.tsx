import { Button } from "@/components/ui/button";
import { Task } from "@/lib/taskGenerator";
import { SwipeableTaskItem } from "@/components/SwipeableTaskItem";
import { Clock, Circle, CheckCircle2, ArrowRight } from "lucide-react";

type TaskListItemProps = {
  task: Task;
  isCompleting: boolean;
  onTaskClick: (task: Task) => void;
  onCheckboxClick: (e: React.MouseEvent, task: Task) => void;
  onRegelenClick: (e: React.MouseEvent, task: Task) => void;
  onSwipeComplete: (taskId: string) => void;
};

export const TaskListItem = ({
  task,
  isCompleting,
  onTaskClick,
  onCheckboxClick,
  onRegelenClick,
  onSwipeComplete,
}: TaskListItemProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);
  const isTaskOverdue = deadline < today && task.status !== "done";

  return (
    <SwipeableTaskItem
      onSwipeComplete={() => onSwipeComplete(task.id)}
      disabled={task.status === "done" || isCompleting}
    >
      <div
        className={`group relative px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
          isCompleting 
            ? "bg-primary animate-task-complete" 
            : isTaskOverdue 
              ? "bg-destructive/5 hover:bg-destructive/10" 
              : "bg-secondary/50 hover:bg-secondary"
        }`}
        onClick={() => !isCompleting && onTaskClick(task)}
      >
        <div className="flex items-start gap-3">
          <div 
            className="shrink-0 cursor-pointer transition-transform duration-200 hover:scale-110 pt-0.5"
            onClick={(e) => !isCompleting && onCheckboxClick(e, task)}
          >
            {isCompleting ? (
              <CheckCircle2 className="h-5 w-5 text-primary-foreground animate-scale-in" />
            ) : task.status === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm leading-snug transition-all duration-200 ${
              isCompleting 
                ? "line-through text-primary-foreground" 
                : task.status === "done" 
                  ? "line-through text-muted-foreground" 
                  : "text-foreground"
            }`}>
              {task.title}
            </h4>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className={`flex items-center gap-1 text-xs transition-colors duration-200 ${
                isCompleting ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}>
                <Clock className="w-3 h-3" />
                {task.deadlineLabel}
                {isTaskOverdue && !isCompleting && <span className="text-destructive ml-1">(verlopen)</span>}
              </span>
              {task.affiliateLink && task.status !== "done" && !isCompleting && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-5 px-0 text-xs text-primary hover:text-primary hover:bg-transparent font-medium"
                  onClick={(e) => onRegelenClick(e, task)}
                >
                  Regelen
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SwipeableTaskItem>
  );
};
