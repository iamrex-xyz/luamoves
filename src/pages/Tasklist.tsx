import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { TaskListSkeleton } from "@/components/ui/skeletons";
import { useTasklist } from "@/hooks/useTasklist";
import { TasklistTaskItem } from "@/components/tasklist/TasklistTaskItem";

const dateFmt = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatMoveDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return dateFmt.format(d);
}

const Tasklist = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { state, toggleTask } = useTasklist(token);

  const handleToggle = async (id: string) => {
    try {
      await toggleTask(id);
    } catch {
      toast.error("Kon de taak niet bijwerken. Probeer het opnieuw.");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {state.status === "loading" && (
          <>
            <div className="h-20 rounded-3xl bg-white shadow-lg shadow-primary/10 animate-pulse" />
            <TaskListSkeleton count={6} />
          </>
        )}

        {state.status === "notFound" && (
          <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-6 text-center">
            <h1 className="text-lg font-semibold text-foreground mb-2">
              Deze link is ongeldig of verlopen
            </h1>
            <p className="text-sm text-muted-foreground">
              Vraag een nieuwe link aan via WhatsApp om je checklist te bekijken.
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-6 text-center">
            <h1 className="text-lg font-semibold text-foreground mb-2">
              Er ging iets mis
            </h1>
            <p className="text-sm text-muted-foreground">
              We konden je checklist niet laden. Probeer het later opnieuw.
            </p>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <header className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-5">
              <h1 className="text-lg font-semibold text-foreground">
                {state.data.user.name
                  ? `Verhuizing van ${state.data.user.name}`
                  : "Jouw verhuischecklist"}
                {formatMoveDate(state.data.user.move_date) && (
                  <span className="text-muted-foreground font-normal">
                    {" "}— {formatMoveDate(state.data.user.move_date)}
                  </span>
                )}
              </h1>
              <div className="mt-3">
                <Progress value={state.data.progress.pct} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {state.data.progress.done} / {state.data.progress.total} —{" "}
                  {state.data.progress.pct}%
                </p>
              </div>
            </header>

            {state.data.phases.length === 0 ? (
              <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-6 text-center text-sm text-muted-foreground">
                Je checklist wordt nog voorbereid.
              </div>
            ) : (
              state.data.phases.map((phase) => (
                <section
                  key={phase.phase_order}
                  className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-4"
                >
                  <h2 className="text-sm font-semibold text-foreground mb-3 px-1">
                    {phase.name}
                  </h2>
                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <TasklistTaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Tasklist;
