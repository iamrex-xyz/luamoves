// HTTP client for the WhatsApp-linked tasklist page.
// Base URL comes from VITE_API_BASE_URL (a dev ngrok tunnel that changes often,
// later the production backend domain) — never hardcode it.

import type { TasklistResponse } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

// ngrok shows an interstitial HTML warning on first hit unless this header is set.
const baseHeaders = {
  "ngrok-skip-browser-warning": "true",
};

/** Thrown when the token doesn't resolve to a checklist (HTTP 404). */
export class TasklistNotFoundError extends Error {
  constructor() {
    super("not_found");
    this.name = "TasklistNotFoundError";
  }
}

function ensureBase(): string {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  return BASE_URL.replace(/\/$/, "");
}

export async function fetchTasklist(token: string): Promise<TasklistResponse> {
  const res = await fetch(
    `${ensureBase()}/api/tasklist/${encodeURIComponent(token)}`,
    { method: "GET", headers: baseHeaders },
  );
  if (res.status === 404) throw new TasklistNotFoundError();
  if (!res.ok) throw new Error(`Failed to load tasklist (${res.status})`);
  return (await res.json()) as TasklistResponse;
}

export async function updateTaskStatus(
  id: string,
  token: string,
  status: "pending" | "completed",
): Promise<void> {
  const res = await fetch(`${ensureBase()}/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...baseHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ token, status }),
  });
  if (!res.ok) throw new Error(`Failed to update task (${res.status})`);
}
