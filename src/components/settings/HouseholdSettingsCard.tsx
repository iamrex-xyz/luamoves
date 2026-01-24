import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutosave } from "@/hooks/useAutosave";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";

export const HouseholdSettingsCard = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);

  const saveToDatabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          adults,
          children,
          pets,
        } as any,
        { onConflict: "user_id" }
      );

    if (error) throw error;
  }, [adults, children, pets]);

  const { triggerSave, status } = useAutosave(saveToDatabase);

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
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleAdultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setAdults(Math.max(1, value));
    triggerSave();
  };

  const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setChildren(Math.max(0, value));
    triggerSave();
  };

  const handlePetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPets(Math.max(0, value));
    triggerSave();
  };

  if (isInitialLoading) {
    return (
      <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Huishouden</h2>
              <p className="text-xs text-muted-foreground">Bewoners en huisdieren</p>
            </div>
          </div>
          <AutosaveIndicator status={status} />
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
              onChange={handleAdultsChange}
              className="rounded-xl h-11"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Kinderen</Label>
            <Input
              type="number"
              min="0"
              value={children}
              onChange={handleChildrenChange}
              className="rounded-xl h-11"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Huisdieren</Label>
            <Input
              type="number"
              min="0"
              value={pets}
              onChange={handlePetsChange}
              className="rounded-xl h-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
