// Home tab — a copy of the app's Dashboard design, fed by our API.
// Moving-date card + progress ring + "tackle this first" shortlist (top 5,
// ensuring an affiliate task is visible) + "Bekijk alle N taken" → Tasks tab.

import { useMemo } from "react";
import { CheckCircle2, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onViewAll: () => void;
  onAdd: () => void;
};

function moveDateParts(moveDate: string | null) {
  if (!moveDate) return null;
  const d = new Date(moveDate);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const md = new Date(d);
  md.setHours(0, 0, 0, 0);
  const daysUntilMove = Math.ceil((md.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    dayOfWeek: d.toLocaleDateString("nl-NL", { weekday: "short" }),
    dayNumber: d.getDate(),
    monthName: d.toLocaleDateString("nl-NL", { month: "long" }),
    daysUntilMove,
  };
}

export const TasklistHomeTab = ({
  user,
  tasks,
  completing,
  onToggle,
  onOpen,
  onRegelen,
  onViewAll,
  onAdd,
}: Props) => {
  const openTasks = useMemo(
    () => sortTasksSmart(tasks.filter((t) => t.status !== "done")),
    [tasks],
  );

  // Top 5, but make sure at least one affiliate task is visible (swap in).
  const displayTasks = useMemo(() => {
    const top5 = openTasks.slice(0, 5);
    if (top5.some((t) => t.affiliate)) return top5;
    const firstAffiliate = openTasks.find((t, idx) => idx >= 5 && t.affiliate);
    if (firstAffiliate && top5.length === 5) return [...top5.slice(0, 4), firstAffiliate];
    return top5;
  }, [openTasks]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  const date = moveDateParts(user.move_date);

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <LuaLogo size="md" />
      </div>

      {/* Moving Date Card */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/15">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative p-6">
            <div className="flex items-center gap-6">
              {/* Date display */}
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shrink-0">
                {date ? (
                  <>
                    <span className="text-xs uppercase tracking-wide opacity-80">{date.dayOfWeek}</span>
                    <span className="text-3xl font-bold">{date.dayNumber}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs uppercase tracking-wide opacity-80">Plan</span>
                    <span className="text-2xl font-bold">—</span>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Verhuisdatum</p>
                <h2 className="text-xl font-semibold text-foreground mb-1 truncate">
                  {date ? date.monthName : "Nog niet ingepland"}
                </h2>
                {date && (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
                      {date.daysUntilMove >= 0
                        ? `${date.daysUntilMove} dagen`
                        : `${Math.abs(date.daysUntilMove)}d geleden`}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress ring → Tasks tab */}
              <button
                onClick={onViewAll}
                className="relative w-16 h-16 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full shrink-0"
                aria-label={`${Math.round(pct)}% voltooid - Bekijk alle taken`}
              >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-primary"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{Math.round(pct)}%</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks section */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Jouw taken</h2>
            <p className="text-xs text-muted-foreground">Dit pak je als eerste aan</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
            className="h-9 px-3 rounded-full bg-primary-light text-primary hover:bg-primary-muted"
          >
            <Plus className="w-4 h-4 mr-1" />
            Toevoegen
          </Button>
        </div>

        {openTasks.length > 0 ? (
          <div className="rounded-3xl bg-white shadow-lg shadow-primary/10">
            <div className="space-y-2 p-4">
              {displayTasks.map((task) => (
                <TasklistRow
                  key={task.id}
                  task={task}
                  isCompleting={completing.has(task.id)}
                  onOpen={onOpen}
                  onToggle={onToggle}
                  onRegelen={onRegelen}
                />
              ))}
              {openTasks.length > 5 && (
                <Button
                  variant="ghost"
                  className="w-full h-12 text-sm text-muted-foreground hover:text-foreground"
                  onClick={onViewAll}
                >
                  Bekijk alle {openTasks.length} taken
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-white shadow-lg shadow-primary/10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">Lekker bezig! Alles is afgevinkt 🎉</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Heb je nog iets te doen? Voeg het hieronder toe.
            </p>
            <Button onClick={onAdd} className="rounded-full bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Taak toevoegen
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
