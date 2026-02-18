import { useState, useEffect, useMemo } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Mail,
  Phone,
  ArrowRight,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { validatePhone, cleanPhone } from "@/lib/validation";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");

type Step = "phone" | "email" | "check_inbox";

type AccountCreationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountCreated: () => void;
  onDefer?: () => void;
  onLoginRequest?: () => void;
  capturedPhone?: string;
  isHardBlock?: boolean;
};

export const AccountCreationDialog = ({
  open,
  onOpenChange,
  onAccountCreated,
  onDefer,
  onLoginRequest,
  capturedPhone = "",
  isHardBlock = false,
}: AccountCreationDialogProps) => {
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(capturedPhone);
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // If phone already captured, skip to email step
      if (capturedPhone) {
        setPhone(capturedPhone);
        setStep("email");
      } else {
        setPhone("");
        setStep("phone");
      }
      setEmail("");
      setEmailError("");
      setPhoneError("");
      trackEvent("account_creation_shown");
    }
  }, [open, capturedPhone]);

  const isPhoneValid = phone.trim().length >= 10 && validatePhone(phone).isValid;
  const isEmailValid = useMemo(() => emailSchema.safeParse(email).success, [email]);

  const handlePhoneNext = () => {
    const result = validatePhone(phone);
    if (!result.isValid) {
      setPhoneError(result.error || "Ongeldig telefoonnummer");
      return;
    }
    setPhoneError("");
    // Save phone to localStorage for later use
    localStorage.setItem("lua_captured_phone", cleanPhone(phone));
    setStep("email");
  };

  const handleCreateAccount = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      return;
    }
    setEmailError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      // Save phone number for after magic link verification
      const phoneToSave = cleanPhone(phone);
      localStorage.setItem("lua_captured_phone", phoneToSave);
      localStorage.setItem("lua_pending_email", email.trim());

      trackEvent("account_creation_magic_link_sent");
      setStep("check_inbox");

    } catch (error: any) {
      toast({
        title: "Fout bij aanmaken account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLater = () => {
    if (isHardBlock) return;
    trackEvent("account_creation_skipped");
    if (onDefer) {
      onDefer();
    } else {
      onOpenChange(false);
    }
  };

  const canDismiss = !isHardBlock;

  return (
    <MobileModal open={open} onOpenChange={() => {}}>
      <MobileModalContent 
        className="max-h-[80vh]"
        showCloseButton={canDismiss}
        onCloseClick={handleLater}
        onPointerDownOutside={(e) => !canDismiss && e.preventDefault()}
        onEscapeKeyDown={(e) => !canDismiss && e.preventDefault()}
      >
        <div className="px-5 py-4">
          {/* Step 1: Phone */}
          {step === "phone" && (
            <>
              <div className="text-center mb-4">
                <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold">Maak je account aan</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Bewaar je voortgang en log overal in.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="account-phone" className="text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Telefoonnummer
                  </Label>
                  <Input
                    id="account-phone"
                    type="tel"
                    placeholder="06 12345678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className={cn(
                      "h-11 rounded-lg text-sm",
                      phoneError && "border-destructive focus-visible:ring-destructive"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isPhoneValid) {
                        handlePhoneNext();
                      }
                    }}
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button 
                  onClick={handlePhoneNext}
                  disabled={!isPhoneValid}
                  className="w-full h-11 rounded-lg text-base font-semibold"
                >
                  Volgende
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {canDismiss && (
                  <Button 
                    variant="ghost" 
                    onClick={handleLater}
                    className="w-full h-9 rounded-lg text-sm text-muted-foreground"
                  >
                    Nu niet
                  </Button>
                )}

                {onLoginRequest && (
                  <div className="flex items-center justify-center text-xs pt-1">
                    <button
                      type="button"
                      onClick={onLoginRequest}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Heb je al een account? Log in
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 2: Email */}
          {step === "email" && (
            <>
              <div className="text-center mb-4">
                <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2">
                  <Mail className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold">Bijna klaar!</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Voeg je e-mailadres toe om in te loggen.
                </p>
              </div>

              <div className="space-y-3">
                {/* Phone (read-only) */}
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Telefoonnummer</Label>
                  <div className="h-11 px-3 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{phone}</span>
                    <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="account-email" className="text-sm flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    E-mailadres
                  </Label>
                  <Input
                    id="account-email"
                    type="email"
                    placeholder="jouw@email.nl"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className={cn(
                      "h-11 rounded-lg text-sm",
                      emailError && "border-destructive focus-visible:ring-destructive"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isEmailValid) {
                        handleCreateAccount();
                      }
                    }}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button 
                  onClick={handleCreateAccount}
                  disabled={!isEmailValid || isLoading}
                  className="w-full h-11 rounded-lg text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Even geduld...
                    </>
                  ) : (
                    <>
                      Account aanmaken
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => setStep("phone")}
                  className="w-full h-9 rounded-lg text-sm text-muted-foreground"
                >
                  Terug
                </Button>

                <p className="text-[11px] text-center text-muted-foreground pt-1">
                  We sturen een inloglink naar je e-mail. Geen wachtwoord nodig.
                </p>
              </div>
            </>
          )}

          {/* Step 3: Check inbox */}
          {step === "check_inbox" && (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Check je inbox</h2>
              <p className="text-sm text-muted-foreground mb-1">
                We hebben een inloglink gestuurd naar
              </p>
              <p className="text-sm font-medium text-foreground mb-4">{email}</p>
              <p className="text-xs text-muted-foreground mb-4">
                Klik op de link in de e-mail om je account te activeren.
              </p>

              <Button 
                variant="outline"
                onClick={() => {
                  setStep("email");
                  setEmail("");
                }}
                className="w-full h-10 rounded-lg text-sm"
              >
                Ander e-mailadres gebruiken
              </Button>
            </div>
          )}
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};
