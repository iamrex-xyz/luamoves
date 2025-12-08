import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Heart, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SignupPromptDialog } from "@/components/SignupPromptDialog";
import { z } from "zod";

const emailSchema = z.string().trim().email();

type InvitePartnerSectionProps = {
  isGuest?: boolean;
  onSignupComplete?: () => void;
};

export const InvitePartnerSection = ({ isGuest, onSignupComplete }: InvitePartnerSectionProps) => {
  const { toast } = useToast();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleInviteClick = () => {
    if (isGuest) {
      setShowSignupPrompt(true);
    } else {
      setShowInviteForm(true);
    }
  };

  const handleInvitePartner = async () => {
    const validation = emailSchema.safeParse(partnerEmail);
    if (!validation.success) {
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
      if (!user) throw new Error("Niet ingelogd");

      // Check if already invited
      const { data: existing } = await supabase
        .from("moving_collaborators")
        .select("id")
        .eq("owner_user_id", user.id)
        .eq("collaborator_email", partnerEmail)
        .single();

      if (existing) {
        toast({
          title: "Al uitgenodigd",
          description: "Deze persoon is al uitgenodigd.",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from("moving_collaborators")
        .insert({
          owner_user_id: user.id,
          collaborator_email: partnerEmail,
        });

      if (error) throw error;

      setInvited(true);
      toast({
        title: "Uitnodiging verstuurd! 🎉",
        description: `${partnerEmail} kan nu meedoen aan je verhuizing.`,
      });

      setPartnerEmail("");
      setShowInviteForm(false);
    } catch (error: any) {
      console.error("Error inviting partner:", error);
      toast({
        title: "Fout bij uitnodigen",
        description: error.message || "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupComplete = () => {
    setShowSignupPrompt(false);
    onSignupComplete?.();
    // After signup, show the invite form
    setShowInviteForm(true);
  };

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-full shrink-0">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-pink-900 dark:text-pink-100">
              Samen verhuizen?
            </h3>
            <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">
              Nodig je partner of huisgenoot uit om taken te verdelen en samen de verhuizing te plannen.
            </p>

            {showInviteForm ? (
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="partner-email" className="text-pink-800 dark:text-pink-200">
                    E-mailadres van je partner
                  </Label>
                  <Input
                    id="partner-email"
                    type="email"
                    placeholder="partner@email.nl"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvitePartner()}
                    className="bg-white dark:bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInvitePartner} 
                    disabled={isLoading}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verzenden...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Uitnodigen
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowInviteForm(false)}
                    className="text-pink-700 dark:text-pink-300"
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            ) : invited ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <Check className="w-4 h-4" />
                Partner uitgenodigd!
              </div>
            ) : (
              <Button 
                onClick={handleInviteClick}
                variant="outline"
                className="mt-3 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/50"
              >
                <Users className="w-4 h-4 mr-2" />
                Partner uitnodigen
              </Button>
            )}
          </div>
        </div>
      </Card>

      <SignupPromptDialog
        open={showSignupPrompt}
        onOpenChange={setShowSignupPrompt}
        onSignupComplete={handleSignupComplete}
      />
    </>
  );
};
