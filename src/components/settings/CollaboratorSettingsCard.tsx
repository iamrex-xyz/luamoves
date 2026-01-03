import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Check, Trash2, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { validateEmail as validateEmailUtil, cleanEmail } from "@/lib/validation";

type Collaborator = {
  id: string;
  collaborator_email: string;
  collaborator_user_id: string | null;
  accepted_at: string | null;
  invited_at: string;
};

type HouseholdMember = {
  id: string;
  name: string | null;
  phone: string;
  member_user_id: string | null;
  accepted_at: string | null;
  status: string;
};

export const CollaboratorSettingsCard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load email-based collaborators
      const { data: emailData, error: emailError } = await supabase
        .from("moving_collaborators")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("invited_at", { ascending: false });

      if (emailError) throw emailError;
      setCollaborators(emailData || []);

      // Load phone-based household members
      const { data: householdData, error: householdError } = await supabase
        .from("household_members")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (householdError) throw householdError;
      setHouseholdMembers(householdData || []);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const validateEmail = (value: string) => {
    const result = validateEmailUtil(value);
    setEmailError(result.error);
    return result.isValid;
  };

  const handleInvite = async () => {
    if (!newCollaboratorEmail) return;
    
    if (!validateEmail(newCollaboratorEmail)) {
      toast({ title: "Fout", description: "Voer een geldig e-mailadres in.", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("moving_collaborators")
        .insert({
          owner_user_id: user.id,
          collaborator_email: cleanEmail(newCollaboratorEmail),
          collaborator_user_id: null,
        });

      if (error) throw error;

      toast({ title: "Uitnodiging verzonden", description: `${newCollaboratorEmail} is uitgenodigd.` });
      setNewCollaboratorEmail("");
      setEmailError(null);
      loadCollaborators();
    } catch (error) {
      console.error("Error inviting:", error);
      toast({ title: "Fout", description: "Kon uitnodiging niet verzenden.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from("moving_collaborators")
        .delete()
        .eq("id", collaboratorId);

      if (error) throw error;

      toast({ title: "Verwijderd", description: "Medeverhuizer is verwijderd." });
      loadCollaborators();
    } catch (error) {
      console.error("Error removing:", error);
      toast({ title: "Fout", description: "Kon medeverhuizer niet verwijderen.", variant: "destructive" });
    }
  };

  const handleRemoveHouseholdMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({ title: "Verwijderd", description: "Medeverhuizer is verwijderd." });
      loadCollaborators();
    } catch (error) {
      console.error("Error removing:", error);
      toast({ title: "Fout", description: "Kon medeverhuizer niet verwijderen.", variant: "destructive" });
    }
  };

  if (isInitialLoading) {
    return (
      <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-11 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Medeverhuizers</h2>
            <p className="text-xs text-muted-foreground">Nodig anderen uit om mee te helpen</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex gap-2 items-center">
            <Input
              type="email"
              placeholder="E-mailadres"
              value={newCollaboratorEmail}
              onChange={(e) => {
                setNewCollaboratorEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => newCollaboratorEmail && validateEmail(newCollaboratorEmail)}
              className={cn("flex-1 rounded-full h-11", emailError && "border-destructive")}
            />
            <Button 
              onClick={handleInvite} 
              disabled={isLoading || !newCollaboratorEmail || !!emailError}
              size="icon"
              className="rounded-full h-11 w-11 shrink-0 bg-orange-200 hover:bg-orange-300 text-orange-700"
            >
              <Mail className="w-4 h-4" />
            </Button>
          </div>
          {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
        </div>

        {/* Phone-based household members */}
        {householdMembers.length > 0 && (
          <div className="space-y-2">
            {householdMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name || member.phone}</p>
                    {member.name && (
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    )}
                    <div className="flex items-center gap-1">
                      {member.accepted_at ? (
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
                  onClick={() => handleRemoveHouseholdMember(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Email-based collaborators */}
        {collaborators.length > 0 && (
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div key={collab.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
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
                  onClick={() => handleRemove(collab.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
