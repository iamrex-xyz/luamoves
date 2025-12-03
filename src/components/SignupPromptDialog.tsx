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
import { Eye, EyeOff, Loader2, Save, Users, Tag } from "lucide-react";
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
          <DialogTitle className="text-xl">Goed bezig! 🎉</DialogTitle>
          <DialogDescription className="text-base">
            Maak gratis een account aan voor deze voordelen:
          </DialogDescription>
        </DialogHeader>

        {/* Benefits list */}
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-full bg-primary/10">
              <Save className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Voortgang bewaren</p>
              <p className="text-xs text-muted-foreground">Je taken en notities blijven opgeslagen</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Partner/huisgenoten koppelen</p>
              <p className="text-xs text-muted-foreground">Verdeel taken en werk samen</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-full bg-primary/10">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Exclusieve verhuiskortingen</p>
              <p className="text-xs text-muted-foreground">Bespaar bij onze partners</p>
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
          <Button onClick={handleSignup} disabled={isLoading} className="h-11">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              "Gratis account maken"
            )}
          </Button>
          <Button variant="ghost" onClick={onSkip} disabled={isLoading} className="text-muted-foreground">
            Misschien later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
