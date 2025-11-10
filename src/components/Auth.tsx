import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface AuthProps {
  onComplete: (user: User) => void;
}

type AuthScreen = 'initial' | 'login' | 'signup' | 'passwordReset';

export const Auth = ({ onComplete }: AuthProps) => {
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<AuthScreen>('initial');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth changes (only for new logins/signups)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only call onComplete for new sign-ins, not for existing sessions
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        onComplete(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onComplete]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email vereist",
        description: "Vul je email in om je wachtwoord te resetten",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email verstuurd!",
        description: "Check je inbox voor de reset link",
      });
      
      setScreen('login');
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Reset mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Velden vereist",
        description: "Vul je email en wachtwoord in",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welkom terug!",
        description: "Je bent succesvol ingelogd",
      });
    } catch (error: any) {
      toast({
        title: "Login mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Velden vereist",
        description: "Vul je email en wachtwoord in",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Wachtwoord te kort",
        description: "Wachtwoord moet minimaal 6 tekens bevatten",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account aangemaakt!",
        description: "Je bent nu ingelogd",
      });
    } catch (error: any) {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial screen with two buttons
  if (screen === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-charly tracking-tight">
              Charly
            </h1>
            <p className="text-sm text-muted-foreground">
              jouw persoonlijke verhuisconcierge
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => setScreen('login')} 
              className="w-full h-12 text-base"
            >
              Inloggen
            </Button>
            <Button 
              onClick={() => setScreen('signup')} 
              variant="outline"
              className="w-full h-12 text-base"
            >
              Schrijf je in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Password reset screen
  if (screen === 'passwordReset') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-charly tracking-tight">
              Charly
            </h1>
            <p className="text-sm text-muted-foreground">
              jouw persoonlijke verhuisconcierge
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Wachtwoord vergeten</h2>
              <p className="text-xs text-muted-foreground">
                Vul je email in om een reset link te ontvangen
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-10 text-sm"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-auto px-8 h-10 text-sm mx-auto block">
                {loading ? "Verzenden..." : "Verstuur reset link"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setScreen('login');
                    setEmail("");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  disabled={loading}
                >
                  Terug naar login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-charly tracking-tight">
              Charly
            </h1>
            <p className="text-sm text-muted-foreground">
              jouw persoonlijke verhuisconcierge
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Welkom terug</h2>
              <p className="text-xs text-muted-foreground">
                Log in om verder te gaan
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="password" className="text-sm">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-10 text-sm"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-auto px-8 h-10 text-sm mx-auto block">
                {loading ? "Laden..." : "Inloggen"}
              </Button>
            </form>

            <div className="text-center space-y-1">
              <button
                type="button"
                onClick={() => setScreen('initial')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 block w-full"
                disabled={loading}
              >
                Terug
              </button>
              <button
                type="button"
                onClick={() => {
                  setScreen('passwordReset');
                  setPassword("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 block w-full"
                disabled={loading}
              >
                Wachtwoord vergeten?
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-charly tracking-tight">
            Charly
          </h1>
          <p className="text-sm text-muted-foreground">
            jouw persoonlijke verhuisconcierge
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Account aanmaken</h2>
            <p className="text-xs text-muted-foreground">
              Maak een account om te beginnen
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="password" className="text-sm">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-10 text-sm"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-auto px-8 h-10 text-sm mx-auto block">
              {loading ? "Laden..." : "Account aanmaken"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setScreen('initial')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              disabled={loading}
            >
              Terug
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
