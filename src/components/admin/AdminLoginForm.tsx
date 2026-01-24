import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LuaLogo } from "@/components/LuaLogo";

export const AdminLoginForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Vul je e-mailadres in",
        description: "E-mailadres is verplicht.",
        variant: "destructive",
      });
      return;
    }

    // Check if email is from allowed domains
    const allowedDomains = ['lua.nl', 'luamoves.nl'];
    const emailDomain = email.trim().split('@')[1]?.toLowerCase();
    
    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      toast({
        title: "Ongeldig e-mailadres",
        description: "Gebruik een @lua.nl of @luamoves.nl e-mailadres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        toast({
          title: "Fout bij verzenden",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "E-mail verzonden",
          description: "Check je inbox voor de inloglink.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center mb-4">
            <LuaLogo size="lg" />
          </div>
          <div className="flex items-center justify-center gap-2 text-primary">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold">Check je inbox</h1>
          <p className="text-sm text-muted-foreground">
            We hebben een inloglink gestuurd naar <strong>{email}</strong>
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Ander e-mailadres gebruiken
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <LuaLogo size="lg" />
          </div>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl font-semibold">Inloggen</h1>
          <p className="text-sm text-muted-foreground">
            Voer je @lua.nl of @luamoves.nl e-mailadres in
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="naam@lua.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Link versturen...
              </>
            ) : (
              "Stuur inloglink"
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Alleen geautoriseerde medewerkers hebben toegang tot dit dashboard.
        </p>
      </div>
    </div>
  );
};
