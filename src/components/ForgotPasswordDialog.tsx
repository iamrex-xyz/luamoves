import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, KeyRound, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";
import { cn } from "@/lib/utils";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");

type ForgotPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  defaultEmail?: string;
};

export const ForgotPasswordDialog = ({
  open,
  onOpenChange,
  onBack,
  defaultEmail = "",
}: ForgotPasswordDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setEmailError("");
      setIsEmailSent(false);
      trackEvent("forgot_password_shown");
    }
  }, [open, defaultEmail]);

  const validateEmail = (): boolean => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError("");
    return true;
  };

  const isEmailValid = emailSchema.safeParse(email).success;

  const handleSendReset = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      trackEvent("forgot_password_sent");
      setIsEmailSent(true);
      
      toast({
        title: "Email verstuurd!",
        description: "Check je inbox voor de reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Reset mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent 
        showCloseButton={true}
        onCloseClick={onBack}
      >
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-center space-y-3 mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isEmailSent ? "Check je inbox" : "Wachtwoord vergeten?"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {isEmailSent 
                  ? "We hebben je een link gestuurd om je wachtwoord te resetten."
                  : "Geen probleem! Vul je e-mailadres in en we sturen je een reset link."
                }
              </p>
            </div>
          </div>

          {isEmailSent ? (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <Check className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-medium">Email verstuurd naar</p>
              <p className="text-muted-foreground">{email}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="flex items-center gap-2 text-base">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  E-mailadres
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={cn(
                    "h-14 rounded-xl text-base",
                    emailError && "border-destructive focus-visible:ring-destructive"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isEmailValid) {
                      handleSendReset();
                    }
                  }}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t bg-background space-y-3">
          {isEmailSent ? (
            <Button 
              onClick={onBack}
              className="w-full h-14 rounded-xl text-lg font-semibold"
            >
              Terug naar inloggen
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSendReset}
                disabled={!isEmailValid || isLoading}
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Versturen...
                  </>
                ) : (
                  "Verstuur reset link"
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={onBack}
                className="w-full h-12 rounded-xl text-base text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Button>
            </>
          )}
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};