import { useCallback, useEffect, useState } from "react";
import {
  fetchTasklist,
  updateTaskStatus,
  TasklistNotFoundError,
  type TasklistResponse,
} from "@/lib/tasklistApi";

type State =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "ready"; data: TasklistResponse };

function recomputeProgress(data: TasklistResponse): TasklistResponse {
  const all = data.phases.flatMap((p) => p.tasks);
  const total = all.length;
  const done = all.filter((t) => t.status === "completed").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { ...data, progress: { done, total, pct } };
}

export function useTasklist(token: string | null) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ status: "notFound" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    fetchTasklist(token)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof TasklistNotFoundError) {
          setState({ status: "notFound" });
        } else {
          setState({ status: "error", message: err?.message ?? "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!token) return;
      let previousStatus: "pending" | "completed" | null = null;

      setState((curr) => {
        if (curr.status !== "ready") return curr;
        const next = {
          ...curr.data,
          phases: curr.data.phases.map((phase) => ({
            ...phase,
            tasks: phase.tasks.map((t) => {
              if (t.id !== taskId) return t;
              previousStatus = t.status;
              return {
                ...t,
                status: t.status === "completed" ? "pending" : "completed",
              };
            }),
          })),
        };
        return { status: "ready", data: recomputeProgress(next) };
      });

      if (!previousStatus) return;
      const newStatus = previousStatus === "completed" ? "pending" : "completed";

      try {
        await updateTaskStatus(taskId, token, newStatus);
      } catch {
        // revert
        setState((curr) => {
          if (curr.status !== "ready") return curr;
          const reverted = {
            ...curr.data,
            phases: curr.data.phases.map((phase) => ({
              ...phase,
              tasks: phase.tasks.map((t) =>
                t.id === taskId ? { ...t, status: previousStatus! } : t,
              ),
            })),
          };
          return { status: "ready", data: recomputeProgress(reverted) };
        });
        throw new Error("update_failed");
      }
    },
    [token],
  );

  return { state, toggleTask };
}
