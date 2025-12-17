import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

export const HouseholdSettingsCard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("adults, children, pets")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setAdults(profile.adults || 1);
        setChildren(profile.children || 0);
        setPets(profile.pets || 0);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ adults, children, pets })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "Opgeslagen", description: "Huishouden details zijn bijgewerkt." });
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Fout", description: "Kon huishouden details niet opslaan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-info" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Huishouden</h2>
            <p className="text-xs text-muted-foreground">Bewoners en huisdieren</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Volwassenen</Label>
            <Input
              type="number"
              min="1"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              className="rounded-xl h-11"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Kinderen</Label>
            <Input
              type="number"
              min="0"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              className="rounded-xl h-11"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Huisdieren</Label>
            <Input
              type="number"
              min="0"
              value={pets}
              onChange={(e) => setPets(parseInt(e.target.value) || 0)}
              className="rounded-xl h-11"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full rounded-xl h-11">
          Opslaan
        </Button>
      </div>
    </div>
  );
};
