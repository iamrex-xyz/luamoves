// Tasks tab — a copy of the app's TaskList design, fed by our API.
// Header (logo + filter + search + share), tasks grouped by phase, and a
// collapsible "completed" section. Filter (by category) and search are
// functional client-side; share copies the page link.

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Filter, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LuaLogo } from "@/components/LuaLogo";
import type { TasklistResponse, UiTask } from "../types";
import { sortTasksSmart } from "../sorting";
import { TasklistRow } from "./TasklistRow";

type Props = {
  user: TasklistResponse["user"];
  tasks: UiTask[];
  completing: Set<string>;
  onToggle: (taskId: string) => void;
  onOpen: (task: UiTask) => void;
  onRegelen: (task: UiTask) => void;
};

function matchesSearch(task: UiTask, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    task.title.toLowerCase().includes(q) ||
    task.category.toLowerCase().includes(q) ||
    task.description.toLowerCase().includes(q)
  );
}

function daysUntilMove(moveDate: string | null): number | null {
  if (!moveDate) return null;
  const d = new Date(moveDate);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const TasklistTasksTab = ({
  user,
  tasks,
  completing,
  onToggle,
  onOpen,
  onRegelen,
}: Props) => {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category))).sort(),
    [tasks],
  );

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          matchesSearch(t, search) &&
          (selectedCategories.length === 0 || selectedCategories.includes(t.category)),
      ),
    [tasks, search, selectedCategories],
  );

  const openTasks = filtered.filter((t) => t.status !== "done");
  const completedTasks = filtered.filter((t) => t.status === "done");

  // Group open tasks by phase, ordered by phase_order, sorted within each phase.
  const phases = useMemo(() => {
    const byPhase = new Map<number, { name: string; tasks: UiTask[] }>();
    for (const t of openTasks) {
      const entry = byPhase.get(t.phaseOrder) ?? { name: t.phase, tasks: [] };
      entry.tasks.push(t);
      byPhase.set(t.phaseOrder, entry);
    }
    return [...byPhase.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([order, entry]) => ({
        order,
        name: entry.name,
        tasks: sortTasksSmart(entry.tasks),
      }));
  }, [openTasks]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const days = daysUntilMove(user.move_date);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link gekopieerd naar klembord");
    } catch {
      toast.error("Kon de link niet kopiëren");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <LuaLogo size="md" />
      </div>

      <div className="px-3 sm:px-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          {/* Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-background z-50 rounded-2xl" align="start">
              <h3 className="font-semibold text-sm mb-3">Categorieën</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className={`flex items-center space-x-2 p-2 rounded-xl cursor-pointer transition-colors ${
                      selectedCategories.includes(cat) ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                    onClick={() => toggleCategory(cat)}
                  >
                    <Label className="text-sm cursor-pointer flex-1">{cat}</Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek taken..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-0 bg-secondary/50"
            />
          </div>

          {/* Share */}
          <Button variant="ghost" size="icon" onClick={handleShare} className="h-10 w-10 rounded-xl">
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Mini progress */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>
            {done} van {total} voltooid
          </span>
          {days !== null && (
            <span>{days > 0 ? `${days} dagen tot verhuizing` : "Verhuisdag geweest"}</span>
          )}
        </div>
      </div>

      {/* Task groups */}
      <div className="px-3 sm:px-4 py-3">
        {phases.length === 0 && completedTasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground rounded-3xl bg-white shadow-lg shadow-primary/10">
            Geen taken gevonden. Probeer een andere zoekopdracht!
          </div>
        ) : (
          <div className="space-y-4 p-4 rounded-3xl bg-white shadow-lg shadow-primary/10">
            {phases.map((phase) => (
              <div key={phase.order}>
                <div className="flex items-center gap-2 mb-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">{phase.name}</span>
                  <span className="text-xs text-muted-foreground">({phase.tasks.length})</span>
                </div>
                <div className="space-y-2">
                  {phase.tasks.map((task) => (
                    <TasklistRow
                      key={task.id}
                      task={task}
                      isCompleting={completing.has(task.id)}
                      onOpen={onOpen}
                      onToggle={onToggle}
                      onRegelen={onRegelen}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Completed section (collapsible) */}
            {completedTasks.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleted((v) => !v)}
                  className="w-full flex items-center justify-between py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Voltooid ({completedTasks.length})</span>
                  {showCompleted ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showCompleted && (
                  <div className="space-y-2 mt-1">
                    {completedTasks.map((task) => (
                      <TasklistRow
                        key={task.id}
                        task={task}
                        isCompleting={completing.has(task.id)}
                        onOpen={onOpen}
                        onToggle={onToggle}
                        onRegelen={onRegelen}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
