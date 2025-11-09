import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type AddTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
};

const categories = [
  "Administratie",
  "Financieel",
  "Huishouden",
  "Verhuizing",
  "Nutsvoorzieningen",
  "Schoonmaak",
  "Inrichten",
  "Sociaal",
  "Verbouwing",
  "Anders"
];

export const AddTaskDialog = ({ open, onOpenChange, onTaskAdded }: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !category || !deadline) {
      toast({
        title: "Vul alle verplichte velden in",
        description: "Titel, categorie en deadline zijn verplicht.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Niet ingelogd");
      }

      // Create custom task ID
      const customTaskId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Insert into custom_tasks table
      const { error: customError } = await supabase.from("custom_tasks").insert({
        user_id: user.id,
        task_id: customTaskId,
        title: title.trim(),
        description: description.trim() || null,
        category: category,
        deadline: deadline,
        phase: "Eigen taken",
      });

      if (customError) throw customError;

      // Also insert status into tasks table
      const { error: statusError } = await supabase.from("tasks").insert({
        user_id: user.id,
        task_id: customTaskId,
        status: "todo",
      });

      if (statusError) throw statusError;

      toast({
        title: "Taak toegevoegd!",
        description: "Je handmatige taak is succesvol toegevoegd.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setDeadline("");
      
      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Fout bij toevoegen",
        description: "De taak kon niet worden toegevoegd. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Handmatig taak toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een eigen taak toe aan je verhuischecklist
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bijv. Extra verhuisdozen bestellen"
                maxLength={100}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optionele beschrijving van de taak"
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorie *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecteer een categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Taak toevoegen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};