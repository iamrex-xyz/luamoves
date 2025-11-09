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

export const Auth = ({ onComplete }: AuthProps) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        onComplete(session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        onComplete(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      if (isSignUp) {
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
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welkom terug!",
          description: "Je bent succesvol ingelogd",
        });
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Registratie mislukt" : "Login mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md space-y-6 md:space-y-8 text-center">
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-charly tracking-tight">
            Charly
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            jouw persoonlijke verhuisconcierge
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold">
              {isSignUp ? "Account aanmaken" : "Welkom terug"}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {isSignUp
                ? "Maak een account om te beginnen"
                : "Log in om verder te gaan met je verhuisplanning"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-base">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-12 text-base"
              />
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full min-h-[52px] text-base">
              {loading ? "Laden..." : isSignUp ? "Account aanmaken" : "Inloggen"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-base text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-4"
              disabled={loading}
            >
              {isSignUp
                ? "Heb je al een account? Log in"
                : "Nog geen account? Registreer je"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
