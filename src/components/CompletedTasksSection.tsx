import { useState } from "react";
import { Task } from "@/lib/taskGenerator";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type CompletedTasksSectionProps = {
  tasks: Task[];
  onUndoTask: (taskId: string) => void;
};

export const CompletedTasksSection = ({
  tasks,
  onUndoTask,
}: CompletedTasksSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-4"
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-muted-foreground/70" />
            <span className="text-sm text-muted-foreground">
              Afgeronde taken
            </span>
            <span className="text-xs text-muted-foreground/60">
              ({tasks.length})
            </span>
          </div>
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-muted-foreground/60 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-1 px-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/20 group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-5 h-5 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-muted-foreground/60" />
                </div>
                <span className="text-sm text-muted-foreground truncate">
                  {task.title}
                </span>
              </div>

              <button
                onClick={() => onUndoTask(task.id)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-all"
                aria-label={`Taak "${task.title}" ongedaan maken`}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Toch nog aanpassen?</span>
              </button>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};