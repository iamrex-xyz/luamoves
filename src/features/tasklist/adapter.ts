// Adapter: turns the backend response into the flat UiTask[] our design
// components consume — parsing dates, defaulting nulls, deriving deadline
// labels, and flagging affiliate tasks.

import type { TasklistResponse, UiTask } from "./types";
import { deadlineLabel } from "./labels";
import { detectAffiliate } from "./affiliate";

function parseDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Flatten phases → tasks, enriching each with UI-ready fields. */
export function toUiTasks(data: TasklistResponse): UiTask[] {
  return data.phases.flatMap((phase) =>
    phase.tasks.map((t): UiTask => {
      const deadline = parseDate(t.due_date);
      const affiliateKey = detectAffiliate(t);
      return {
        id: t.id,
        title: t.title,
        category: t.category ?? "Overig",
        description: t.explanation ?? "",
        tip: t.tip,
        deadline,
        deadlineLabel: deadlineLabel(deadline),
        phase: phase.name,
        phaseOrder: phase.phase_order,
        status: t.status === "completed" ? "done" : "todo",
        affiliate: affiliateKey !== null,
        affiliateKey,
      };
    }),
  );
}

export type Progress = { done: number; total: number; pct: number };

/** Recompute progress locally (after an optimistic toggle). */
export function computeProgress(tasks: UiTask[]): Progress {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}
