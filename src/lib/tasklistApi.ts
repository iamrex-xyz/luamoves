// API helper for the WhatsApp-linked tasklist page.
// Base URL comes from VITE_API_BASE_URL (ngrok dev tunnel, changes often).

export type TasklistTask = {
  id: string;
  task_key: string;
  title: string;
  category: string | null;
  due_date: string | null;
  status: "pending" | "completed";
  explanation: string | null;
  tip: string | null;
};

export type TasklistPhase = {
  phase_order: number;
  name: string;
  tasks: TasklistTask[];
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
  phases: TasklistPhase[];
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

const baseHeaders = {
  "ngrok-skip-browser-warning": "true",
};

export class TasklistNotFoundError extends Error {
  constructor() {
    super("not_found");
  }
}

function ensureBase(): string {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  return BASE_URL.replace(/\/$/, "");
}

export async function fetchTasklist(token: string): Promise<TasklistResponse> {
  const res = await fetch(`${ensureBase()}/api/tasklist/${encodeURIComponent(token)}`, {
    method: "GET",
    headers: baseHeaders,
  });
  if (res.status === 404) {
    throw new TasklistNotFoundError();
  }
  if (!res.ok) {
    throw new Error(`Failed to load tasklist (${res.status})`);
  }
  return (await res.json()) as TasklistResponse;
}

export async function updateTaskStatus(
  id: string,
  token: string,
  status: "pending" | "completed",
): Promise<void> {
  const res = await fetch(`${ensureBase()}/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      ...baseHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, status }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update task (${res.status})`);
  }
}
