import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Eye, EyeOff, User as UserIcon, UserPlus, ChevronRight } from "lucide-react";
import { z } from "zod";

interface AuthProps {
  onComplete: (user: SupabaseUser) => void;
  onSignUpRequest?: () => void;
  onContinueAsGuest?: () => void;
}

type AuthScreen = 'initial' | 'login' | 'signup' | 'passwordReset';

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");
const passwordSchema = z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten");

export const Auth = ({ onComplete, onSignUpRequest, onContinueAsGuest }: AuthProps) => {
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<AuthScreen>('initial');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  // Initial screen - only login option
  if (screen === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/80 to-white flex flex-col">
        {/* Header */}
        <div className="p-6">
          <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Large headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Welkom
                <br />
                <span className="text-orange-500">terug!</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Log in om verder te gaan met je verhuisplanning.
              </p>
            </div>

            {/* Action card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-orange-200/50 p-6 space-y-4">
              <button 
                onClick={() => setScreen('login')} 
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-muted hover:border-orange-400 hover:bg-orange-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Inloggen</p>
                    <p className="text-sm text-muted-foreground">Met je bestaande account</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                onClick={onSignUpRequest} 
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-muted hover:border-orange-400 hover:bg-orange-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Account aanmaken</p>
                    <p className="text-sm text-muted-foreground">Start met je verhuisplanning</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {onContinueAsGuest && (
              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
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

  // Password reset screen
  if (screen === 'passwordReset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/80 to-white flex flex-col">
        {/* Header */}
        <div className="p-6 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
          <button
            onClick={() => {
              setScreen('login');
              setEmail("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terug
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Large headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Wachtwoord
                <br />
                <span className="text-orange-500">vergeten?</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Vul je email in om een reset link te ontvangen.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-orange-200/50 p-6">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jouw@email.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-14 text-lg rounded-xl border-2 border-muted focus:border-orange-400"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 text-base rounded-xl bg-foreground hover:bg-foreground/90"
                >
                  {loading ? "Verzenden..." : "Verstuur reset link"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/80 to-white flex flex-col">
        {/* Header */}
        <div className="p-6 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
          <button
            onClick={() => setScreen('initial')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terug
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Large headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Welkom
                <br />
                <span className="text-orange-500">terug!</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Log in om verder te gaan met je verhuisplanning.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-orange-200/50 p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jouw@email.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-14 text-lg rounded-xl border-2 border-muted focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Wachtwoord</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="h-14 text-lg rounded-xl border-2 border-muted focus:border-orange-400 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 text-base rounded-xl bg-foreground hover:bg-foreground/90"
                >
                  {loading ? "Laden..." : "Inloggen"}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-muted space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setScreen('passwordReset');
                    setPassword("");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full text-center py-2"
                  disabled={loading}
                >
                  Wachtwoord vergeten?
                </button>
                <button
                  type="button"
                  onClick={onSignUpRequest}
                  className="text-sm text-orange-500 hover:text-orange-600 transition-colors block w-full text-center py-2 font-medium"
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
  }

  // Signup screen removed - users must go through onboarding
  return null;
};
