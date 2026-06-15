// Standalone, token-only checklist page (opened from the WhatsApp link).
// A multi-tab shell: Home + Taken are functional against our backend; Docs +
// Account are design-only. Independent of the main app's dashboard.

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SearchX, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskListSkeleton } from "@/components/ui/skeletons";
import { LuaLogo } from "@/components/LuaLogo";

import { useTasklistData } from "@/features/tasklist/useTasklistData";
import type { AffiliateKey, TabId, UiTask } from "@/features/tasklist/types";
import { TasklistBottomNav } from "@/features/tasklist/components/TasklistBottomNav";
import { TasklistHomeTab } from "@/features/tasklist/components/TasklistHomeTab";
import { TasklistTasksTab } from "@/features/tasklist/components/TasklistTasksTab";
import { TasklistDocsTab } from "@/features/tasklist/components/TasklistDocsTab";
import { TasklistAccountTab } from "@/features/tasklist/components/TasklistAccountTab";
import { TasklistTaskSheet } from "@/features/tasklist/components/TasklistTaskSheet";
import { TasklistRegelenDialog } from "@/features/tasklist/components/TasklistRegelenDialog";

const PAGE_BG =
  "min-h-screen flex flex-col bg-gradient-to-br from-primary-light via-primary-light/80 to-white";

const Tasklist = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { state, toggleTask } = useTasklistData(token);

  const [tab, setTab] = useState<TabId>("home");
  const [selected, setSelected] = useState<UiTask | null>(null);
  const [regelenKey, setRegelenKey] = useState<AffiliateKey | null>(null);
  const [regelenOpen, setRegelenOpen] = useState(false);
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  const handleToggle = async (taskId: string) => {
    setCompleting((prev) => new Set(prev).add(taskId));
    await new Promise((r) => setTimeout(r, 450)); // brief check animation
    try {
      await toggleTask(taskId);
    } catch {
      toast.error("Kon de taak niet bijwerken. Probeer het opnieuw.");
    } finally {
      setCompleting((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleRegelen = (task: UiTask) => {
    setSelected(null); // close the sheet if open
    setRegelenKey(task.affiliateKey);
    setRegelenOpen(true);
  };

  // Adding custom tasks isn't supported by our backend; Lua manages the list.
  const handleAdd = () =>
    toast("Lua stelt je takenlijst samen", {
      description: "Vraag Lua in WhatsApp om een taak toe te voegen of aan te passen.",
    });

  // ---- Non-ready states ----
  if (state.status === "loading") {
    return (
      <main className={PAGE_BG}>
        <div className="px-4 pt-4 pb-2">
          <LuaLogo size="md" />
        </div>
        <div className="px-4 sm:px-6 space-y-6">
          <div className="h-32 rounded-3xl bg-white shadow-2xl shadow-primary/15 animate-pulse" />
          <TaskListSkeleton count={6} />
        </div>
      </main>
    );
  }

  if (state.status === "notFound") {
    return (
      <main className={`${PAGE_BG} items-center justify-center px-4`}>
        <div className="rounded-3xl bg-white shadow-2xl shadow-primary/15 p-8 text-center flex flex-col items-center max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
            <SearchX className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Checklist niet gevonden</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Deze link is ongeldig of verlopen. Vraag een nieuwe link aan via WhatsApp en Lua
            zet je checklist meteen klaar.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Terug naar home</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className={`${PAGE_BG} items-center justify-center px-4`}>
        <div className="rounded-3xl bg-white shadow-2xl shadow-primary/15 p-8 text-center flex flex-col items-center max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Er ging iets mis</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We konden je checklist nu niet laden. Probeer het over een paar minuten opnieuw.
          </p>
          <Button onClick={() => window.location.reload()} className="rounded-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </div>
      </main>
    );
  }

  // ---- Ready ----
  const { user, tasks } = state.data;

  return (
    <main id="main-content" tabIndex={-1} className={`${PAGE_BG} focus:outline-none`} aria-label="Checklist">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="w-full">
          {tab === "home" && (
            <TasklistHomeTab
              user={user}
              tasks={tasks}
              completing={completing}
              onToggle={handleToggle}
              onOpen={setSelected}
              onRegelen={handleRegelen}
              onViewAll={() => setTab("tasks")}
              onAdd={handleAdd}
            />
          )}
          {tab === "tasks" && (
            <TasklistTasksTab
              user={user}
              tasks={tasks}
              completing={completing}
              onToggle={handleToggle}
              onOpen={setSelected}
              onRegelen={handleRegelen}
            />
          )}
          {tab === "docs" && <TasklistDocsTab />}
          {tab === "account" && <TasklistAccountTab user={user} />}
        </div>
      </div>

      <TasklistTaskSheet
        task={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onToggle={handleToggle}
        onRegelen={handleRegelen}
      />

      <TasklistRegelenDialog
        affiliateKey={regelenKey}
        open={regelenOpen}
        onOpenChange={setRegelenOpen}
      />

      <TasklistBottomNav current={tab} onNavigate={setTab} />
    </main>
  );
};

export default Tasklist;
