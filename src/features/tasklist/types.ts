// Shared types for the WhatsApp-linked tasklist island.
//
// Two layers:
//  - The RAW shape our backend returns (TasklistResponse & friends).
//  - The UI shape our copied design components consume (UiTask), produced by
//    the adapter. Keeping them separate means the design code never deals with
//    nullable API fields or date strings.

export type AffiliateKey = "energy" | "internet" | "moving" | "insurance";

/** The four tabs of the standalone page. */
export type TabId = "home" | "tasks" | "docs" | "account";

// ---- Backend API shape (what GET /api/tasklist/:token returns) ----

export type TasklistApiTask = {
  id: string;
  task_key: string;
  title: string;
  category: string | null;
  due_date: string | null; // ISO date
  status: "pending" | "completed";
  explanation: string | null;
  tip: string | null;
};

export type TasklistApiPhase = {
  phase_order: number;
  name: string;
  tasks: TasklistApiTask[];
};

export type TasklistResponse = {
  user: {
    name: string | null;
    move_date: string | null;
    move_type: "rent" | "buy" | null;
  };
  progress: {
    done: number;
    total: number;
    pct: number;
  };
  phases: TasklistApiPhase[];
};

// ---- UI shape (what our design components consume) ----

export type UiTask = {
  id: string;
  title: string;
  category: string; // never null — defaults to "Overig"
  description: string; // from API `explanation`
  tip: string | null;
  deadline: Date | null; // parsed from `due_date`
  deadlineLabel: string; // Dutch label derived from `deadline`
  phase: string; // phase display name
  phaseOrder: number;
  status: "todo" | "done"; // mapped from pending/completed
  affiliate: boolean; // whether to show the "Regel dit voor mij" CTA
  affiliateKey: AffiliateKey | null;
};
