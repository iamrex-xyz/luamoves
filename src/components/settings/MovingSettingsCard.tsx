import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Home as HomeIcon, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { validateAddressPostcode, isSameAddress as checkSameAddress } from "@/lib/validation";
import { useAutosave } from "@/hooks/useAutosave";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";

type MovingSettingsCardProps = {
  movingInfo: MovingInfo;
  onUpdate: (info: MovingInfo) => void;
};

export const MovingSettingsCard = ({ movingInfo, onUpdate }: MovingSettingsCardProps) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [oldAddressError, setOldAddressError] = useState<string | null>(null);
  const [newAddressError, setNewAddressError] = useState<string | null>(null);
  
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

  const saveToDatabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Only validate if addresses have values
    if (oldAddress) {
      const result = validateAddressPostcode(oldAddress);
      if (!result.isValid) throw new Error("Invalid old address");
    }
    if (newAddress) {
      const result = validateAddressPostcode(newAddress);
      if (!result.isValid) throw new Error("Invalid new address");
    }

    // Check for same address
    if (oldAddress && newAddress && checkSameAddress(oldAddress, newAddress)) {
      throw new Error("Same address");
    }

    const movingDateStr = movingDateObj ? format(movingDateObj, "yyyy-MM-dd") : movingDate;
    const keyHandoverDateStr = keyHandoverDateObj ? format(keyHandoverDateObj, "yyyy-MM-dd") : keyHandoverDate;

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          old_address: oldAddress || null,
          new_address: newAddress || null,
          moving_date: movingDateStr || null,
          key_handover_date: keyHandoverDateStr || null,
          renovation_type: renovationType,
        } as any,
        { onConflict: "user_id" }
      );

    if (error) throw error;

    // Update parent state
    onUpdate({
      ...movingInfo,
      oldAddress,
      newAddress,
      movingDate: movingDateStr,
      keyHandoverDate: keyHandoverDateStr || undefined,
      renovationType: renovationType as "none" | "small" | "large",
    });
  }, [oldAddress, newAddress, movingDate, movingDateObj, keyHandoverDate, keyHandoverDateObj, renovationType, movingInfo, onUpdate]);

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
    } finally {
      setIsInitialLoading(false);
    }
  };

  const validatePostcode = (address: string, setError: (error: string | null) => void) => {
    const result = validateAddressPostcode(address);
    setError(result.error);
    return result.isValid;
  };

  const handleOldAddressChange = (value: string) => {
    setOldAddress(value);
    if (oldAddressError) validatePostcode(value, setOldAddressError);
    // Only trigger autosave if valid or empty
    if (!value || validateAddressPostcode(value).isValid) {
      triggerSave();
    }
  };

  const handleNewAddressChange = (value: string) => {
    setNewAddress(value);
    if (newAddressError) validatePostcode(value, setNewAddressError);
    // Only trigger autosave if valid or empty
    if (!value || validateAddressPostcode(value).isValid) {
      triggerSave();
    }
  };

  const handleMovingDateSelect = (date: Date | undefined) => {
    setMovingDateObj(date);
    if (date) setMovingDate(format(date, "yyyy-MM-dd"));
    triggerSave();
  };

  const handleKeyHandoverDateSelect = (date: Date | undefined) => {
    setKeyHandoverDateObj(date);
    if (date) setKeyHandoverDate(format(date, "yyyy-MM-dd"));
    triggerSave();
  };

  const handleRenovationTypeChange = (value: string) => {
    setRenovationType(value as "none" | "small" | "large");
    triggerSave();
  };

  const isSameAddress = () => checkSameAddress(oldAddress, newAddress);

  const isKeyHandoverAfterMoving = () => {
    if (!keyHandoverDateObj || !movingDateObj) return false;
    return keyHandoverDateObj > movingDateObj;
  };

  const isKeyHandoverInPast = () => {
    if (!keyHandoverDateObj) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return keyHandoverDateObj < today;
  };

  if (isInitialLoading) {
    return (
      <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
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
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Verhuizing details</h2>
              <p className="text-xs text-muted-foreground">Adressen en datums</p>
            </div>
          </div>
          <AutosaveIndicator status={status} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Oud adres</Label>
          <AddressAutocomplete 
            label="" 
            placeholder="Begin met typen..." 
            value={oldAddress} 
            onChange={handleOldAddressChange}
          />
          {oldAddressError && <p className="text-xs text-destructive mt-1">{oldAddressError}</p>}
          {!oldAddressError && isSameAddress() && (
            <p className="text-xs text-amber-600 mt-1">
              Dit adres is hetzelfde als je nieuwe adres. Misschien per ongeluk verkeerd ingevuld?
            </p>
          )}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nieuw adres</Label>
          <AddressAutocomplete 
            label="" 
            placeholder="Begin met typen..." 
            value={newAddress} 
            onChange={handleNewAddressChange}
          />
          {newAddressError && <p className="text-xs text-destructive mt-1">{newAddressError}</p>}
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
                  onSelect={handleMovingDateSelect}
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
                  onSelect={handleKeyHandoverDateSelect}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    // Disable dates in the past and after moving date
                    if (date < today) return true;
                    if (movingDateObj && date > movingDateObj) return true;
                    return false;
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {isKeyHandoverInPast() && <p className="text-xs text-destructive mt-1">Kan niet in het verleden liggen</p>}
            {!isKeyHandoverInPast() && isKeyHandoverAfterMoving() && <p className="text-xs text-destructive mt-1">Kan niet na verhuisdatum</p>}
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verbouwing</Label>
          <Select value={renovationType} onValueChange={handleRenovationTypeChange}>
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
      </div>
    </div>
  );
};
