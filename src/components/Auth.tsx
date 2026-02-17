import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User as UserIcon, UserPlus, ChevronRight, Mail, Loader2, CheckCircle } from "lucide-react";

interface AuthProps {
  onComplete: (user: SupabaseUser) => void;
  onSignUpRequest?: () => void;
  onContinueAsGuest?: () => void;
}

type AuthScreen = 'initial' | 'login' | 'email_sent';

import { z } from "zod";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");

export const Auth = ({ onComplete, onSignUpRequest, onContinueAsGuest }: AuthProps) => {
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<AuthScreen>('initial');
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        onComplete(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onComplete]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Ongeldige invoer",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      setScreen('email_sent');
      toast({
        title: "Inloglink verstuurd! 📧",
        description: "Check je inbox voor de link.",
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

  // Initial screen
  if (screen === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        <div className="p-6">
          <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Welkom
                <br />
                <span className="text-primary">terug!</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Fijn dat je er weer bent. Log in en ga verder waar je was gebleven.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6 space-y-4">
              <button 
                onClick={() => setScreen('login')} 
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-muted hover:border-primary hover:bg-primary-light/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Inloggen</p>
                    <p className="text-sm text-muted-foreground">Via e-mail inloglink</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                onClick={onSignUpRequest} 
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-muted hover:border-primary hover:bg-primary-light/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Account aanmaken</p>
                    <p className="text-sm text-muted-foreground">Gratis en in 30 seconden klaar</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {onContinueAsGuest && (
              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                <button 
                  onClick={onContinueAsGuest}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Ga door zonder account</span>
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Email sent confirmation
  if (screen === 'email_sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Check je inbox</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                We hebben een inloglink gestuurd naar <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Klik op de link in de e-mail om in te loggen.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6 space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
                onClick={() => {
                  setScreen('login');
                  setEmail("");
                }}
              >
                Ander e-mailadres gebruiken
              </Button>
              <Button
                variant="ghost"
                className="w-full h-10 rounded-xl text-sm text-muted-foreground"
                onClick={() => setScreen('initial')}
              >
                Terug naar start
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login screen - magic link
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
        <button
          onClick={() => setScreen('initial')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Terug
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Welkom
              <br />
              <span className="text-primary">terug!</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Vul je e-mailadres in en we sturen je een inloglink.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  E-mailadres
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-14 text-lg rounded-xl border-2 border-muted focus:border-primary"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 text-base rounded-xl bg-foreground hover:bg-foreground/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Link versturen...
                  </>
                ) : (
                  "Stuur inloglink"
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-muted">
              <button
                type="button"
                onClick={onSignUpRequest}
                className="text-sm text-primary hover:text-primary/80 transition-colors block w-full text-center py-2 font-medium"
                disabled={loading}
              >
                Nog geen account? Maak er een aan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
