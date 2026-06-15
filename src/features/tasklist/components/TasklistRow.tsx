// One task row — a copy of the app's TaskListItem design, fed by our API.
// Drops features our backend doesn't expose (swipe-to-complete, document
// previews, assignment badges) per spec, keeping the checkbox, deadline,
// urgency badge, and the affiliate "Regel dit voor mij" CTA.

import { Badge } from "@/components/ui/badge";
import { Clock, Circle, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
import type { UiTask } from "../types";
import { urgencyOf } from "../labels";
import { REGELEN_LABEL } from "../affiliate";

type Props = {
  task: UiTask;
  isCompleting: boolean;
  onOpen: (task: UiTask) => void;
  onToggle: (taskId: string) => void;
  onRegelen: (task: UiTask) => void;
};

export const TasklistRow = ({ task, isCompleting, onOpen, onToggle, onRegelen }: Props) => {
  const done = task.status === "done";
  const urgency = urgencyOf(task.deadline, done);
  const isOverdue = urgency === "overdue";
  const isToday = urgency === "today";
  const isTomorrow = urgency === "tomorrow";

  const urgencyStyles = (() => {
    if (isCompleting) return "bg-primary border-l-4 border-l-primary";
    if (done) return "bg-secondary/30 border-l-4 border-l-transparent";
    if (isOverdue) return "bg-destructive/10 border-l-4 border-l-destructive hover:bg-destructive/20";
    if (isToday) return "bg-warning/15 border-l-4 border-l-warning hover:bg-warning/25";
    if (isTomorrow) return "bg-primary/10 border-l-4 border-l-primary/50 hover:bg-primary/20";
    return "bg-secondary/50 border-l-4 border-l-transparent hover:bg-secondary";
  })();

  const badge = (() => {
    if (done || isCompleting) return null;
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-medium">
          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
          Verlopen
        </Badge>
      );
    }
    if (isToday) {
      return (
        <Badge className="text-[10px] px-1.5 py-0 h-4 font-medium bg-warning text-warning-foreground">
          Vandaag
        </Badge>
      );
    }
    if (isTomorrow) {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium text-primary">
          Morgen
        </Badge>
      );
    }
    return null;
  })();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${task.title}${done ? ", voltooid" : isOverdue ? ", verlopen" : isToday ? ", vandaag" : ""}`}
      className={`group relative px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${urgencyStyles}`}
      onClick={() => !isCompleting && onOpen(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isCompleting) onOpen(task);
        }
      }}
    >
      {/* Fixed 2-row grid: title row + date row. Checkbox spans both. */}
      <div className="grid grid-cols-[28px_1fr] grid-rows-[36px_20px] gap-x-3 gap-y-1">
        {/* Checkbox (spans both rows) */}
        <button
          type="button"
          aria-label={done ? `Markeer "${task.title}" als niet voltooid` : `Markeer "${task.title}" als voltooid`}
          className="row-span-2 cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-full self-center justify-self-center"
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompleting) onToggle(task.id);
          }}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <CheckCircle2 className="h-6 w-6 text-primary-foreground animate-scale-in" aria-hidden="true" />
          ) : done ? (
            <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
          ) : (
            <Circle
              className={`h-6 w-6 transition-colors ${
                isOverdue
                  ? "text-destructive/40 group-hover:text-destructive"
                  : isToday
                    ? "text-warning/40 group-hover:text-warning"
                    : "text-muted-foreground/30 group-hover:text-primary/50"
              }`}
              aria-hidden="true"
            />
          )}
        </button>

        {/* ROW 1: Title */}
        <div className="h-[36px] overflow-hidden min-w-0 self-start">
          <h4
            className={`font-medium text-[14px] leading-[18px] whitespace-normal break-words ${
              isCompleting
                ? "line-through text-primary-foreground"
                : done
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
            }`}
          >
            {task.title}
          </h4>
        </div>

        {/* ROW 2: Deadline + badge (left) and affiliate CTA (right) */}
        <div className="h-[20px] min-w-0 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span
              className={`flex items-center gap-1 text-xs leading-none shrink-0 ${
                isCompleting
                  ? "text-primary-foreground/80"
                  : isOverdue
                    ? "text-destructive/80"
                    : isToday
                      ? "text-warning/80"
                      : "text-muted-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {task.deadlineLabel}
            </span>
            {badge}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {!done && !isCompleting && task.affiliate && (
              <button
                type="button"
                className="flex items-center text-[12px] text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegelen(task);
                }}
              >
                {REGELEN_LABEL}
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
