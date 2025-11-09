import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

type ShareMovingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Collaborator = {
  id: string;
  collaborator_email: string;
  accepted_at: string | null;
};

export const ShareMovingDialog = ({ open, onOpenChange }: ShareMovingDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCollaborators();
    }
  }, [open]);

  const loadCollaborators = async () => {
    setLoadingCollaborators(true);
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
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Voer een e-mailadres in",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Ongeldig e-mailadres",
        description: "Voer een geldig e-mailadres in.",
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

      // Check if email is already invited
      const { data: existing } = await supabase
        .from("moving_collaborators")
        .select("*")
        .eq("owner_user_id", user.id)
        .eq("collaborator_email", email.toLowerCase())
        .single();

      if (existing) {
        toast({
          title: "Al uitgenodigd",
          description: "Dit e-mailadres is al uitgenodigd.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from("moving_collaborators").insert({
        owner_user_id: user.id,
        collaborator_email: email.toLowerCase(),
      });

      if (error) throw error;

      toast({
        title: "Uitnodiging verstuurd!",
        description: `${email} kan nu je verhuizing bekijken en bewerken.`,
      });

      setEmail("");
      loadCollaborators();
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast({
        title: "Fout bij uitnodigen",
        description: "De uitnodiging kon niet worden verstuurd. Probeer het opnieuw.",
        variant: "destructive",
      });
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

      toast({
        title: "Toegang ingetrokken",
        description: "De gebruiker heeft geen toegang meer tot je verhuizing.",
      });

      loadCollaborators();
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        title: "Fout bij verwijderen",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verhuizing delen</DialogTitle>
          <DialogDescription>
            Nodig partners of huisgenoten uit om samen de verhuizing te plannen
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleInvite}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@voorbeeld.nl"
                  maxLength={255}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {loadingCollaborators ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : collaborators.length > 0 ? (
              <div className="space-y-2">
                <Label>Gedeeld met</Label>
                <div className="space-y-2">
                  {collaborators.map((collab) => (
                    <Card key={collab.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{collab.collaborator_email}</span>
                          {!collab.accepted_at && (
                            <Badge variant="outline" className="text-xs">
                              In afwachting
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemove(collab.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Je hebt deze verhuizing nog niet gedeeld
              </p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Sluiten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};