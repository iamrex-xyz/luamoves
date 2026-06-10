import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SearchX, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskListSkeleton } from "@/components/ui/skeletons";
import { LuaLogo } from "@/components/LuaLogo";
import { useTasklist } from "@/hooks/useTasklist";
import { TasklistTaskItem } from "@/components/tasklist/TasklistTaskItem";

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

  const moveDateInfo = useMemo(() => {
    if (state.status !== "ready" || !state.data.user.move_date) return null;
    const d = new Date(state.data.user.move_date);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const md = new Date(d);
    md.setHours(0, 0, 0, 0);
    const daysUntilMove = Math.ceil(
      (md.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return {
      dayOfWeek: d.toLocaleDateString("nl-NL", { weekday: "short" }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString("nl-NL", { month: "long" }),
      daysUntilMove,
    };
  }, [state]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white focus:outline-none"
      aria-label="Checklist"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <LuaLogo size="md" />
      </div>

      <div className="max-w-3xl mx-auto">
        {state.status === "loading" && (
          <div className="px-4 sm:px-6 space-y-6">
            <div className="h-32 rounded-3xl bg-white shadow-2xl shadow-primary/15 animate-pulse" />
            <TaskListSkeleton count={6} />
          </div>
        )}

        {state.status === "notFound" && (
          <div className="px-4 sm:px-6">
            <div className="rounded-3xl bg-white shadow-2xl shadow-primary/15 p-8 text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8" aria-hidden />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Checklist niet gevonden
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Deze link is ongeldig of verlopen. Vraag een nieuwe link aan via
                WhatsApp en Lua zet je checklist meteen klaar.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button asChild className="rounded-full" style={{ backgroundColor: "#25D366" }}>
                  <a href="https://wa.me/31000000000" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/">Terug naar home</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="px-4 sm:px-6">
            <div className="rounded-3xl bg-white shadow-2xl shadow-primary/15 p-8 text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8" aria-hidden />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Er ging iets mis
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                We konden je checklist nu niet laden. Probeer het over een paar
                minuten opnieuw.
              </p>
              <Button onClick={() => window.location.reload()} className="rounded-full">
                Opnieuw proberen
              </Button>
            </div>
          </div>
        )}

        {state.status === "ready" && (
          <>
            {/* Moving Date Card */}
            <div className="px-4 sm:px-6 mb-6">
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/15">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative p-6">
                  <div className="flex items-center gap-6">
                    {/* Date display */}
                    {moveDateInfo ? (
                      <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shrink-0">
                        <span className="text-xs uppercase tracking-wide opacity-80">
                          {moveDateInfo.dayOfWeek}
                        </span>
                        <span className="text-3xl font-bold">{moveDateInfo.dayNumber}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shrink-0">
                        <span className="text-xs uppercase tracking-wide opacity-80">Plan</span>
                        <span className="text-2xl font-bold">—</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Verhuisdatum
                      </p>
                      <h2 className="text-xl font-semibold text-foreground mb-1 truncate">
                        {moveDateInfo ? moveDateInfo.monthName : "Nog niet ingepland"}
                      </h2>
                      {moveDateInfo && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
                            {moveDateInfo.daysUntilMove >= 0
                              ? `${moveDateInfo.daysUntilMove} dagen`
                              : `${Math.abs(moveDateInfo.daysUntilMove)}d geleden`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress ring */}
                    <div
                      className="relative w-16 h-16 shrink-0"
                      aria-label={`${state.data.progress.pct}% voltooid`}
                    >
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="hsl(var(--muted))"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          className="stroke-primary"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - state.data.progress.pct / 100)}`}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s ease-out" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">
                          {state.data.progress.pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="px-4 sm:px-6 pb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {state.data.user.name ? `Taken van ${state.data.user.name}` : "Jouw taken"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {state.data.progress.done} van {state.data.progress.total} voltooid
                  </p>
                </div>
              </div>

              {state.data.phases.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-white shadow-lg shadow-primary/10 text-sm text-muted-foreground">
                  Je checklist wordt nog voorbereid.
                </div>
              ) : (
                <div className="space-y-4">
                  {state.data.phases.map((phase) => (
                    <section
                      key={phase.phase_order}
                      className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-4"
                    >
                      <h3 className="text-sm font-semibold text-foreground mb-3 px-1">
                        {phase.name}
                      </h3>
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
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Tasklist;
