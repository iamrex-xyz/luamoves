// Data hook for the standalone tasklist page.
// Loads the checklist by token, exposes it as UiTask[], and toggles task status
// optimistically against our backend (reverting on failure).

import { useCallback, useEffect, useRef, useState } from "react";
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

  // Mirror the latest committed state so toggleTask can read the current task
  // status synchronously — never via a setState-updater side effect, whose
  // timing React does not guarantee (it would intermittently skip the PATCH).
  const stateRef = useRef<TasklistState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

      // Read the current status synchronously from the committed state.
      const curr = stateRef.current;
      if (curr.status !== "ready") return;
      const task = curr.data.tasks.find((t) => t.id === taskId);
      if (!task) return;

      const prevStatus = task.status;
      const nextStatus: UiTask["status"] = prevStatus === "done" ? "todo" : "done";
      const apiStatus = nextStatus === "done" ? "completed" : "pending";

      // Optimistic update.
      setState((s) => {
        if (s.status !== "ready") return s;
        const tasks = s.data.tasks.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t,
        );
        return { status: "ready", data: { ...s.data, tasks } };
      });

      try {
        await updateTaskStatus(taskId, token, apiStatus);
      } catch (err) {
        // Revert on failure.
        setState((s) => {
          if (s.status !== "ready") return s;
          const tasks = s.data.tasks.map((t) =>
            t.id === taskId ? { ...t, status: prevStatus } : t,
          );
          return { status: "ready", data: { ...s.data, tasks } };
        });
        throw err;
      }
    },
    [token],
  );

  return { state, toggleTask };
}
