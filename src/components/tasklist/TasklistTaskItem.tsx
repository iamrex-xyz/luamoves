import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { TasklistTask } from "@/lib/tasklistApi";

const dateFmt = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return dateFmt.format(d);
}

type Props = {
  task: TasklistTask;
  onToggle: (id: string) => void;
};

export const TasklistTaskItem = ({ task, onToggle }: Props) => {
  const [open, setOpen] = useState(false);
  const checked = task.status === "completed";
  const due = formatDate(task.due_date);
  const hasDetails = Boolean(task.explanation || task.tip);

  return (
    <div className="px-3 py-2.5 rounded-xl bg-secondary/30 border-l-4 border-l-transparent hover:bg-secondary/50 transition-colors">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-0.5 h-5 w-5"
          aria-label={task.title}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-sm font-medium leading-snug ${
                checked ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.title}
            </span>
            {hasDetails && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={open ? "Verberg details" : "Toon details"}
              >
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {task.category && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                {task.category}
              </Badge>
            )}
            {due && <span className="text-xs text-muted-foreground">{due}</span>}
          </div>
          {open && hasDetails && (
            <div className="mt-2 space-y-2">
              {task.explanation && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {task.explanation}
                </p>
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
      </div>
    </div>
  );
};
