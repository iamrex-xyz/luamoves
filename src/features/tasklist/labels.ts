// Date helpers for tasks: days-until, Dutch deadline labels, urgency level.
// Mirrors the original app's wording so the design reads identically.

export type Urgency = "overdue" | "today" | "tomorrow" | "soon" | "later" | "none";

/** Whole days from today until `date` (negative = past). Null if no date. */
export function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Dutch deadline label, e.g. "Vandaag doen", "Deze week doen", "Voor 15 juni". */
export function deadlineLabel(date: Date | null): string {
  const n = daysUntil(date);
  if (n === null) return "Geen deadline";
  if (n < 0) return "Verlopen";
  if (n === 0) return "Vandaag doen";
  if (n === 1) return "Morgen doen";
  if (n <= 7) return "Deze week doen";
  if (n <= 14) return "Volgende week doen";
  if (n <= 31) return "Deze maand doen";
  return `Voor ${date!.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`;
}

/** Urgency bucket used for row styling + badges. `done` tasks are never urgent. */
export function urgencyOf(date: Date | null, done: boolean): Urgency {
  if (done) return "none";
  const n = daysUntil(date);
  if (n === null) return "later";
  if (n < 0) return "overdue";
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n <= 7) return "soon";
  return "later";
}
