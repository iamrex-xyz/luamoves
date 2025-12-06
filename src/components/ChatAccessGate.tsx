import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, LogIn, UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CollaboratorChat } from "./CollaboratorChat";

type ChatAccessGateProps = {
  onLogin: () => void;
  onAddPartner: () => void;
};

export const ChatAccessGate = ({ onLogin, onAddPartner }: ChatAccessGateProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCollaborators, setHasCollaborators] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      // Check if user has collaborators
      const { count, error } = await supabase
        .from("moving_collaborators")
        .select("*", { count: "exact", head: true })
        .eq("owner_user_id", user.id);

      if (error) throw error;

      setHasCollaborators((count || 0) > 0);
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center rounded-2xl bg-secondary/30">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Laden...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-8 text-center rounded-2xl bg-secondary/30">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground">Maak een account om te chatten</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Je moet ingelogd zijn om met huisgenoten te kunnen chatten.
        </p>
        <Button onClick={onLogin} className="rounded-full">
          Inloggen / Account aanmaken
        </Button>
      </div>
    );
  }

  if (!hasCollaborators) {
    return (
      <div className="p-8 text-center rounded-2xl bg-secondary/30">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground">Voeg een huisgenoot toe</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Je kunt alleen chatten als er iemand is toegevoegd aan je verhuisgroep.
        </p>
        <Button onClick={onAddPartner} className="rounded-full">
          Huisgenoot toevoegen
        </Button>
      </div>
    );
  }

  return <CollaboratorChat />;
};
