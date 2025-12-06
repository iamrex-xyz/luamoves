import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Shield, Users, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { z } from "zod";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");
const passwordSchema = z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten");

type SignupPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupComplete: () => void;
  onSkip: () => void;
  isHardBlock?: boolean;
};

export const SignupPromptDialog = ({
  open,
  onOpenChange,
  onSignupComplete,
  onSkip,
  isHardBlock = false,
}: SignupPromptDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Track modal shown event
  useEffect(() => {
    if (open) {
      trackEvent(
        isHardBlock 
          ? AnalyticsEvents.ACCOUNT_MODAL_SHOWN_AT_TASK_6 
          : AnalyticsEvents.ACCOUNT_MODAL_SHOWN_AT_TASK_2
      );
    }
  }, [open, isHardBlock]);

  const handleSignup = async () => {
    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      toast({
        title: "Ongeldige invoer",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.success) {
      toast({
        title: "Ongeldige invoer",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
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
        trackEvent(AnalyticsEvents.ACCOUNT_CREATED_FROM_MODAL);
        toast({
          title: "Voortgang opgeslagen 🎉",
          description: "Lekker bezig! Je account is aangemaakt.",
        });
        onSignupComplete();
      }
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

  const handleSkip = () => {
    trackEvent(AnalyticsEvents.ACCOUNT_MODAL_LATER_CLICKED);
    onSkip();
  };

  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close via ESC or clicking outside
    if (!newOpen && open) {
      if (isHardBlock) {
        // Don't allow closing on hard block
        return;
      }
      // Treat as "Later verder"
      handleSkip();
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200"
        onPointerDownOutside={(e) => isHardBlock && e.preventDefault()}
        onEscapeKeyDown={(e) => isHardBlock && e.preventDefault()}
      >
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-bold">
            {isHardBlock ? "Nog één stap!" : "Je bent al lekker bezig!"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {isHardBlock 
              ? "Maak een account aan om verder te gaan en je voortgang te bewaren."
              : "Maak een account aan en wij zorgen dat je niets kwijtraakt."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Benefits list */}
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-light">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">Voortgang veilig bewaren</p>
              <p className="text-xs text-muted-foreground">Je taken en notities blijven opgeslagen</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
            <div className="p-2.5 rounded-xl bg-muted">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">Partner/huisgenoten koppelen</p>
              <p className="text-xs text-muted-foreground">Verdeel taken en werk samen</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
            <div className="p-2.5 rounded-xl bg-muted">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">Slimme deadline reminders</p>
              <p className="text-xs text-muted-foreground">Nooit meer een deadline missen</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="signup-email">E-mailadres</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Wachtwoord</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimaal 6 tekens"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleSignup} disabled={isLoading} className="h-12 rounded-xl text-base font-semibold">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              "Account aanmaken"
            )}
          </Button>
          {!isHardBlock && (
            <Button variant="ghost" onClick={handleSkip} disabled={isLoading} className="text-muted-foreground h-11">
              Later verder
            </Button>
          )}
        </div>

        {/* Privacy compliance */}
        <p className="text-xs text-center text-muted-foreground pt-1">
          We sturen je alleen handige reminders. Geen spam, beloofd.
          <br />
          Door je account te maken ga je akkoord met onze{" "}
          <a href="/voorwaarden" className="underline hover:text-foreground">voorwaarden</a>
          {" "}en{" "}
          <a href="/privacy" className="underline hover:text-foreground">privacyverklaring</a>.
        </p>
      </DialogContent>
    </Dialog>
  );
};