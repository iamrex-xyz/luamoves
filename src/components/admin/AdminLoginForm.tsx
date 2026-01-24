import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LuaLogo } from "@/components/LuaLogo";

export const AdminLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        title: "Vul je e-mailadres in",
        description: "Voer eerst je e-mailadres in om een reset link te ontvangen.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (error) {
        toast({
          title: "Fout bij verzenden",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "E-mail verzonden",
          description: "Check je inbox voor de wachtwoord reset link.",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Vul alle velden in",
        description: "E-mail en wachtwoord zijn verplicht.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: "Inloggen mislukt",
          description: error.message === "Invalid login credentials" 
            ? "Ongeldige inloggegevens. Controleer je e-mail en wachtwoord."
            : error.message,
          variant: "destructive",
        });
      }
      // If successful, the auth state change will trigger a re-render
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
            Log in met je @lua.nl of @luamoves.nl account
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

          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bezig met inloggen...
              </>
            ) : (
              "Inloggen"
            )}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full text-sm"
            disabled={isLoading || isResetting}
            onClick={handleForgotPassword}
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                E-mail versturen...
              </>
            ) : (
              "Wachtwoord vergeten?"
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
