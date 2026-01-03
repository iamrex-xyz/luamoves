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
        // Update profile with phone number if we have it
        if (capturedPhone) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              phone: capturedPhone,
            })
            .eq('user_id', data.user.id);

          if (profileError) {
            console.error('Error updating profile with phone:', profileError);
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
        className="max-h-[85vh]"
        showCloseButton={canDismiss}
        onCloseClick={handleLater}
        onPointerDownOutside={(e) => !canDismiss && e.preventDefault()}
        onEscapeKeyDown={(e) => !canDismiss && e.preventDefault()}
      >
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-center space-y-3 mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isHardBlock 
                  ? "Account aanmaken om door te gaan"
                  : "Maak je account aan"
                }
              </h2>
              <p className="text-muted-foreground mt-1">
                Zo kun je altijd inloggen en verder gaan waar je gebleven was.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="account-email" className="flex items-center gap-2 text-base">
                <Mail className="w-4 h-4 text-muted-foreground" />
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
                  "h-14 rounded-xl text-base",
                  emailError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="account-password" className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Wachtwoord
              </Label>
              <div className="relative">
                <Input
                  id="account-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimaal 8 tekens met 1 cijfer"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className={cn(
                    "h-14 rounded-xl pr-12 text-base",
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>

            {/* Show saved phone if available */}
            {capturedPhone && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">Je telefoonnummer</p>
                <p className="font-medium">{capturedPhone}</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-4 border-t bg-background space-y-3">
          <Button 
            onClick={handleCreateAccount}
            disabled={!canSubmit || isLoading}
            className="w-full h-14 rounded-xl text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Account aanmaken...
              </>
            ) : (
              <>
                Account aanmaken
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {canDismiss && (
            <Button 
              variant="ghost" 
              onClick={handleLater}
              className="w-full h-12 rounded-xl text-base text-muted-foreground"
            >
              Nu niet
            </Button>
          )}

          <div className="text-center space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Wachtwoord vergeten?
            </button>
            {onLoginRequest && (
              <button
                type="button"
                onClick={onLoginRequest}
                className="text-sm text-primary hover:text-primary/80 transition-colors block w-full"
              >
                Al een account? Log in
              </button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Door aan te melden ga je akkoord met onze voorwaarden.
          </p>
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