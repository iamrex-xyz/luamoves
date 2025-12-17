import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, X, Plus } from "lucide-react";

type AddTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
  onSignupClick?: () => void;
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

export const AddTaskDialog = ({ open, onOpenChange, onTaskAdded, onSignupClick }: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check if user is logged in when dialog opens
  useEffect(() => {
    if (open) {
      const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setIsGuest(!user);
      };
      checkAuth();
    }
  }, [open]);

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

  // Show guest message if not logged in
  if (isGuest) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85dvh] rounded-t-[24px]">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
            <DrawerTitle className="text-lg font-semibold">Account vereist</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
          
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Maak een gratis account</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Met een account kun je eigen taken toevoegen, je voortgang bewaren en samenwerken met anderen.
            </p>
          </div>
          
          <div className="p-6 pt-0 space-y-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <Button 
              onClick={() => {
                onOpenChange(false);
                onSignupClick?.();
              }}
              className="w-full h-12 rounded-xl"
            >
              Account aanmaken
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full h-12 rounded-xl"
            >
              Later
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90dvh] rounded-t-[24px]">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
          <DrawerTitle className="text-lg font-semibold">Taak toevoegen</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bijv. Extra verhuisdozen bestellen"
                maxLength={100}
                required
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Beschrijving</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optionele beschrijving van de taak"
                maxLength={500}
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Categorie *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="h-12 rounded-xl">
                  <SelectValue placeholder="Selecteer een categorie" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="py-3">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t bg-background px-4 py-3 space-y-2 sticky bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Toevoegen...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Taak toevoegen
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full h-12 rounded-xl"
            >
              Annuleren
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
