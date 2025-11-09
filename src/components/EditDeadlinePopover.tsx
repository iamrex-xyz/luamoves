import { useState } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EditDeadlinePopoverProps = {
  taskId: string;
  currentDeadline: Date;
  onDeadlineChange: () => void;
};

export const EditDeadlinePopover = ({
  taskId,
  currentDeadline,
  onDeadlineChange,
}: EditDeadlinePopoverProps) => {
  const [date, setDate] = useState<Date>(currentDeadline);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    setDate(selectedDate);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      // Check if this is a custom task or generated task
      const { data: customTask } = await supabase
        .from("custom_tasks")
        .select("id")
        .eq("task_id", taskId)
        .maybeSingle();

      if (customTask) {
        // Update custom task deadline
        const { error } = await supabase
          .from("custom_tasks")
          .update({ deadline: format(selectedDate, "yyyy-MM-dd") })
          .eq("task_id", taskId);

        if (error) throw error;
      } else {
        // For generated tasks, upsert into task_deadlines
        const { error } = await supabase
          .from("task_deadlines")
          .upsert({
            user_id: user.id,
            task_id: taskId,
            deadline: format(selectedDate, "yyyy-MM-dd"),
          }, {
            onConflict: "user_id,task_id"
          });

        if (error) throw error;
      }

      toast({
        title: "Deadline aangepast",
        description: `Nieuwe deadline: ${format(selectedDate, "d MMMM yyyy", { locale: nl })}`,
      });

      setIsOpen(false);
      onDeadlineChange();
    } catch (error) {
      console.error("Error updating deadline:", error);
      toast({
        title: "Fout bij opslaan",
        description: "De deadline kon niet worden aangepast.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isOverdue = new Date() > currentDeadline;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-2 hover:bg-accent",
            isOverdue && "text-destructive hover:text-destructive"
          )}
          disabled={isLoading}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-xs">
            {date ? format(date, "d MMM", { locale: nl }) : "Deadline"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
          locale={nl}
        />
      </PopoverContent>
    </Popover>
  );
};