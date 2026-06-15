// Data hook for the standalone tasklist page.
// Loads the checklist by token, exposes it as UiTask[], and toggles task status
// optimistically against our backend (reverting on failure).

import { useCallback, useEffect, useState } from "react";
import { fetchTasklist, updateTaskStatus, TasklistNotFoundError } from "./api";
import { toUiTasks } from "./adapter";
import type { TasklistResponse, UiTask } from "./types";

type ReadyData = {
  user: TasklistResponse["user"];
  tasks: UiTask[];
};

export type TasklistState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ReadyData };

export function useTasklistData(token: string | null) {
  const [state, setState] = useState<TasklistState>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ status: "notFound" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    fetchTasklist(token)
      .then((res) => {
        if (cancelled) return;
        setState({
          status: "ready",
          data: { user: res.user, tasks: toUiTasks(res) },
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof TasklistNotFoundError) setState({ status: "notFound" });
        else setState({ status: "error", message: err?.message ?? "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!token) return;

      let prevStatus: UiTask["status"] | null = null;
      const flip = (s: UiTask["status"]): UiTask["status"] =>
        s === "done" ? "todo" : "done";

      // Optimistic update.
      setState((curr) => {
        if (curr.status !== "ready") return curr;
        const tasks = curr.data.tasks.map((t) => {
          if (t.id !== taskId) return t;
          prevStatus = t.status;
          return { ...t, status: flip(t.status) };
        });
        return { status: "ready", data: { ...curr.data, tasks } };
      });

      if (!prevStatus) return;
      const apiStatus = flip(prevStatus) === "done" ? "completed" : "pending";

      try {
        await updateTaskStatus(taskId, token, apiStatus);
      } catch (err) {
        // Revert on failure.
        setState((curr) => {
          if (curr.status !== "ready") return curr;
          const tasks = curr.data.tasks.map((t) =>
            t.id === taskId ? { ...t, status: prevStatus! } : t,
          );
          return { status: "ready", data: { ...curr.data, tasks } };
        });
        throw err;
      }
    },
    [token],
  );

  return { state, toggleTask };
}
