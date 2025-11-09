import { useState, useEffect } from "react";
import { Onboarding } from "@/components/Onboarding";
import { Auth } from "@/components/Auth";
import { AdditionalInfo } from "@/components/AdditionalInfo";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Timeline } from "@/components/Timeline";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MovingInfo = {
  oldAddress: string;
  newAddress: string;
  movingDate: string;
  keyHandoverDate?: string; // Sleuteloverdracht datum (vooral voor huurders)
  type: "buy" | "rent";
};

const Index = () => {
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<
    "onboarding" | "auth" | "additionalInfo" | "dashboard" | "tasks" | "timeline"
  >("auth");
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
        });
        setCurrentView("dashboard");
      } else {
        setCurrentView("onboarding");
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
          setCurrentView("auth");
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
        setCurrentView("auth");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = (info: MovingInfo) => {
    setMovingInfo(info);
    setCurrentView("auth");
  };

  const handleAuthComplete = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView("additionalInfo");
  };

  const handleAdditionalInfoComplete = async (adults: number, children: number, pets: number, phone: string) => {
    if (!user || !movingInfo) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          adults,
          children,
          pets,
          phone,
          old_address: movingInfo.oldAddress,
          new_address: movingInfo.newAddress,
          moving_date: movingInfo.movingDate,
          key_handover_date: movingInfo.keyHandoverDate || null,
          moving_type: movingInfo.type,
        })
        .eq('user_id', user.id);

      if (error) throw error;

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
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentView === "auth") {
    return <Auth onComplete={handleAuthComplete} />;
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
      {currentView === "timeline" && movingInfo && (
        <Timeline 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Index;
