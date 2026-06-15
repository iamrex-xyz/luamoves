// Smart task ordering — ports the original app's sortTasksSmart so the
// "tackle this first" shortlist and per-phase ordering match the real app:
// urgency bucket first, then days-until-deadline, with a tiny boost for
// affiliate tasks (so they surface) but never above genuinely urgent ones.

import type { UiTask } from "./types";
import { daysUntil } from "./labels";

function urgencyRank(task: UiTask): number {
  if (task.status === "done") return 5;
  const n = daysUntil(task.deadline);
  if (n === null) return 5;
  if (n < 0) return 0; // overdue
  if (n === 0) return 1; // today
  if (n === 1) return 2; // tomorrow
  if (n <= 7) return 3; // this week
  if (n <= 14) return 4; // next week
  return 5; // later
}

function score(task: UiTask): number {
  const rank = urgencyRank(task);
  let s = rank * 1000;

  const n = daysUntil(task.deadline);
  s += Math.min(Math.max(n ?? 365, -100), 365);

  // Slight boost for affiliate tasks, but not over urgent/overdue ones.
  if (task.affiliate && rank > 1) s -= 0.5;

  return s;
}

export function sortTasksSmart(tasks: UiTask[]): UiTask[] {
  return [...tasks].sort((a, b) => {
    const d = score(a) - score(b);
    return d !== 0 ? d : a.title.localeCompare(b.title);
  });
}
