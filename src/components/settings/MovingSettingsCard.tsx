import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Home as HomeIcon, Calendar } from "lucide-react";

type MovingSettingsCardProps = {
  movingInfo: MovingInfo;
  onUpdate: (info: MovingInfo) => void;
};

export const MovingSettingsCard = ({ movingInfo, onUpdate }: MovingSettingsCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [oldAddress, setOldAddress] = useState(movingInfo.oldAddress);
  const [newAddress, setNewAddress] = useState(movingInfo.newAddress);
  const [movingDate, setMovingDate] = useState(movingInfo.movingDate);
  const [movingDateObj, setMovingDateObj] = useState<Date | undefined>(
    movingInfo.movingDate ? new Date(movingInfo.movingDate) : undefined
  );
  const [keyHandoverDate, setKeyHandoverDate] = useState(movingInfo.keyHandoverDate || "");
  const [keyHandoverDateObj, setKeyHandoverDateObj] = useState<Date | undefined>(
    movingInfo.keyHandoverDate ? new Date(movingInfo.keyHandoverDate) : undefined
  );
  const [renovationType, setRenovationType] = useState(movingInfo.renovationType || "none");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("old_address, new_address, moving_date, key_handover_date, renovation_type")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        if (profile.old_address && !oldAddress) setOldAddress(profile.old_address);
        if (profile.new_address && !newAddress) setNewAddress(profile.new_address);
        if (profile.moving_date && !movingDate) {
          setMovingDate(profile.moving_date);
          setMovingDateObj(new Date(profile.moving_date));
        }
        if (profile.key_handover_date && !keyHandoverDate) {
          setKeyHandoverDate(profile.key_handover_date);
          setKeyHandoverDateObj(new Date(profile.key_handover_date));
        }
        if (profile.renovation_type) {
          setRenovationType(profile.renovation_type as "none" | "small" | "large");
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const extractAddressParts = (address: string) => {
    const postcodeMatch = address.match(/\b(\d{4}\s?[A-Za-z]{2})\b/);
    const houseNumberMatch = address.match(/\b(\d+)\b/);
    return {
      postcode: postcodeMatch ? postcodeMatch[1].replace(/\s/g, '').toUpperCase() : '',
      houseNumber: houseNumberMatch ? houseNumberMatch[1] : ''
    };
  };

  const isSameAddress = () => {
    const oldParts = extractAddressParts(oldAddress);
    const newParts = extractAddressParts(newAddress);
    if (oldParts.postcode && newParts.postcode && oldParts.houseNumber && newParts.houseNumber) {
      return oldParts.postcode === newParts.postcode && oldParts.houseNumber === newParts.houseNumber;
    }
    return false;
  };

  const isKeyHandoverAfterMoving = () => {
    if (!keyHandoverDateObj || !movingDateObj) return false;
    return keyHandoverDateObj > movingDateObj;
  };

  const hasValidationErrors = isSameAddress() || isKeyHandoverAfterMoving();

  const handleSave = async () => {
    if (isSameAddress()) {
      toast({ title: "Fout", description: "Het oude adres mag niet hetzelfde zijn als het nieuwe adres.", variant: "destructive" });
      return;
    }

    if (isKeyHandoverAfterMoving()) {
      toast({ title: "Fout", description: "De sleuteloverdracht kan niet na de verhuisdatum liggen.", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const movingDateStr = movingDateObj ? format(movingDateObj, "yyyy-MM-dd") : movingDate;
      const keyHandoverDateStr = keyHandoverDateObj ? format(keyHandoverDateObj, "yyyy-MM-dd") : keyHandoverDate;

      const { error } = await supabase
        .from("profiles")
        .update({
          old_address: oldAddress,
          new_address: newAddress,
          moving_date: movingDateStr,
          key_handover_date: keyHandoverDateStr || null,
          renovation_type: renovationType,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      onUpdate({
        ...movingInfo,
        oldAddress,
        newAddress,
        movingDate: movingDateStr,
        keyHandoverDate: keyHandoverDateStr || undefined,
        renovationType: renovationType as "none" | "small" | "large",
      });

      toast({ title: "Opgeslagen", description: "Verhuizing details zijn bijgewerkt." });
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Fout", description: "Kon verhuizing details niet opslaan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Verhuizing details</h2>
            <p className="text-xs text-muted-foreground">Adressen en datums</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Oud adres</Label>
          <AddressAutocomplete label="" placeholder="Begin met typen..." value={oldAddress} onChange={setOldAddress} />
          {isSameAddress() && <p className="text-xs text-destructive mt-1">Oud adres mag niet hetzelfde zijn als nieuw adres</p>}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nieuw adres</Label>
          <AddressAutocomplete label="" placeholder="Begin met typen..." value={newAddress} onChange={setNewAddress} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verhuisdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal rounded-xl h-11 text-xs", !movingDateObj && "text-muted-foreground")}
                >
                  <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{movingDateObj ? format(movingDateObj, "dd-MM-yyyy") : "Selecteer"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={movingDateObj}
                  onSelect={(date) => {
                    setMovingDateObj(date);
                    if (date) setMovingDate(format(date, "yyyy-MM-dd"));
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Sleuteloverdracht</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl h-11 text-xs",
                    !keyHandoverDateObj && "text-muted-foreground",
                    isKeyHandoverAfterMoving() && "border-destructive"
                  )}
                >
                  <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{keyHandoverDateObj ? format(keyHandoverDateObj, "dd-MM-yyyy") : "Selecteer"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={keyHandoverDateObj}
                  onSelect={(date) => {
                    setKeyHandoverDateObj(date);
                    if (date) setKeyHandoverDate(format(date, "yyyy-MM-dd"));
                  }}
                  disabled={(date) => movingDateObj ? date > movingDateObj : false}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {isKeyHandoverAfterMoving() && <p className="text-xs text-destructive mt-1">Kan niet na verhuisdatum</p>}
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verbouwing</Label>
          <Select value={renovationType} onValueChange={(value) => setRenovationType(value as "none" | "small" | "large")}>
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Geen verbouwing</SelectItem>
              <SelectItem value="small">Kleine verbouwing</SelectItem>
              <SelectItem value="large">Grote verbouwing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={isLoading || hasValidationErrors} className="w-full rounded-xl h-11">
          Opslaan
        </Button>
      </div>
    </div>
  );
};
