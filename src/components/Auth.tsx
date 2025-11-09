import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface AuthProps {
  onComplete: (user: User) => void;
}

export const Auth = ({ onComplete }: AuthProps) => {
  const [loading, setLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold font-charly tracking-tight">
            Charly
          </h1>
          <p className="text-lg text-muted-foreground">
            jouw persoonlijke verhuisconcierge
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Welkom terug</h2>
            <p className="text-muted-foreground">
              Log in om verder te gaan met je verhuisplanning
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Laden..." : "Doorgaan met Google"}
          </Button>
        </div>
      </div>
    </div>
  );
};
