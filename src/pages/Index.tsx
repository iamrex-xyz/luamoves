import { useState, useEffect } from "react";
import { SimpleOnboarding } from "@/components/SimpleOnboarding";
import { Auth } from "@/components/Auth";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { ChatHome } from "@/components/ChatHome";
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
  // Personalisatie velden
  propertyType?: "apartment" | "house" | "studio";
  hasGarden?: boolean;
  hasParking?: boolean;
  isVve?: boolean;
  currentSituation?: "rent" | "buy" | "parents" | "other";
  hasJob?: boolean;
  children?: number;
  pets?: number;
  // Smart questions velden
  hasGas?: "yes" | "no";
  hasSmartMeter?: "yes" | "no" | "unknown";
  glasvezel?: "yes" | "no" | "unknown";
  worksFromHome?: "yes" | "sometimes" | "no";
  buildingAccess?: "easy" | "medium" | "hard";
  insuranceValue?: "low" | "medium" | "high";
  buildingYear?: "new" | "recent" | "older" | "unknown";
  gardenSize?: "small" | "medium" | "large";
  childrenAges?: string;
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
    "onboarding" | "auth" | "dashboard" | "tasks" | "extras" | "settings" | "chat"
  >("onboarding");
  const [loading, setLoading] = useState(true);
  
  // Email capture dialog (after 1st task, or hard block after 2nd)
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isEmailHardBlock, setIsEmailHardBlock] = useState(false);
  
  // Full signup dialog (after 2nd task) - hard blocking
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  
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
        propertyType: (profile.housing_property_type as "apartment" | "house" | "studio") || undefined,
        hasGarden: profile.has_garden || false,
        hasParking: profile.has_parking || false,
        isVve: profile.is_vve || false,
        currentSituation: (profile.current_housing_situation as "rent" | "buy" | "parents" | "other") || undefined,
        hasJob: profile.has_job !== false,
        children: profile.children || 0,
        pets: profile.pets || 0,
        // Smart questions velden
        hasGas: (profile as any).has_gas as "yes" | "no" | undefined,
        hasSmartMeter: (profile as any).has_smart_meter as "yes" | "no" | "unknown" | undefined,
        glasvezel: (profile as any).glasvezel as "yes" | "no" | "unknown" | undefined,
        worksFromHome: (profile as any).works_from_home as "yes" | "sometimes" | "no" | undefined,
        buildingAccess: (profile as any).building_access as "easy" | "medium" | "hard" | undefined,
        insuranceValue: (profile as any).insurance_value as "low" | "medium" | "high" | undefined,
        buildingYear: (profile as any).building_year as "new" | "recent" | "older" | "unknown" | undefined,
        gardenSize: (profile as any).garden_size as "small" | "medium" | "large" | undefined,
        childrenAges: (profile as any).children_ages || undefined,
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
          housing_property_type: info.propertyType || null,
          has_garden: info.hasGarden || false,
          has_parking: info.hasParking || false,
          is_vve: info.isVve || false,
          current_housing_situation: info.currentSituation || null,
          has_job: info.hasJob !== false,
          children: info.children || 0,
          pets: info.pets || 0,
          // Smart questions velden
          has_gas: info.hasGas || null,
          has_smart_meter: info.hasSmartMeter || null,
          glasvezel: info.glasvezel || null,
          works_from_home: info.worksFromHome || null,
          building_access: info.buildingAccess || null,
          insurance_value: info.insuranceValue || null,
          building_year: info.buildingYear || null,
          garden_size: info.gardenSize || null,
          children_ages: info.childrenAges || null,
        } as any)
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
    console.log("[handleTaskComplete] Called with count:", completedCount, "user:", !!user, "capturedEmail:", capturedEmail);
    
    // Only show prompts if not logged in
    if (!user) {
      // Check if account is already complete (signed up)
      const isAccountComplete = sessionStorage.getItem("lua_account_complete") === "true";
      const emailAlreadyPrompted = sessionStorage.getItem(EMAIL_PROMPTED_KEY) === "true";
      
      console.log("[handleTaskComplete] isAccountComplete:", isAccountComplete, "emailAlreadyPrompted:", emailAlreadyPrompted);
      
      if (isAccountComplete) {
        console.log("[handleTaskComplete] Account already complete, skipping");
        return;
      }
      
      // After 2nd task - show signup dialog (hard blocking)
      // If no email captured yet, show email capture first (also hard blocking)
      if (completedCount >= 2) {
        if (capturedEmail) {
          console.log("[handleTaskComplete] Showing signup prompt");
          setShowSignupPrompt(true);
        } else {
          // Force email capture - this is now hard blocking
          console.log("[handleTaskComplete] Showing email capture (hard block)");
          setIsEmailHardBlock(true);
          setShowEmailCapture(true);
        }
        return;
      }
      
      // After 1st task - show email capture dialog (soft, can skip after entering)
      if (completedCount >= 1 && !emailAlreadyPrompted) {
        console.log("[handleTaskComplete] Showing email capture (soft)");
        sessionStorage.setItem(EMAIL_PROMPTED_KEY, "true");
        setIsEmailHardBlock(false);
        setShowEmailCapture(true);
        return;
      }
      
      console.log("[handleTaskComplete] No action taken");
    }
  };

  // Check on mount and whenever capturedEmail changes if we need to show signup
  useEffect(() => {
    if (!user && capturedEmail) {
      // Get completed count from session storage
      const savedTasks = sessionStorage.getItem(GUEST_TASKS_KEY);
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks);
          const completedCount = Object.values(tasks).filter((status) => status === "done").length;
          const isAccountComplete = sessionStorage.getItem("lua_account_complete") === "true";
          
          // If 2+ tasks completed, email captured, but account not complete - show signup
          if (completedCount >= 2 && !isAccountComplete && !showSignupPrompt) {
            setShowSignupPrompt(true);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [user, capturedEmail, showSignupPrompt]);

  const handleEmailSubmit = (email: string) => {
    setCapturedEmail(email);
    sessionStorage.setItem(CAPTURED_EMAIL_KEY, email);
    setShowEmailCapture(false);
    
    // If this was a hard block (after 2nd task), immediately show signup
    if (isEmailHardBlock) {
      setIsEmailHardBlock(false);
      // Use setTimeout to ensure state updates properly
      setTimeout(() => {
        setShowSignupPrompt(true);
      }, 100);
    }
  };


  const handleSignupComplete = async () => {
    setShowSignupPrompt(false);
    setShowAccountBadge(false);
    setCapturedEmail("");
    sessionStorage.setItem("lua_account_complete", "true");
    sessionStorage.removeItem(CAPTURED_EMAIL_KEY);
    // User is now signed up, data will sync via auth listener
  };

  const handleBadgeClick = () => {
    // If we have an email, show signup prompt, otherwise show email capture
    if (capturedEmail) {
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
            housing_property_type: updatedInfo.propertyType || null,
            has_garden: updatedInfo.hasGarden || false,
            has_parking: updatedInfo.hasParking || false,
            is_vve: updatedInfo.isVve || false,
            current_housing_situation: updatedInfo.currentSituation || null,
            has_job: updatedInfo.hasJob !== false,
            children: updatedInfo.children || 0,
            pets: updatedInfo.pets || 0,
            // Smart questions velden
            has_gas: updatedInfo.hasGas || null,
            has_smart_meter: updatedInfo.hasSmartMeter || null,
            glasvezel: updatedInfo.glasvezel || null,
            works_from_home: updatedInfo.worksFromHome || null,
            building_access: updatedInfo.buildingAccess || null,
            insurance_value: updatedInfo.insuranceValue || null,
            building_year: updatedInfo.buildingYear || null,
            garden_size: updatedInfo.gardenSize || null,
            children_ages: updatedInfo.childrenAges || null,
          } as any)
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
          onSignupClick={handleBadgeClick}
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
          onSignupClick={handleBadgeClick}
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
      {currentView === "chat" && movingInfo && (
        <ChatHome 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
          isGuest={!user}
          onSignupClick={handleBadgeClick}
        />
      )}

      {/* Email capture dialog - shown after 1st task (soft) or 2nd task (hard block) */}
      <EmailCaptureDialog
        open={showEmailCapture}
        onOpenChange={setShowEmailCapture}
        onEmailSubmit={handleEmailSubmit}
        isHardBlock={isEmailHardBlock}
      />

      {/* Full signup dialog - shown after 2nd task (hard blocking) */}
      <SignupPromptDialog
        open={showSignupPrompt}
        onOpenChange={setShowSignupPrompt}
        onSignupComplete={handleSignupComplete}
        capturedEmail={capturedEmail}
      />
    </div>
  );
};

export default Index;
