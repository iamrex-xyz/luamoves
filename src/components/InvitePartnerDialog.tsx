import { useState } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, MessageCircle, Check, Loader2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type InvitePartnerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent: () => void;
};

export const InvitePartnerDialog = ({
  open,
  onOpenChange,
  onInviteSent,
}: InvitePartnerDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [livingAlone, setLivingAlone] = useState<boolean | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLivingChoice = (alone: boolean) => {
    setLivingAlone(alone);
    if (alone) {
      // Close dialog, no partner needed
      toast({
        title: "Prima! 👍",
        description: "Je kunt altijd later iemand uitnodigen via Instellingen.",
      });
      onOpenChange(false);
    } else {
      // Show phone input
      setStep(2);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, "");
    
    // Handle Dutch mobile numbers
    if (cleaned.startsWith("06")) {
      cleaned = "31" + cleaned.substring(1);
    } else if (cleaned.startsWith("316")) {
      // Already in correct format
    } else if (cleaned.startsWith("0031")) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith("+31")) {
      cleaned = cleaned.substring(1);
    }
    
    return "+" + cleaned;
  };

  const handleInvite = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Vul een telefoonnummer in",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Je moet ingelogd zijn",
          description: "Log eerst in om iemand uit te nodigen.",
          variant: "destructive",
        });
        return;
      }

      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Generate invite link
      const baseUrl = window.location.origin;
      const inviteLink = `${baseUrl}/?invite=${user.id}`;

      // Send SMS via edge function
      const { data: smsData, error: smsError } = await supabase.functions.invoke(
        "send-partner-invite",
        {
          body: {
            phoneNumber: formattedPhone,
            inviterName: user.email?.split("@")[0] || undefined,
            inviteLink,
          },
        }
      );

      if (smsError) {
        console.error("SMS error:", smsError);
        throw new Error("Kon SMS niet versturen. Controleer het telefoonnummer.");
      }

      // Create collaborator invite record
      const { error } = await supabase
        .from("moving_collaborators")
        .insert({
          owner_user_id: user.id,
          collaborator_email: formattedPhone, // Store phone as identifier
          invited_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Uitnodiging verstuurd! 📱",
        description: "Je partner ontvangt een SMS met een link om mee te doen.",
      });

      onInviteSent();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error inviting partner:", error);
      toast({
        title: "Uitnodiging mislukt",
        description: error.message || "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1);
      setLivingAlone(null);
      setPhoneNumber("");
    }
    onOpenChange(open);
  };

  return (
    <MobileModal open={open} onOpenChange={handleOpenChange}>
      <MobileModalContent className="max-h-[70vh]">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <>
              {/* Header */}
              <div className="text-center space-y-3 mb-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Woon je alleen of samen?</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Samen verhuizen? Nodig je partner of huisgenoot uit om samen taken af te vinken!
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <button
                  onClick={() => handleLivingChoice(false)}
                  className="w-full p-5 rounded-2xl border-2 border-muted hover:border-primary/50 bg-white transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">Samen</p>
                    <p className="text-sm text-muted-foreground">Met partner of huisgenoot</p>
                  </div>
                </button>

                <button
                  onClick={() => handleLivingChoice(true)}
                  className="w-full p-5 rounded-2xl border-2 border-muted hover:border-primary/50 bg-white transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Check className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">Alleen</p>
                    <p className="text-sm text-muted-foreground">Ik regel alles zelf</p>
                  </div>
                </button>
              </div>

              {/* Unlock info */}
              <div className="mt-6 p-4 rounded-xl bg-primary-light/50 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span> Als je samenwoont, krijgen jullie een gedeelde chat om te overleggen over de verhuizing!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Phone input */}
              <div className="text-center space-y-3 mb-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Nodig uit via SMS</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Vul het telefoonnummer in van je partner of huisgenoot.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="06-12345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-14 rounded-xl text-base text-center"
                  autoFocus
                />

                <p className="text-xs text-center text-muted-foreground">
                  Ze ontvangen een SMS met een link om mee te doen aan je verhuisplanning.
                </p>
              </div>
            </>
          )}
        </div>

        {/* CTA for step 2 */}
        {step === 2 && (
          <div className="p-6 pt-4 border-t bg-background flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)} 
              className="flex-1 h-12 rounded-xl"
            >
              Terug
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={!phoneNumber.trim() || isLoading} 
              className="flex-1 h-12 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verstuur uitnodiging"
              )}
            </Button>
          </div>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
