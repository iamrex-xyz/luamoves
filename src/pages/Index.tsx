import { useState, useEffect } from "react";
import { SimpleOnboarding } from "@/components/SimpleOnboarding";
import { Auth } from "@/components/Auth";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { SignupPromptDialog } from "@/components/SignupPromptDialog";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MovingInfo = {
  oldAddress: string;
  newAddress: string;
  movingDate: string;
  keyHandoverDate?: string;
  type: "buy" | "rent";
  renovationType?: "none" | "small" | "large";
  needsContractorHelp?: boolean;
};

const LOCAL_STORAGE_KEY = "charly_moving_info";
const SIGNUP_PROMPTED_KEY = "charly_signup_prompted";

const Index = () => {
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<
    "onboarding" | "auth" | "dashboard" | "tasks" | "extras" | "settings"
  >("onboarding");
  const [loading, setLoading] = useState(true);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { toast } = useToast();

  // Check for existing data on load
  useEffect(() => {
    const initializeApp = async () => {
      // First check for logged in user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
        return;
      }

      // No user - check localStorage for guest data
      const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          setMovingInfo(parsed);
          setCurrentView("dashboard"); // Go to home/dashboard
        } catch {
          setCurrentView("onboarding");
        }
      } else {
        setCurrentView("onboarding");
      }
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            syncLocalDataToProfile(session.user.id);
          }, 0);
        }
      }
    );

    initializeApp();

    return () => subscription.unsubscribe();
  }, []);

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
      // Check if we have local data to sync
      const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setMovingInfo(parsed);
        await syncLocalDataToProfile(userId);
        setCurrentView("dashboard");
      } else {
        setCurrentView("onboarding");
      }
    }
    setLoading(false);
  };

  const syncLocalDataToProfile = async (userId: string) => {
    const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedInfo) return;

    try {
      const info = JSON.parse(savedInfo) as MovingInfo;
      
      await supabase
        .from('profiles')
        .update({
          old_address: info.oldAddress,
          new_address: info.newAddress,
          moving_date: info.movingDate || null,
          key_handover_date: info.keyHandoverDate || null,
          moving_type: info.type,
          renovation_type: info.renovationType || "none",
          needs_contractor_help: info.needsContractorHelp || false,
        })
        .eq('user_id', userId);

      // Clear localStorage after sync
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(SIGNUP_PROMPTED_KEY);
      
      setCurrentView("dashboard");
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  const handleSimpleOnboardingComplete = (info: MovingInfo) => {
    setMovingInfo(info);
    // Save to localStorage for guests
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
    setCurrentView("dashboard");
  };

  const handleLoginRedirect = () => {
    setCurrentView("auth");
  };

  const handleAuthComplete = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    await loadUserProfile(authenticatedUser.id);
  };

  const handleTaskComplete = () => {
    // Only show signup prompt if not logged in and not already prompted
    if (!user && !localStorage.getItem(SIGNUP_PROMPTED_KEY)) {
      localStorage.setItem(SIGNUP_PROMPTED_KEY, "true");
      setShowSignupPrompt(true);
    }
  };

  const handleSignupComplete = async () => {
    setShowSignupPrompt(false);
    // User is now signed up, data will sync via auth listener
  };

  const handleSignupSkip = () => {
    setShowSignupPrompt(false);
  };

  const handleUpdateMovingInfo = async (data: Partial<MovingInfo>) => {
    if (!movingInfo) return;
    
    const updatedInfo = { ...movingInfo, ...data };
    setMovingInfo(updatedInfo);
    
    // Save to localStorage for guests
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedInfo));
    
    // Sync to database if logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({
            old_address: updatedInfo.oldAddress || null,
            new_address: updatedInfo.newAddress || null,
            moving_date: updatedInfo.movingDate || null,
            key_handover_date: updatedInfo.keyHandoverDate || null,
            moving_type: updatedInfo.type || null,
            renovation_type: updatedInfo.renovationType || "none",
            needs_contractor_help: updatedInfo.needsContractorHelp || false,
          })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMovingInfo(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(SIGNUP_PROMPTED_KEY);
    setCurrentView("onboarding");
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
    return <SimpleOnboarding onComplete={handleSimpleOnboardingComplete} onLogin={handleLoginRedirect} />;
  }

  if (currentView === "auth") {
    return <Auth 
      onComplete={handleAuthComplete} 
      onSignUpRequest={() => setCurrentView("onboarding")}
      onContinueAsGuest={() => setCurrentView("onboarding")}
    />;
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
          onTaskComplete={handleTaskComplete}
          onUpdateMovingInfo={handleUpdateMovingInfo}
          isGuest={!user}
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

      <SignupPromptDialog
        open={showSignupPrompt}
        onOpenChange={setShowSignupPrompt}
        onSignupComplete={handleSignupComplete}
        onSkip={handleSignupSkip}
      />
    </div>
  );
};

export default Index;
