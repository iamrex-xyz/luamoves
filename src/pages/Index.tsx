import { useState, useEffect } from "react";
import { Onboarding } from "@/components/Onboarding";
import { Auth } from "@/components/Auth";
import { AdditionalInfo } from "@/components/AdditionalInfo";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MovingInfo = {
  oldAddress: string;
  newAddress: string;
  movingDate: string;
  keyHandoverDate?: string; // Sleuteloverdracht datum (vooral voor huurders)
  type: "buy" | "rent";
  renovationType?: "none" | "small" | "large";
  needsContractorHelp?: boolean;
};

const Index = () => {
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<
    "onboarding" | "auth" | "additionalInfo" | "dashboard" | "tasks" | "extras" | "settings"
  >("onboarding");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check authentication and load user data
  useEffect(() => {
    const loadUserProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile && profile.moving_date) {
        setMovingInfo({
          oldAddress: profile.old_address || '',
          newAddress: profile.new_address || '',
          movingDate: profile.moving_date,
          keyHandoverDate: profile.key_handover_date || undefined,
          type: (profile.moving_type as "buy" | "rent") || "rent",
          renovationType: (profile.renovation_type as "none" | "small" | "large") || "none",
          needsContractorHelp: profile.needs_contractor_help || false,
        });
        setCurrentView("dashboard");
      } else {
        // User logged in but hasn't filled in moving info yet
        setCurrentView("additionalInfo");
      }
      setLoading(false);
    };

    // Set up auth state listener (MUST be synchronous)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer async operations with setTimeout
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setCurrentView("onboarding");
          setMovingInfo(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setCurrentView("onboarding");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = async (info: MovingInfo, email: string, password: string) => {
    setMovingInfo(info);
    
    // Create account
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setCurrentView("additionalInfo");
        toast({
          title: "Account aangemaakt!",
          description: "Welkom bij Charly.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Fout bij aanmaken account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLoginRedirect = () => {
    setCurrentView("auth");
  };

  const handleAuthComplete = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    
    // Check if user already has moving info
    setTimeout(() => {
      loadUserData(authenticatedUser.id);
    }, 0);
  };

  const loadUserData = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile && profile.moving_date) {
      setMovingInfo({
        oldAddress: profile.old_address || '',
        newAddress: profile.new_address || '',
        movingDate: profile.moving_date,
        keyHandoverDate: profile.key_handover_date || undefined,
        type: (profile.moving_type as "buy" | "rent") || "rent",
        renovationType: (profile.renovation_type as "none" | "small" | "large") || "none",
        needsContractorHelp: profile.needs_contractor_help || false,
      });
      setCurrentView("dashboard");
    } else {
      // User logged in but hasn't filled in moving info yet
      setCurrentView("additionalInfo");
    }
  };

  const handleAdditionalInfoComplete = async (adults: number, children: number, pets: number, phone: string) => {
    if (!user) return;

    // If movingInfo doesn't exist, create a minimal one (user came from login without onboarding)
    const infoToSave = movingInfo || {
      oldAddress: '',
      newAddress: '',
      movingDate: '',
      keyHandoverDate: undefined,
      type: 'rent' as const,
      renovationType: 'none' as const,
      needsContractorHelp: false,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          adults,
          children,
          pets,
          phone,
          old_address: infoToSave.oldAddress,
          new_address: infoToSave.newAddress,
          moving_date: infoToSave.movingDate || null,
          key_handover_date: infoToSave.keyHandoverDate || null,
          moving_type: infoToSave.type,
          renovation_type: infoToSave.renovationType || "none",
          needs_contractor_help: infoToSave.needsContractorHelp || false,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setMovingInfo(infoToSave);
      setCurrentView("dashboard");
      toast({
        title: "Gegevens opgeslagen!",
        description: "Je verhuisinformatie is succesvol opgeslagen.",
      });
    } catch (error: any) {
      toast({
        title: "Fout bij opslaan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMovingInfo(null);
    setCurrentView("auth");
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (currentView === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} onLogin={handleLoginRedirect} />;
  }

  if (currentView === "auth") {
    return <Auth onComplete={handleAuthComplete} onSignUpRequest={() => setCurrentView("onboarding")} />;
  }

  if (currentView === "additionalInfo") {
    return <AdditionalInfo onComplete={handleAdditionalInfoComplete} user={user} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {currentView === "dashboard" && movingInfo && (
        <Dashboard 
          movingInfo={movingInfo} 
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
      )}
      {currentView === "tasks" && movingInfo && (
        <TaskList 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
      )}
      {currentView === "extras" && movingInfo && (
        <Extras 
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
      )}
      {currentView === "settings" && movingInfo && (
        <Settings 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          onUpdate={setMovingInfo}
        />
      )}
    </div>
  );
};

export default Index;
