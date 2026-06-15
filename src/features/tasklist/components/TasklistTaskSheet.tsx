// Task detail bottom-sheet — a copy of the app's TaskDetailDialog (a Drawer),
// trimmed to what our API supports: title, status, affiliate CTA, description,
// tip, deadline (read-only), category & phase, and a mark-complete action.
// Notes, assignment and deadline-editing are omitted (no backend for them).

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import type { UiTask } from "../types";
import { urgencyOf } from "../labels";
import { taskIcon } from "../icons";
import { REGELEN_LABEL } from "../affiliate";

type Props = {
  task: UiTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (taskId: string) => void;
  onRegelen: (task: UiTask) => void;
};

export const TasklistTaskSheet = ({ task, open, onOpenChange, onToggle, onRegelen }: Props) => {
  if (!task) return null;

  const done = task.status === "done";
  const urgency = urgencyOf(task.deadline, done);
  const showRegelen = !done && task.affiliate;

  const statusBadge = (() => {
    if (done) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Voltooid
        </Badge>
      );
    }
    if (urgency === "overdue") {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Verlopen
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Clock className="w-3 h-3 mr-1" />
        Te doen
      </Badge>
    );
  })();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85dvh] max-h-[85dvh] rounded-t-[24px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
          <DrawerTitle className="text-lg font-semibold">Taak details</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Title + icon */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">{taskIcon(task)}</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">{task.title}</h2>
              {statusBadge}
            </div>
          </div>

          {/* Affiliate CTA */}
          {showRegelen && (
            <div className="mb-6">
              <Button
                onClick={() => onRegelen(task)}
                size="lg"
                className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {REGELEN_LABEL}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Lua regelt dit gratis voor je
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Beschrijving
                </Label>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
            )}

            {/* Tip */}
            {task.tip && (
              <div className="flex items-start gap-2 text-sm text-foreground/80 bg-accent/40 rounded-xl p-3">
                <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>{task.tip}</span>
              </div>
            )}

            <Separator />

            {/* Details */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Deadline</Label>
                  <p className="text-sm text-muted-foreground">{task.deadlineLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">Categorie</Label>
                  <p className="text-sm font-medium">{task.category}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">Fase</Label>
                  <p className="text-sm font-medium">{task.phase}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-background px-4 py-3 sticky bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button
            onClick={() => {
              onToggle(task.id);
              onOpenChange(false);
            }}
            variant={showRegelen ? "outline" : "default"}
            className="w-full h-12 rounded-xl active:scale-[0.98] transition-transform"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {done ? "Markeer als open" : "Markeer als voltooid"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
