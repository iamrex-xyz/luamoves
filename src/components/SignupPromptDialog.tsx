import { useState } from "react";
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
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");
const passwordSchema = z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten");

type SignupPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupComplete: () => void;
  onSkip: () => void;
};

export const SignupPromptDialog = ({
  open,
  onOpenChange,
  onSignupComplete,
  onSkip,
}: SignupPromptDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        toast({
          title: "Account aangemaakt!",
          description: "Je voortgang wordt nu opgeslagen.",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Goed bezig! 🎉</DialogTitle>
          <DialogDescription className="text-base">
            Maak een account aan om je voortgang op te slaan en toegang te krijgen tot alle functies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimaal 6 tekens"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex flex-col gap-2">
          <Button onClick={handleSignup} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              "Account aanmaken"
            )}
          </Button>
          <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
            Later doen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
