import { useState, useEffect, useMemo } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock,
  Mail,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");
const passwordSchema = z.string()
  .min(8, "Wachtwoord moet minimaal 8 tekens bevatten")
  .regex(/[0-9]/, "Wachtwoord moet minimaal 1 cijfer bevatten");

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
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accountCreationStarted, setAccountCreationStarted] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
      setAccountCreationStarted(false);
      setShowForgotPassword(false);
      trackEvent("account_creation_shown");
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

  const isEmailValid = useMemo(() => emailSchema.safeParse(email).success, [email]);
  const isPasswordValid = useMemo(() => passwordSchema.safeParse(password).success, [password]);
  const canSubmit = isEmailValid && isPasswordValid;

  const handleCreateAccount = async () => {
    if (!validateEmail() || !validatePassword()) {
      return;
    }

    setIsLoading(true);
    setAccountCreationStarted(true);

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
        // Get phone from prop or localStorage fallback
        const phoneToSave = capturedPhone || localStorage.getItem("lua_captured_phone");
        
        // Update profile with phone number if we have it
        if (phoneToSave) {
          // Use upsert so the profile row is guaranteed to exist
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
              {
                user_id: data.user.id,
                phone: phoneToSave,
              } as any,
              { onConflict: 'user_id' }
            );

          if (profileError) {
            console.error('Error updating profile with phone:', profileError);
          } else {
            // Clear localStorage after successful save
            localStorage.removeItem("lua_captured_phone");
          }
        }

        trackEvent("account_created");
        
        toast({
          title: "Account aangemaakt! 🎉",
          description: "Je kunt nu overal verder waar je gebleven was.",
        });
        
        onAccountCreated();
      }
    } catch (error: any) {
      setAccountCreationStarted(false);
      
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

  const handleLater = () => {
    // Never allow closing if account creation has started
    if (accountCreationStarted) return;
    
    // Only allow "Later" for non-hard-block modals
    if (isHardBlock) return;
    
    trackEvent("account_creation_skipped");
    if (onDefer) {
      onDefer();
    } else {
      onOpenChange(false);
    }
  };

  // Determine if dialog can be dismissed
  const canDismiss = !isHardBlock && !accountCreationStarted;

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
          {/* Compact header */}
          <div className="text-center mb-4">
            <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold">
              {isHardBlock ? "Account aanmaken" : "Maak je account aan"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Bewaar je voortgang en log overal in.
            </p>
          </div>

          {/* Compact form */}
          <div className="space-y-3">
            {/* Phone (read-only, shown first) */}
            {capturedPhone && (
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Telefoonnummer</Label>
                <div className="h-11 px-3 rounded-lg bg-muted/50 border border-border/50 flex items-center">
                  <span className="text-sm text-foreground">{capturedPhone}</span>
                </div>
              </div>
            )}

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
              />
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="account-password" className="text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Wachtwoord
              </Label>
              <div className="relative">
                <Input
                  id="account-password"
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

          {/* Compact CTA section */}
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

            {canDismiss && (
              <Button 
                variant="ghost" 
                onClick={handleLater}
                className="w-full h-9 rounded-lg text-sm text-muted-foreground"
              >
                Nu niet
              </Button>
            )}

            {/* Secondary actions - compact row */}
            <div className="flex items-center justify-center gap-3 text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Wachtwoord vergeten?
              </button>
              {onLoginRequest && (
                <>
                  <span className="text-border">•</span>
                  <button
                    type="button"
                    onClick={onLoginRequest}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-center text-muted-foreground pt-1">
              Door aan te melden ga je akkoord met onze voorwaarden.
            </p>
          </div>
        </div>
      </MobileModalContent>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onBack={() => setShowForgotPassword(false)}
        defaultEmail={email}
      />
    </MobileModal>
  );
};