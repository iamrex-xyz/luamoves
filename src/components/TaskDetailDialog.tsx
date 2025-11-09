import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Task } from "@/lib/taskGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditDeadlinePopover } from "@/components/EditDeadlinePopover";
import { AssignTaskDropdown } from "@/components/AssignTaskDropdown";
import {
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
} from "lucide-react";

type TaskDetailDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: () => void;
};

export const TaskDetailDialog = ({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
}: TaskDetailDialogProps) => {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      loadTaskNotes();
    }
  }, [task?.id]);

  const loadTaskNotes = async () => {
    if (!task) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tasks")
        .select("notes")
        .eq("user_id", user.id)
        .eq("task_id", task.id)
        .maybeSingle();

      if (error) throw error;
      setNotes(data?.notes || "");
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const handleSaveNotes = async () => {
    if (!task) return;

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("tasks")
        .upsert(
          {
            user_id: user.id,
            task_id: task.id,
            notes: notes,
          },
          {
            onConflict: "user_id,task_id",
          }
        );

      if (error) throw error;

      toast({
        title: "Notities opgeslagen",
        description: "Je notities zijn succesvol opgeslagen.",
      });

      onTaskUpdate();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Fout bij opslaan",
        description: "Kon notities niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!task) return null;

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done";
  const daysUntilDeadline = Math.ceil(
    (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    if (task.status === "done") {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Voltooid
        </Badge>
      );
    }
    if (task.status === "in_progress") {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Bezig
        </Badge>
      );
    }
    if (isOverdue) {
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              {task.icon}
            </div>
            <div className="flex-1">
              <div className="mb-2">{task.title}</div>
              {getStatusBadge()}
            </div>
          </DialogTitle>
        </DialogHeader>

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

          <Separator />

          {/* Task Details */}
          <div className="grid gap-4">
            {/* Deadline */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Deadline</Label>
                  <p className="text-sm text-muted-foreground">
                    {task.deadlineLabel}
                    {daysUntilDeadline === 0 && " (vandaag)"}
                    {daysUntilDeadline === 1 && " (morgen)"}
                    {daysUntilDeadline > 1 && ` (over ${daysUntilDeadline} dagen)`}
                    {isOverdue && " (verlopen)"}
                  </p>
                </div>
              </div>
              <EditDeadlinePopover
                taskId={task.id}
                currentDeadline={task.deadline}
                onDeadlineChange={onTaskUpdate}
              />
            </div>

            {/* Assigned To */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Toegewezen aan</Label>
                  <p className="text-sm text-muted-foreground">
                    {task.assignedToEmail || "Niet toegewezen"}
                  </p>
                </div>
              </div>
              <AssignTaskDropdown
                taskId={task.id}
                currentAssignedTo={task.assignedTo}
                currentAssignedEmail={task.assignedToEmail}
                onAssignmentChange={onTaskUpdate}
              />
            </div>

            {/* Category & Phase */}
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

          <Separator />

          {/* Notes Section */}
          <div>
            <Label className="text-base font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notities
            </Label>
            <Textarea
              placeholder="Voeg notities toe over deze taak..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <Button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="mt-3 w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Opslaan..." : "Notities opslaan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};