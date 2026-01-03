import { useState, useEffect, useCallback } from "react";
import { SimpleOnboarding } from "@/components/SimpleOnboarding";
import { Auth } from "@/components/Auth";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { ChatHome } from "@/components/ChatHome";
import { PhoneCaptureDialog } from "@/components/PhoneCaptureDialog";
import { AccountCreationDialog } from "@/components/AccountCreationDialog";
// MilestoneCelebrationDialog removed - not used in strict flow
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MovingInfo, AppView } from "@/types/moving";
import { useGuestStorage } from "@/hooks/useGuestStorage";
import { useSignupFlow } from "@/hooks/useSignupFlow";

// Re-export MovingInfo for backward compatibility
export type { MovingInfo } from "@/types/moving";

const LOCAL_STORAGE_KEY = "lua_moving_info";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("onboarding");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use guest storage hook
  const guestStorage = useGuestStorage();

  // Use signup flow hook - pass true if user IS logged in
  const signupFlow = useSignupFlow(!!user);

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile && profile.moving_date) {
      const info: MovingInfo = {
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
        movingBudget: profile.moving_budget || undefined,
        hasGas: (profile as any).has_gas,
        hasSmartMeter: (profile as any).has_smart_meter,
        glasvezel: (profile as any).glasvezel,
        worksFromHome: (profile as any).works_from_home,
        buildingAccess: (profile as any).building_access,
        insuranceValue: (profile as any).insurance_value,
        buildingYear: (profile as any).building_year,
        gardenSize: (profile as any).garden_size,
        childrenAges: (profile as any).children_ages,
        energyCurrentSupplier: (profile as any).energy_current_supplier,
        energyConnectionType: (profile as any).energy_connection_type,
        hasFiber: (profile as any).has_fiber,
        internetSpeedPreference: (profile as any).internet_speed_preference,
        internetBundle: (profile as any).internet_bundle,
        floorLevel: (profile as any).floor_level,
        hasElevator: (profile as any).has_elevator,
        numberOfRooms: (profile as any).number_of_rooms,
        specialItems: (profile as any).special_items || [],
        hasFragileItems: (profile as any).has_fragile_items,
        homeSizeM2: (profile as any).home_size_m2,
        forwardingStartDate: (profile as any).forwarding_start_date,
        forwardingDuration: (profile as any).forwarding_duration,
        householdNames: (profile as any).household_names || [],
        municipality: (profile as any).municipality,
        serviceType: (profile as any).service_type,
        preferredServiceDate: (profile as any).preferred_service_date,
        numberOfFloors: (profile as any).number_of_floors,
        numberOfBedrooms: (profile as any).number_of_bedrooms,
        gardenServiceType: (profile as any).garden_service_type,
        renovationBudget: (profile as any).renovation_budget,
        renovationStartDate: (profile as any).renovation_start_date,
        housingPropertyType: (profile as any).housing_property_type,
      };
      setMovingInfo(info);
      setCurrentView("dashboard");
    } else {
      // Check for local data to sync
      const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setMovingInfo(parsed);
        await syncLocalDataToProfile(userId, parsed);
        setCurrentView("dashboard");
      } else {
        setCurrentView("onboarding");
      }
    }
    setLoading(false);
  }, []);

  // Sync local data to profile
  const syncLocalDataToProfile = async (userId: string, info: MovingInfo) => {
    try {
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
          moving_budget: info.movingBudget || null,
          has_gas: info.hasGas || null,
          has_smart_meter: info.hasSmartMeter || null,
          glasvezel: info.glasvezel || null,
          works_from_home: info.worksFromHome || null,
          building_access: info.buildingAccess || null,
          insurance_value: info.insuranceValue || null,
          building_year: info.buildingYear || null,
          garden_size: info.gardenSize || null,
          children_ages: info.childrenAges || null,
          energy_current_supplier: info.energyCurrentSupplier || null,
          energy_connection_type: info.energyConnectionType || null,
          has_fiber: info.hasFiber || null,
          internet_speed_preference: info.internetSpeedPreference || null,
          internet_bundle: info.internetBundle || null,
          floor_level: info.floorLevel || null,
          has_elevator: info.hasElevator || null,
          number_of_rooms: info.numberOfRooms || null,
          special_items: info.specialItems || [],
          has_fragile_items: info.hasFragileItems || null,
          home_size_m2: info.homeSizeM2 || null,
          forwarding_start_date: info.forwardingStartDate || null,
          forwarding_duration: info.forwardingDuration || null,
          household_names: info.householdNames || [],
          municipality: info.municipality || null,
          service_type: info.serviceType || null,
          preferred_service_date: info.preferredServiceDate || null,
          number_of_floors: info.numberOfFloors || null,
          number_of_bedrooms: info.numberOfBedrooms || null,
          garden_service_type: info.gardenServiceType || null,
          renovation_budget: info.renovationBudget || null,
          renovation_start_date: info.renovationStartDate || null,
          phone: info.phone || null,
        } as any)
        .eq('user_id', userId);

      // Clear local storage after sync
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem("lua_email_prompted");
      localStorage.removeItem("lua_signup_prompted");
      localStorage.removeItem("lua_captured_email");
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
        return;
      }

      // Guest mode - load from localStorage
      const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedInfo) {
        try {
          setMovingInfo(JSON.parse(savedInfo));
          setCurrentView("dashboard");
        } catch {
          setCurrentView("onboarding");
        }
      } else {
        setCurrentView("onboarding");
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        // If the session is cleared (logout), immediately return to onboarding.
        if (event === "SIGNED_OUT" || !session?.user) {
          setMovingInfo(null);
          setCurrentView("onboarding");
          return;
        }

        if (session?.user && event === "SIGNED_IN") {
          setTimeout(() => {
            const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedInfo) {
              syncLocalDataToProfile(session.user.id, JSON.parse(savedInfo));
            }
          }, 0);
        }
      }
    );

    initializeApp();

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  // Handlers
  const handleOnboardingComplete = (info: MovingInfo) => {
    setMovingInfo(info);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
    setCurrentView("dashboard");
  };

  const handleAuthComplete = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    await loadUserProfile(authenticatedUser.id);
  };

  const handleUpdateMovingInfo = async (data: Partial<MovingInfo>) => {
    if (!movingInfo) return;
    
    const updatedInfo = { ...movingInfo, ...data };
    setMovingInfo(updatedInfo);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedInfo));
    
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
            moving_budget: updatedInfo.movingBudget || null,
            has_gas: updatedInfo.hasGas || null,
            has_smart_meter: updatedInfo.hasSmartMeter || null,
            glasvezel: updatedInfo.glasvezel || null,
            works_from_home: updatedInfo.worksFromHome || null,
            building_access: updatedInfo.buildingAccess || null,
            insurance_value: updatedInfo.insuranceValue || null,
            building_year: updatedInfo.buildingYear || null,
            garden_size: updatedInfo.gardenSize || null,
            children_ages: updatedInfo.childrenAges || null,
            energy_current_supplier: updatedInfo.energyCurrentSupplier || null,
            energy_connection_type: updatedInfo.energyConnectionType || null,
            has_fiber: updatedInfo.hasFiber || null,
            internet_speed_preference: updatedInfo.internetSpeedPreference || null,
            internet_bundle: updatedInfo.internetBundle || null,
            floor_level: updatedInfo.floorLevel || null,
            has_elevator: updatedInfo.hasElevator || null,
            number_of_rooms: updatedInfo.numberOfRooms || null,
            special_items: updatedInfo.specialItems || [],
            has_fragile_items: updatedInfo.hasFragileItems || null,
            home_size_m2: updatedInfo.homeSizeM2 || null,
            forwarding_start_date: updatedInfo.forwardingStartDate || null,
            forwarding_duration: updatedInfo.forwardingDuration || null,
            household_names: updatedInfo.householdNames || [],
            municipality: updatedInfo.municipality || null,
            service_type: updatedInfo.serviceType || null,
            preferred_service_date: updatedInfo.preferredServiceDate || null,
            number_of_floors: updatedInfo.numberOfFloors || null,
            number_of_bedrooms: updatedInfo.numberOfBedrooms || null,
            garden_service_type: updatedInfo.gardenServiceType || null,
            renovation_budget: updatedInfo.renovationBudget || null,
            renovation_start_date: updatedInfo.renovationStartDate || null,
          } as any)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleLogout = async () => {
    let hadError = false;

    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch (error: any) {
      hadError = true;
      // We still clear local state so the user can continue as guest.
      toast({
        title: "Uitloggen lukte niet helemaal",
        description: error?.message || "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setUser(null);
      setMovingInfo(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      guestStorage.clearAllData();
      setCurrentView("onboarding");

      if (!hadError) {
        toast({
          title: "Uitgelogd",
          description: "Je bent succesvol uitgelogd.",
        });
      }
    }
  };

  // Loading state
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

  // Onboarding
  if (currentView === "onboarding") {
    return (
      <ErrorBoundary>
        <SimpleOnboarding 
          onComplete={handleOnboardingComplete} 
          onLogin={() => setCurrentView("auth")} 
        />
      </ErrorBoundary>
    );
  }

  // Auth
  if (currentView === "auth") {
    return (
      <ErrorBoundary>
        <Auth 
          onComplete={handleAuthComplete} 
          onSignUpRequest={() => setCurrentView("onboarding")}
          onContinueAsGuest={() => setCurrentView("onboarding")}
        />
      </ErrorBoundary>
    );
  }

  // Main app
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
        {currentView === "dashboard" && movingInfo && (
          <Dashboard 
            movingInfo={movingInfo} 
            onNavigate={setCurrentView}
            onTaskComplete={signupFlow.handleTaskComplete}
            onSignupClick={signupFlow.handleBadgeClick}
          />
        )}
        {currentView === "tasks" && movingInfo && (
          <TaskList 
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            onTaskComplete={signupFlow.handleTaskComplete}
            onUpdateMovingInfo={handleUpdateMovingInfo}
            isGuest={!user}
            showAccountBadge={signupFlow.showAccountBadge}
            onAccountBadgeClick={signupFlow.handleBadgeClick}
            onSignupClick={signupFlow.handleBadgeClick}
          />
        )}
        {currentView === "extras" && movingInfo && (
          <Extras 
            onNavigate={setCurrentView}
            isGuest={!user}
            onSignupClick={signupFlow.handleBadgeClick}
          />
        )}
        {currentView === "settings" && movingInfo && (
          <Settings 
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
            onUpdate={setMovingInfo}
            isGuest={!user}
            onSignupClick={signupFlow.handleBadgeClick}
            onTaskComplete={signupFlow.handleTaskComplete}
          />
        )}
        {currentView === "chat" && movingInfo && (
          <ChatHome 
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            isGuest={!user}
            onSignupClick={signupFlow.handleBadgeClick}
          />
        )}

        {/* Phone capture dialog (Step 1) */}
        <PhoneCaptureDialog
          open={signupFlow.showPhoneCapture}
          onOpenChange={signupFlow.setShowPhoneCapture}
          onPhoneSubmit={signupFlow.handlePhoneSubmit}
          onDismiss={signupFlow.handlePhoneDismiss}
          isHardBlock={signupFlow.isPhoneHardBlock}
        />

        {/* Account creation dialog (Step 2) */}
        <AccountCreationDialog
          open={signupFlow.showAccountCreation}
          onOpenChange={signupFlow.setShowAccountCreation}
          onAccountCreated={signupFlow.handleAccountCreated}
          onDefer={signupFlow.handleAccountDefer}
          onLoginRequest={() => {
            signupFlow.setShowAccountCreation(false);
            setCurrentView("auth");
          }}
          capturedPhone={signupFlow.capturedPhone}
          isHardBlock={signupFlow.isAccountHardBlock}
        />

      </div>
    </ErrorBoundary>
  );
};

export default Index;
