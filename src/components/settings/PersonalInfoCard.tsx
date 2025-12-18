import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Phone, Cake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { validatePhone as validatePhoneUtil, cleanPhone } from "@/lib/validation";

export const PersonalInfoCard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthDateObj, setBirthDateObj] = useState<Date | undefined>(undefined);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, birth_date")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setPhone(profile.phone || "");
        if (profile.birth_date) {
          setBirthDate(profile.birth_date);
          setBirthDateObj(new Date(profile.birth_date));
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const validatePhone = (value: string) => {
    const result = validatePhoneUtil(value);
    setPhoneError(result.error);
    return result.isValid;
  };

  const handleSave = async () => {
    if (phone && !validatePhone(phone)) {
      toast({ title: "Fout", description: "Corrigeer het telefoonnummer.", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const birthDateStr = birthDateObj ? format(birthDateObj, "yyyy-MM-dd") : birthDate;
      const cleanedPhone = cleanPhone(phone);

      const { error } = await supabase
        .from("profiles")
        .update({ phone: cleanedPhone || null, birth_date: birthDateStr || null })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "Opgeslagen", description: "Persoonlijke gegevens zijn bijgewerkt." });
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Fout", description: "Kon persoonlijke gegevens niet opslaan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Persoonlijke gegevens</h2>
            <p className="text-xs text-muted-foreground">Contact en geboortedatum</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Telefoonnummer</Label>
          <Input
            type="tel"
            placeholder="06 12345678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError) validatePhone(e.target.value);
            }}
            onBlur={() => phone && validatePhone(phone)}
            className={cn("rounded-xl h-11", phoneError && "border-destructive")}
          />
          {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Geboortedatum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal rounded-xl h-11", !birthDateObj && "text-muted-foreground")}
              >
                <Cake className="mr-2 h-4 w-4" />
                {birthDateObj ? format(birthDateObj, "dd-MM-yyyy") : "Selecteer"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
              <CalendarComponent
                mode="single"
                selected={birthDateObj}
                onSelect={(date) => {
                  setBirthDateObj(date);
                  if (date) setBirthDate(format(date, "yyyy-MM-dd"));
                }}
                disabled={(date) => date > new Date()}
                defaultMonth={birthDateObj || new Date(1990, 0, 1)}
                initialFocus
                className="pointer-events-auto"
                captionLayout="dropdown-buttons"
                fromYear={1920}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleSave} disabled={isLoading || !!phoneError} className="w-full rounded-xl h-11">
          Opslaan
        </Button>
      </div>
    </div>
  );
};
