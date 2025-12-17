import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { ReminderSettingsListItem, ReminderSettingsSheet } from "@/components/ReminderSettings";
import { ExtraInfoSheet } from "@/components/ExtraInfoSheet";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Home as HomeIcon,
  Calendar,
  Users,
  Trash2,
  Mail,
  Check,
  ChevronRight,
  MapPin,
  UserPlus,
  Phone,
  Cake,
  Sparkles,
} from "lucide-react";

type SettingsProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  onLogout: () => void;
  onUpdate: (info: MovingInfo) => void;
};

type Collaborator = {
  id: string;
  collaborator_email: string;
  collaborator_user_id: string | null;
  accepted_at: string | null;
  invited_at: string;
};

export const Settings = ({ movingInfo, onNavigate, onLogout, onUpdate }: SettingsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Moving settings state
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
  const [needsContractorHelp, setNeedsContractorHelp] = useState(movingInfo.needsContractorHelp || false);
  
  // Household state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);
  
  // Personal info state
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthDateObj, setBirthDateObj] = useState<Date | undefined>(undefined);
  
  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  
  // Partner consent state
  const [partnerConsent, setPartnerConsent] = useState(false);
  const CONSENT_KEY = "partnerConsent";
  
  // Sheet states
  const [reminderSheetOpen, setReminderSheetOpen] = useState(false);
  const [extraInfoSheetOpen, setExtraInfoSheetOpen] = useState(false);

  useEffect(() => {
    loadProfile();
    loadCollaborators();
    setPartnerConsent(localStorage.getItem(CONSENT_KEY) === "true");
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        // Household data
        setAdults(profile.adults || 1);
        setChildren(profile.children || 0);
        setPets(profile.pets || 0);
        
        // Personal info
        setPhone(profile.phone || "");
        if (profile.birth_date) {
          setBirthDate(profile.birth_date);
          setBirthDateObj(new Date(profile.birth_date));
        }
        
        // Moving info from profile (set during signup)
        if (profile.old_address && !oldAddress) {
          setOldAddress(profile.old_address);
        }
        if (profile.key_handover_date && !keyHandoverDate) {
          setKeyHandoverDate(profile.key_handover_date);
          setKeyHandoverDateObj(new Date(profile.key_handover_date));
        }
        if (profile.renovation_type && renovationType === "none") {
          setRenovationType(profile.renovation_type as "none" | "small" | "large");
        }
        if (profile.new_address && !newAddress) {
          setNewAddress(profile.new_address);
        }
        if (profile.moving_date && !movingDate) {
          setMovingDate(profile.moving_date);
          setMovingDateObj(new Date(profile.moving_date));
        }
        if (profile.moving_type && !movingInfo.type) {
          // Update movingInfo with type from profile
          onUpdate({
            ...movingInfo,
            type: profile.moving_type as "rent" | "buy",
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadCollaborators = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("moving_collaborators")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("invited_at", { ascending: false });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    }
  };

  // Extract postcode and house number from addresses for validation
  const extractAddressParts = (address: string) => {
    // Try to extract postcode (format: 1234AB or 1234 AB)
    const postcodeMatch = address.match(/\b(\d{4}\s?[A-Za-z]{2})\b/);
    // Try to extract house number
    const houseNumberMatch = address.match(/\b(\d+)\b/);
    return {
      postcode: postcodeMatch ? postcodeMatch[1].replace(/\s/g, '').toUpperCase() : '',
      houseNumber: houseNumberMatch ? houseNumberMatch[1] : ''
    };
  };

  const isSameAddress = () => {
    const oldParts = extractAddressParts(oldAddress);
    const newParts = extractAddressParts(newAddress);
    
    // Check if both have valid postcode and house number, and they're the same
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

  const handleSaveMovingInfo = async () => {
    // Validate before saving
    if (isSameAddress()) {
      toast({
        title: "Fout",
        description: "Het oude adres mag niet hetzelfde zijn als het nieuwe adres.",
        variant: "destructive",
      });
      return;
    }

    if (isKeyHandoverAfterMoving()) {
      toast({
        title: "Fout",
        description: "De sleuteloverdracht kan niet na de verhuisdatum liggen.",
        variant: "destructive",
      });
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
          needs_contractor_help: needsContractorHelp,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      onUpdate({
        oldAddress,
        newAddress,
        movingDate: movingDateStr,
        keyHandoverDate: keyHandoverDateStr || undefined,
        type: movingInfo.type,
        renovationType: renovationType as "none" | "small" | "large",
        needsContractorHelp,
      });

      toast({
        title: "Opgeslagen",
        description: "Verhuizing details zijn bijgewerkt.",
      });
    } catch (error) {
      console.error("Error saving moving info:", error);
      toast({
        title: "Fout",
        description: "Kon verhuizing details niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHousehold = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const birthDateStr = birthDateObj ? format(birthDateObj, "yyyy-MM-dd") : birthDate;
      
      const { error } = await supabase
        .from("profiles")
        .update({
          adults,
          children,
          pets,
          phone: phone || null,
          birth_date: birthDateStr || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Opgeslagen",
        description: "Huishouden details zijn bijgewerkt.",
      });
    } catch (error) {
      console.error("Error saving household:", error);
      toast({
        title: "Fout",
        description: "Kon huishouden details niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleInviteCollaborator = async () => {
    if (!newCollaboratorEmail) return;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("moving_collaborators")
        .insert({
          owner_user_id: user.id,
          collaborator_email: newCollaboratorEmail,
          collaborator_user_id: null,
        });

      if (error) throw error;

      toast({
        title: "Uitnodiging verzonden",
        description: `${newCollaboratorEmail} is uitgenodigd.`,
      });

      setNewCollaboratorEmail("");
      loadCollaborators();
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast({
        title: "Fout",
        description: "Kon uitnodiging niet verzenden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from("moving_collaborators")
        .delete()
        .eq("id", collaboratorId);

      if (error) throw error;

      toast({
        title: "Verwijderd",
        description: "Huisgenoot is verwijderd.",
      });

      loadCollaborators();
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        title: "Fout",
        description: "Kon huisgenoot niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
            <p className="text-sm text-muted-foreground mt-0.5">Instellingen</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-10 w-10 rounded-full hover:bg-secondary"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Moving Details Card */}
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
              <AddressAutocomplete
                label=""
                placeholder="Begin met typen..."
                value={oldAddress}
                onChange={setOldAddress}
              />
              {isSameAddress() && (
                <p className="text-xs text-destructive mt-1">Oud adres mag niet hetzelfde zijn als nieuw adres</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nieuw adres</Label>
              <AddressAutocomplete
                label=""
                placeholder="Begin met typen..."
                value={newAddress}
                onChange={setNewAddress}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verhuisdatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl h-11 text-xs",
                        !movingDateObj && "text-muted-foreground"
                      )}
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
                {isKeyHandoverAfterMoving() && (
                  <p className="text-xs text-destructive mt-1">Kan niet na verhuisdatum</p>
                )}
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

            <Button onClick={handleSaveMovingInfo} disabled={isLoading || hasValidationErrors} className="w-full rounded-xl h-11">
              Opslaan
            </Button>
          </div>
        </div>

        {/* Household Card */}
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

            <Button onClick={handleSaveHousehold} disabled={isLoading} className="w-full rounded-xl h-11">
              Opslaan
            </Button>
          </div>
        </div>

        {/* Personal Info Card */}
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
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Geboortedatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl h-11",
                      !birthDateObj && "text-muted-foreground"
                    )}
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

            <Button onClick={handleSaveHousehold} disabled={isLoading} className="w-full rounded-xl h-11">
              Opslaan
            </Button>
          </div>
        </div>

        {/* Extra Info Button */}
        <button
          onClick={() => setExtraInfoSheetOpen(true)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">Extra info over je verhuizing</p>
            <p className="text-xs text-muted-foreground">Energie, woning, internet & meer</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Collaborators Card */}
        <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Huisgenoten</h2>
                <p className="text-xs text-muted-foreground">Nodig anderen uit</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="E-mailadres"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                className="flex-1 rounded-xl h-11"
              />
              <Button 
                onClick={handleInviteCollaborator} 
                disabled={isLoading || !newCollaboratorEmail}
                className="rounded-xl h-11 px-4"
              >
                <Mail className="w-4 h-4 mr-2" />
                Uitnodigen
              </Button>
            </div>

            {collaborators.length > 0 && (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div 
                    key={collab.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{collab.collaborator_email}</p>
                        <div className="flex items-center gap-1">
                          {collab.accepted_at ? (
                            <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                              <Check className="w-3 h-3 mr-1" />
                              Geaccepteerd
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                              Uitgenodigd
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveCollaborator(collab.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Other Settings */}
        <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
          <div className="p-4 space-y-1">
            <ReminderSettingsListItem onClick={() => setReminderSheetOpen(true)} />
          </div>
        </div>

        <ReminderSettingsSheet open={reminderSheetOpen} onOpenChange={setReminderSheetOpen} />
        <ExtraInfoSheet 
          open={extraInfoSheetOpen} 
          onOpenChange={setExtraInfoSheetOpen}
          movingInfo={movingInfo}
          onUpdate={onUpdate}
        />
      </div>

      <BottomNav currentView="settings" onNavigate={onNavigate} />
    </div>
  );
};
