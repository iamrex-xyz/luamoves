import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Circle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import type { TasklistTask } from "@/lib/tasklistApi";

type Props = {
  task: TasklistTask;
  onToggle: (id: string) => void;
};

function getDeadlineInfo(iso: string | null) {
  if (!iso) return { label: "Geen deadline", daysUntil: null as number | null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { label: "Geen deadline", daysUntil: null };
  d.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let label: string;
  if (daysUntil < 0) label = "Verlopen";
  else if (daysUntil === 0) label = "Vandaag doen";
  else if (daysUntil === 1) label = "Morgen doen";
  else if (daysUntil <= 7) label = "Deze week doen";
  else if (daysUntil <= 14) label = "Volgende week doen";
  else if (daysUntil <= 31) label = "Deze maand doen";
  else
    label = `Voor ${d.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
    })}`;
  return { label, daysUntil };
}

export const TasklistTaskItem = ({ task, onToggle }: Props) => {
  const [open, setOpen] = useState(false);
  const done = task.status === "completed";
  const { label: deadlineLabel, daysUntil } = getDeadlineInfo(task.due_date);
  const isOverdue = daysUntil !== null && daysUntil < 0 && !done;
  const isDueToday = daysUntil === 0 && !done;
  const isDueSoon = daysUntil === 1 && !done;
  const hasDetails = Boolean(task.explanation || task.tip);

  const urgencyStyles = done
    ? "bg-secondary/30 border-l-4 border-l-transparent"
    : isOverdue
      ? "bg-destructive/8 border-l-4 border-l-destructive hover:bg-destructive/12"
      : isDueToday
        ? "bg-warning/10 border-l-4 border-l-warning hover:bg-warning/15"
        : isDueSoon
          ? "bg-primary/5 border-l-4 border-l-primary/50 hover:bg-primary/10"
          : "bg-secondary/50 border-l-4 border-l-transparent hover:bg-secondary";

  return (
    <div
      className={`group relative px-3 py-3 rounded-xl transition-all duration-300 ${urgencyStyles}`}
    >
      <div className="grid grid-cols-[28px_1fr] grid-rows-[auto_20px] gap-x-3 gap-y-1">
        {/* Checkbox */}
        <button
          type="button"
          aria-label={done ? `Markeer "${task.title}" als niet voltooid` : `Markeer "${task.title}" als voltooid`}
          onClick={() => onToggle(task.id)}
          className="row-span-2 cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-full self-center justify-self-center"
        >
          {done ? (
            <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden />
          ) : (
            <Circle
              className={`h-6 w-6 transition-colors ${
                isOverdue
                  ? "text-destructive/40 group-hover:text-destructive"
                  : isDueToday
                    ? "text-warning/40 group-hover:text-warning"
                    : "text-muted-foreground/30 group-hover:text-primary/50"
              }`}
              aria-hidden
            />
          )}
        </button>

        {/* Title row */}
        <div className="min-w-0 self-center flex items-start justify-between gap-2">
          <h4
            className={`font-medium text-[14px] leading-[18px] whitespace-normal break-words ${
              done ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.title}
          </h4>
          {hasDetails && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5"
              aria-label={open ? "Verberg details" : "Toon details"}
            >
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Deadline row */}
        <div className="h-[20px] min-w-0 flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs leading-none shrink-0 ${
              isOverdue
                ? "text-destructive/80"
                : isDueToday
                  ? "text-warning/80"
                  : "text-muted-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {deadlineLabel}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
              Verlopen
            </Badge>
          )}
          {isDueToday && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 font-medium bg-warning text-warning-foreground">
              Vandaag
            </Badge>
          )}
          {task.category && !isOverdue && !isDueToday && (
            <span className="text-[10px] text-muted-foreground/80 truncate">
              {task.category}
            </span>
          )}
        </div>
      </div>

      {open && hasDetails && (
        <div className="mt-3 ml-[40px] space-y-2">
          {task.explanation && (
            <p className="text-xs text-muted-foreground leading-relaxed">{task.explanation}</p>
          )}
          {task.tip && (
            <div className="flex items-start gap-2 text-xs text-foreground/80 bg-accent/40 rounded-lg p-2">
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              <span>{task.tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
