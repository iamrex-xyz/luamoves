import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  LogOut,
  Home as HomeIcon,
  Calendar,
  Users,
  PawPrint,
  Trash2,
  Mail,
  Check,
  X,
  Settings as SettingsIcon,
} from "lucide-react";

type SettingsProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
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

const PET_TYPES = [
  { value: "dog", label: "Hond" },
  { value: "cat", label: "Kat" },
  { value: "other", label: "Anders" },
];

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
  const [petTypes, setPetTypes] = useState<string[]>([]);
  const [newPetType, setNewPetType] = useState("");
  
  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");

  useEffect(() => {
    loadProfile();
    loadCollaborators();
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
        setAdults(profile.adults || 1);
        setChildren(profile.children || 0);
        setPetTypes(profile.pet_types || []);
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

  const handleSaveMovingInfo = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Convert date objects to strings
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

      const { error } = await supabase
        .from("profiles")
        .update({
          adults,
          children,
          pets: petTypes.length,
          pet_types: petTypes,
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

  const handleRemovePet = (petType: string) => {
    setPetTypes(petTypes.filter(p => p !== petType));
  };

  const handleInviteCollaborator = async () => {
    if (!newCollaboratorEmail) return;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user exists with this email
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase
        .from("moving_collaborators")
        .insert({
          owner_user_id: user.id,
          collaborator_email: newCollaboratorEmail,
          collaborator_user_id: null, // Will be filled when they sign up
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
    <div className="min-h-screen pb-20 bg-background">
      {/* Unified Header */}
      <header className="bg-primary text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Instellingen</h1>
                <p className="text-white/80 text-xs">Beheer je verhuizing</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="text-white hover:bg-white/10 h-10 w-10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Moving Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HomeIcon className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold">Verhuizing details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="oldAddress">Oud adres</Label>
              <AddressAutocomplete
                label=""
                placeholder="Begin met typen..."
                value={oldAddress}
                onChange={setOldAddress}
              />
            </div>

            <div>
              <Label htmlFor="newAddress">Nieuw adres</Label>
              <AddressAutocomplete
                label=""
                placeholder="Begin met typen..."
                value={newAddress}
                onChange={setNewAddress}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="movingDate">Verhuisdatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !movingDateObj && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {movingDateObj ? format(movingDateObj, "dd-MM-yyyy") : <span>Selecteer datum</span>}
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
                <Label htmlFor="keyHandoverDate">Sleuteloverdracht</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !keyHandoverDateObj && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {keyHandoverDateObj ? format(keyHandoverDateObj, "dd-MM-yyyy") : <span>Selecteer datum</span>}
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
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="renovationType">Verbouwing type</Label>
              <Select value={renovationType} onValueChange={(value) => setRenovationType(value as "none" | "small" | "large")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geen verbouwing</SelectItem>
                  <SelectItem value="small">Kleine verbouwing</SelectItem>
                  <SelectItem value="large">Grote verbouwing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="contractorHelp"
                checked={needsContractorHelp}
                onChange={(e) => setNeedsContractorHelp(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="contractorHelp">Hulp nodig van aannemer</Label>
            </div>

            <Button onClick={handleSaveMovingInfo} disabled={isLoading} className="w-full">
              Verhuizing opslaan
            </Button>
          </div>
        </Card>

        {/* Household */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold">Huishouden</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adults">Volwassenen</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="children">Kinderen</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <PawPrint className="w-4 h-4 text-primary" />
                <Label>Huisdieren</Label>
              </div>

              <div className="mb-3">
                <Select value={newPetType} onValueChange={(value) => {
                  if (value) {
                    setPetTypes([...petTypes, value]);
                    setNewPetType("");
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer diersoort" />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_TYPES.map((pet) => (
                      <SelectItem key={pet.value} value={pet.value}>
                        {pet.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                {petTypes.map((petType) => {
                  const pet = PET_TYPES.find(p => p.value === petType);
                  return (
                    <Badge key={petType} variant="secondary" className="flex items-center gap-1">
                      <PawPrint className="w-3 h-3" />
                      {pet?.label || petType}
                      <button
                        onClick={() => handleRemovePet(petType)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Button onClick={handleSaveHousehold} disabled={isLoading} className="w-full">
              Huishouden opslaan
            </Button>
          </div>
        </Card>

        {/* Collaborators */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold">Partners of huisgenoten</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="E-mailadres van huisgenoot"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInviteCollaborator()}
              />
              <Button onClick={handleInviteCollaborator} disabled={isLoading}>
                Uitnodigen
              </Button>
            </div>

            <div className="space-y-2">
              {collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nog geen huisgenoten toegevoegd
                </p>
              ) : (
                collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{collab.collaborator_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {collab.accepted_at ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-3 h-3" />
                              Geaccepteerd
                            </span>
                          ) : (
                            "Uitnodiging verstuurd"
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborator(collab.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <BottomNav currentView="settings" onNavigate={onNavigate} />
    </div>
  );
};