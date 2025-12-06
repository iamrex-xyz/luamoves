import { useState, useEffect } from "react";
import { SimpleOnboarding } from "@/components/SimpleOnboarding";
import { Auth } from "@/components/Auth";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { EmailCaptureDialog } from "@/components/EmailCaptureDialog";
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

const LOCAL_STORAGE_KEY = "lua_moving_info";
const EMAIL_PROMPTED_KEY = "lua_email_prompted";
const SIGNUP_PROMPTED_KEY = "lua_signup_prompted";
const CAPTURED_EMAIL_KEY = "lua_captured_email";
const GUEST_TASKS_KEY = "lua_guest_tasks";

const Index = () => {
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<
    "onboarding" | "auth" | "dashboard" | "tasks" | "extras" | "settings"
  >("onboarding");
  const [loading, setLoading] = useState(true);
  
  // Email capture dialog (after 1st task)
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  
  // Full signup dialog (after 2nd task)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [isHardBlock, setIsHardBlock] = useState(false);
  
  // Captured email for signup flow
  const [capturedEmail, setCapturedEmail] = useState<string>("");
  
  // Badge reminder
  const [showAccountBadge, setShowAccountBadge] = useState(false);
  
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

      // Load captured email if exists
      const savedEmail = sessionStorage.getItem(CAPTURED_EMAIL_KEY);
      if (savedEmail) {
        setCapturedEmail(savedEmail);
      }

      // No user - check sessionStorage for guest data (cleared when browser closes)
      const savedInfo = sessionStorage.getItem(LOCAL_STORAGE_KEY);
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
      // Check if we have session data to sync
      const savedInfo = sessionStorage.getItem(LOCAL_STORAGE_KEY);
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
    const savedInfo = sessionStorage.getItem(LOCAL_STORAGE_KEY);
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

      // Clear sessionStorage after sync
      sessionStorage.removeItem(LOCAL_STORAGE_KEY);
      sessionStorage.removeItem(EMAIL_PROMPTED_KEY);
      sessionStorage.removeItem(SIGNUP_PROMPTED_KEY);
      sessionStorage.removeItem(CAPTURED_EMAIL_KEY);
      
      setCurrentView("dashboard");
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  const handleSimpleOnboardingComplete = (info: MovingInfo) => {
    setMovingInfo(info);
    // Save to sessionStorage for guests (cleared when browser closes)
    sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
    setCurrentView("dashboard");
  };

  const handleLoginRedirect = () => {
    setCurrentView("auth");
  };

  const handleAuthComplete = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    await loadUserProfile(authenticatedUser.id);
  };

  const handleTaskComplete = (completedCount: number) => {
    // Only show prompts if not logged in
    if (!user) {
      // Hard block at 6 tasks - must create account
      if (completedCount >= 6) {
        setIsHardBlock(true);
        setShowSignupPrompt(true);
        return;
      }
      
      // After 2nd task (or any subsequent task) - show full signup dialog
      // Re-show if user skipped before and completes another task
      if (completedCount >= 2) {
        setIsHardBlock(false);
        setShowSignupPrompt(true);
        return;
      }
      
      // After 1st task - show email capture dialog (if not already prompted)
      if (completedCount >= 1 && !sessionStorage.getItem(EMAIL_PROMPTED_KEY)) {
        sessionStorage.setItem(EMAIL_PROMPTED_KEY, "true");
        setShowEmailCapture(true);
        return;
      }
    }
  };

  const handleEmailSubmit = (email: string) => {
    setCapturedEmail(email);
    sessionStorage.setItem(CAPTURED_EMAIL_KEY, email);
    setShowEmailCapture(false);
  };


  const handleSignupComplete = async () => {
    setShowSignupPrompt(false);
    setShowAccountBadge(false);
    setIsHardBlock(false);
    setCapturedEmail("");
    sessionStorage.removeItem(CAPTURED_EMAIL_KEY);
    // User is now signed up, data will sync via auth listener
  };

  const handleSignupSkip = () => {
    setShowSignupPrompt(false);
    setShowAccountBadge(true); // Show reminder badge
  };

  const handleBadgeClick = () => {
    // If we have an email, show signup prompt, otherwise show email capture
    if (capturedEmail) {
      setIsHardBlock(false);
      setShowSignupPrompt(true);
    } else {
      setShowEmailCapture(true);
    }
  };

  const handleUpdateMovingInfo = async (data: Partial<MovingInfo>) => {
    if (!movingInfo) return;
    
    const updatedInfo = { ...movingInfo, ...data };
    setMovingInfo(updatedInfo);
    
    // Save to sessionStorage for guests (cleared when browser closes)
    sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedInfo));
    
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
    setCapturedEmail("");
    // Clear all guest session data including task statuses
    sessionStorage.removeItem(LOCAL_STORAGE_KEY);
    sessionStorage.removeItem(EMAIL_PROMPTED_KEY);
    sessionStorage.removeItem(SIGNUP_PROMPTED_KEY);
    sessionStorage.removeItem(CAPTURED_EMAIL_KEY);
    sessionStorage.removeItem(GUEST_TASKS_KEY);
    setCurrentView("onboarding");
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {currentView === "dashboard" && movingInfo && (
        <Dashboard 
          movingInfo={movingInfo} 
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          onTaskComplete={handleTaskComplete}
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
          showAccountBadge={showAccountBadge}
          onAccountBadgeClick={handleBadgeClick}
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

      {/* Email capture dialog - shown after 1st task */}
      <EmailCaptureDialog
        open={showEmailCapture}
        onOpenChange={setShowEmailCapture}
        onEmailSubmit={handleEmailSubmit}
      />

      {/* Full signup dialog - shown after 2nd task */}
      <SignupPromptDialog
        open={showSignupPrompt}
        onOpenChange={setShowSignupPrompt}
        onSignupComplete={handleSignupComplete}
        onSkip={handleSignupSkip}
        isHardBlock={isHardBlock}
        capturedEmail={capturedEmail}
      />
    </div>
  );
};

export default Index;
