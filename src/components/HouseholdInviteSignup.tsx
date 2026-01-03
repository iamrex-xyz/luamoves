import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Phone, 
  Mail, 
  Lock,
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { z } from "zod";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");
const passwordSchema = z.string()
  .min(8, "Wachtwoord moet minimaal 8 tekens bevatten")
  .regex(/[0-9]/, "Wachtwoord moet minimaal 1 cijfer bevatten");

type HouseholdInviteSignupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteToken: string;
  phone: string;
  name?: string;
  ownerUserId: string;
  onComplete: () => void;
};

export const HouseholdInviteSignup = ({
  open,
  onOpenChange,
  inviteToken,
  phone,
  name,
  ownerUserId,
  onComplete,
}: HouseholdInviteSignupProps) => {
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      trackEvent("household_invite_signup_shown");
    }
  }, [open]);

  const validateEmail = (): boolean => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (): boolean => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const canSubmit = emailSchema.safeParse(email).success && passwordSchema.safeParse(password).success;

  const handleCreateAccount = async () => {
    if (!validateEmail() || !validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update the user's profile with phone
        await supabase
          .from('profiles')
          .update({ phone })
          .eq('user_id', data.user.id);

        // Update household_members to mark as active and link user
        const { error: memberError } = await supabase
          .from('household_members')
          .update({
            member_user_id: data.user.id,
            status: 'active',
            accepted_at: new Date().toISOString(),
          })
          .eq('invite_token', inviteToken);

        if (memberError) {
          console.error('Error updating household member:', memberError);
        }

        trackEvent("household_invite_accepted");
        
        toast({
          title: "Welkom bij Lua! 🎉",
          description: "Je account is aangemaakt en je bent toegevoegd aan het huishouden.",
        });
        
        onComplete();
      }
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast({
          title: "E-mailadres al in gebruik",
          description: "Dit e-mailadres is al geregistreerd. Probeer in te loggen.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fout bij aanmaken account",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileModal open={open} onOpenChange={() => {}}>
      <MobileModalContent className="max-h-[80vh]">
        <div className="px-5 py-4">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold">Je bent uitgenodigd!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {name ? `Hoi ${name}! ` : ""}Maak een account aan om samen te verhuizen.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {/* Phone (read-only) */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Telefoonnummer</Label>
              <div className="h-11 px-3 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{phone}</span>
                <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="invite-email" className="text-sm flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                E-mailadres
              </Label>
              <Input
                id="invite-email"
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
              />
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="invite-password" className="text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Wachtwoord
              </Label>
              <div className="relative">
                <Input
                  id="invite-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 tekens, 1 cijfer"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className={cn(
                    "h-11 rounded-lg pr-10 text-sm",
                    passwordError && "border-destructive focus-visible:ring-destructive"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canSubmit) {
                      handleCreateAccount();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 space-y-2">
            <Button 
              onClick={handleCreateAccount}
              disabled={!canSubmit || isLoading}
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

            <p className="text-xs text-center text-muted-foreground pt-1">
              Je wordt automatisch toegevoegd aan het huishouden na registratie.
            </p>
          </div>
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};
