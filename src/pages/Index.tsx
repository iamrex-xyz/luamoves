import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams, useNavigate, useLocation } from "react-router-dom";
import { SimpleOnboarding } from "@/components/SimpleOnboarding";
import { Auth } from "@/components/Auth";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { ChatHome } from "@/components/ChatHome";
import { AccountCreationDialog } from "@/components/AccountCreationDialog";
import { HouseholdInviteSignup } from "@/components/HouseholdInviteSignup";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MovingInfo, AppView } from "@/types/moving";
import { useGuestStorage } from "@/hooks/useGuestStorage";
import { usePhoneAuthFlow } from "@/hooks/usePhoneAuthFlow";

// Re-export MovingInfo for backward compatibility
export type { MovingInfo } from "@/types/moving";

const LOCAL_STORAGE_KEY = "lua_moving_info";

// Dutch SEO-friendly step configuration
const AANMELDEN_STEPS = {
  welkom: { step: 1, path: "/aanmelden/welkom" },
  verhuisdatum: { step: 2, path: "/aanmelden/verhuisdatum" },
  woningtype: { step: 3, path: "/aanmelden/woningtype" },
  adres: { step: 4, path: "/aanmelden/adres" },
  overzicht: { step: 5, path: "/aanmelden/overzicht" },
} as const;

type AanmeldenStepId = keyof typeof AANMELDEN_STEPS;

const STEP_NUMBER_TO_ID: Record<number, AanmeldenStepId> = {
  1: "welkom",
  2: "verhuisdatum",
  3: "woningtype",
  4: "adres",
  5: "overzicht",
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { stap } = useParams<{ stap?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("onboarding");
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<{ phone: string; name?: string; ownerUserId: string } | null>(null);
  const [showSignupFromAuth, setShowSignupFromAuth] = useState(false);
  const { toast } = useToast();

  // Use guest storage hook
  const guestStorage = useGuestStorage();

  // Use phone-first auth flow hook
  const phoneAuthFlow = usePhoneAuthFlow(!!user);

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile && (profile.moving_date || profile.old_address || profile.new_address)) {
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
        phone: (profile as any).phone,
        // KOOP-specifieke intake velden
        hypotheekDoel: (profile as any).hypotheek_doel,
        hypotheekWerkSituatie: (profile as any).hypotheek_werksituatie,
        hypotheekHeeftPartner: (profile as any).hypotheek_heeft_partner,
        hypotheekKoopsom: (profile as any).hypotheek_koopsom,
        notarisDienst: (profile as any).notaris_dienst,
        taxatieDoel: (profile as any).taxatie_doel,
        taxatieVoorkeursdatum: (profile as any).taxatie_voorkeursdatum,
        bouwkundigeKeuringVoorkeursdatum: (profile as any).bouwkundige_keuring_voorkeursdatum,
        opstalDakType: (profile as any).opstal_dak_type,
        slotVeiligheidsniveau: (profile as any).slot_veiligheidsniveau,
        slotAantalDeuren: (profile as any).slot_aantal_deuren,
        slotMontage: (profile as any).slot_montage,
        verhuisliftLocatie: (profile as any).verhuislift_locatie,
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
      }
      // Authenticated users always go to dashboard (even with empty profile)
      setCurrentView("dashboard");
    }
    setLoading(false);
  }, []);

  // Sync local data to profile
  const syncLocalDataToProfile = async (userId: string, info: MovingInfo) => {
    try {
      // Get captured phone from localStorage if not in info
      const capturedPhone = localStorage.getItem("lua_captured_phone") || info.phone || null;
      
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
          user_id: userId,
          old_address: info.oldAddress,
          new_address: info.newAddress,
          moving_date: info.movingDate || null,
          key_handover_date: info.keyHandoverDate || null,
          moving_type: info.type,
          renovation_type: info.renovationType || "none",
          needs_contractor_help: info.needsContractorHelp || false,
          housing_property_type: info.propertyType || info.housingPropertyType || null,
          has_garden: info.hasGarden || false,
          has_parking: info.hasParking || false,
          is_vve: info.isVve || false,
          current_housing_situation: info.currentSituation || null,
          has_job: info.hasJob !== false,
          adults: info.adults || 1,
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
          phone: capturedPhone,
        } as any,
          { onConflict: 'user_id' }
        );

      if (upsertError) {
        console.error('Error syncing profile to database:', upsertError);
        return;
      }

      console.log('[syncLocalDataToProfile] Successfully synced profile for user:', userId);

      // Clear local storage after successful sync
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem("lua_email_prompted");
      localStorage.removeItem("lua_signup_prompted");
      localStorage.removeItem("lua_captured_email");
      localStorage.removeItem("lua_captured_phone");
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  // Check for invite token in URL
  useEffect(() => {
    const token = searchParams.get("invite");
    if (token && !user) {
      setInviteToken(token);
      // Fetch invite data via secure edge function
      const fetchInviteData = async () => {
        try {
          const response = await supabase.functions.invoke("verify-household-invite", {
            body: { invite_token: token },
          });

          if (response.error || !response.data?.success || !response.data?.data) {
            toast({
              title: "Ongeldige uitnodiging",
              description: "Deze uitnodigingslink is niet meer geldig.",
              variant: "destructive",
            });
            setInviteToken(null);
            // Remove invite param from URL
            searchParams.delete("invite");
            setSearchParams(searchParams);
            return;
          }

          const inviteInfo = response.data.data;

          if (inviteInfo.status === "active") {
            toast({
              title: "Al geaccepteerd",
              description: "Je bent al lid van dit huishouden. Log in om verder te gaan.",
            });
            setInviteToken(null);
            searchParams.delete("invite");
            setSearchParams(searchParams);
            setCurrentView("auth");
            return;
          }

          setInviteData({
            phone: inviteInfo.phone,
            name: inviteInfo.name || undefined,
            ownerUserId: inviteInfo.owner_user_id,
          });
        } catch (error) {
          console.error("Error verifying invite:", error);
          toast({
            title: "Fout",
            description: "Er ging iets mis bij het controleren van de uitnodiging.",
            variant: "destructive",
          });
          setInviteToken(null);
          searchParams.delete("invite");
          setSearchParams(searchParams);
        }
      };

      fetchInviteData();
    }
  }, [searchParams, user, toast, setSearchParams]);

  // Initialize app
  useEffect(() => {
    const isLandingRoute = location.pathname === "/" || searchParams.get("landing") === "1";
    const isDashboardRoute = location.pathname === "/dashboard";

    const initializeApp = async () => {
      // Auth disabled: auto sign-out any existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        await supabase.auth.signOut();
      }
      setUser(null);

      // Load guest data from localStorage
      const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedInfo) {
        try {
          setMovingInfo(JSON.parse(savedInfo));
        } catch {
          // ignore parse errors
        }
      }

      // /dashboard → straight to dashboard (guest mode)
      if (isDashboardRoute) {
        setCurrentView("dashboard");
        setLoading(false);
        return;
      }

      // / or ?landing=1 → landing page
      setCurrentView("onboarding");
      setLoading(false);
    };


    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        // Only reset to onboarding on explicit sign-out
        if (event === "SIGNED_OUT") {
          setMovingInfo(null);
          setCurrentView("onboarding");
          setLoading(false);
          return;
        }

        // Skip events without a user (e.g. INITIAL_SESSION before hash is processed)
        if (!session?.user) return;

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Clear invite token after sign in
          setInviteToken(null);
          setInviteData(null);
          searchParams.delete("invite");
          setSearchParams(searchParams);
          
          // Use setTimeout to avoid Supabase deadlock warning
          setTimeout(async () => {
            // Try to merge anonymous data first
            const anonId = localStorage.getItem("lua_anonymous_user_id");
            if (anonId) {
              try {
                await supabase.rpc('merge_anonymous_to_user', {
                  p_anonymous_user_id: anonId,
                  p_user_id: session.user.id,
                });
              localStorage.removeItem("lua_anonymous_user_id");
                // Clear the anonymous cookie
                document.cookie = "lua_anon_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                console.log('[Auth] Merged anonymous data for user:', session.user.id);
              } catch (err) {
                console.error('[Auth] Failed to merge anonymous data:', err);
              }
            }

            // Set localStorage flags so usePhoneAuthFlow knows user has an account
            localStorage.setItem("lua_has_account", "true");
            localStorage.setItem("lua_guest_limit_reached", "false");

            const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedInfo) {
              await syncLocalDataToProfile(session.user.id, JSON.parse(savedInfo));
            }
            // Always load profile after sync to ensure latest data
            await loadUserProfile(session.user.id);
            // Route to dashboard URL if currently on landing
            if (window.location.pathname === "/") {
              navigate("/dashboard", { replace: true });
            }
          }, 0);
        }
      }
    );

    initializeApp();

    return () => subscription.unsubscribe();
  }, [loadUserProfile, searchParams, setSearchParams, toast]);

  // Save profile data for anonymous users directly to database
  const syncAnonymousDataToProfile = async (anonId: string, info: MovingInfo) => {
    try {
      const capturedPhone = localStorage.getItem("lua_captured_phone") || info.phone || null;
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: crypto.randomUUID(),
          anonymous_user_id: anonId,
          old_address: info.oldAddress || null,
          new_address: info.newAddress || null,
          moving_date: info.movingDate || null,
          key_handover_date: info.keyHandoverDate || null,
          moving_type: info.type || null,
          renovation_type: info.renovationType || "none",
          needs_contractor_help: info.needsContractorHelp || false,
          housing_property_type: info.propertyType || info.housingPropertyType || null,
          has_garden: info.hasGarden || false,
          has_parking: info.hasParking || false,
          is_vve: info.isVve || false,
          current_housing_situation: info.currentSituation || null,
          has_job: info.hasJob !== false,
          adults: info.adults || 1,
          children: info.children || 0,
          pets: info.pets || 0,
          moving_budget: info.movingBudget || null,
          phone: capturedPhone,
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
        } as any);

      if (error) {
        console.error('[syncAnonymousDataToProfile] Error:', error);
      } else {
        console.log('[syncAnonymousDataToProfile] Successfully saved for anon:', anonId);
        // Mark that we've synced this to DB so we don't duplicate
        localStorage.setItem('lua_anon_profile_synced', 'true');
      }
    } catch (error) {
      console.error('[syncAnonymousDataToProfile] Exception:', error);
    }
  };



  // Handlers
  const handleOnboardingComplete = async (info: MovingInfo) => {
    setMovingInfo(info);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
    setCurrentView("dashboard");

    // If user is already logged in, sync to database immediately
    if (user) {
      await syncLocalDataToProfile(user.id, info);
    } else {
      // Save to database for anonymous users too (only once)
      const alreadySynced = localStorage.getItem('lua_anon_profile_synced');
      if (!alreadySynced) {
        const anonId = phoneAuthFlow.anonymousUserId || localStorage.getItem("lua_anonymous_user_id");
        if (anonId) {
          await syncAnonymousDataToProfile(anonId, info);
        }
      }
    }
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
          .upsert(
            {
            user_id: user.id,
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
            adults: updatedInfo.adults || 1,
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
          } as any,
            { onConflict: 'user_id' }
          );
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

  // Determine initial step from URL for /aanmelden/:stap routes
  const isAanmeldenRoute = location.pathname.startsWith("/aanmelden");
  const currentStepId = stap as AanmeldenStepId | undefined;
  const initialStep = currentStepId && AANMELDEN_STEPS[currentStepId] 
    ? AANMELDEN_STEPS[currentStepId].step 
    : 1;

  // Handle step changes for URL routing
  const handleStepChange = (stepNumber: number) => {
    const stepId = STEP_NUMBER_TO_ID[stepNumber];
    if (stepId && AANMELDEN_STEPS[stepId] && isAanmeldenRoute) {
      navigate(AANMELDEN_STEPS[stepId].path, { replace: true });
    }
  };

  // Onboarding
  if (currentView === "onboarding") {
    // Redirect to /aanmelden/welkom if on root and showing onboarding
    if (location.pathname === "/" && !searchParams.get("invite")) {
      // Stay on root for now, but use Dutch routes when navigating
    }
    
    return (
      <ErrorBoundary>
        <SimpleOnboarding 
          onComplete={handleOnboardingComplete} 
          onLogin={() => setCurrentView("auth")}
          initialStep={isAanmeldenRoute ? initialStep : 1}
          onStepChange={isAanmeldenRoute ? handleStepChange : undefined}
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
          onSignUpRequest={() => setShowSignupFromAuth(true)}
          onContinueAsGuest={() => setCurrentView("onboarding")}
        />
        <AccountCreationDialog
          open={showSignupFromAuth}
          onOpenChange={setShowSignupFromAuth}
          onAccountCreated={() => {
            setShowSignupFromAuth(false);
          }}
          onDefer={() => setShowSignupFromAuth(false)}
          onLoginRequest={() => {
            setShowSignupFromAuth(false);
          }}
          isHardBlock={false}
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
            onTaskComplete={phoneAuthFlow.handleTaskComplete}
            onSignupClick={phoneAuthFlow.triggerPhoneDialog}
            onUpdateMovingInfo={handleUpdateMovingInfo}
          />
        )}
        {currentView === "tasks" && movingInfo && (
          <TaskList 
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            onTaskComplete={phoneAuthFlow.handleTaskComplete}
            onUpdateMovingInfo={handleUpdateMovingInfo}
            isGuest={!user}
            showAccountBadge={phoneAuthFlow.showAccountBadge}
            onAccountBadgeClick={phoneAuthFlow.triggerPhoneDialog}
            onSignupClick={phoneAuthFlow.triggerPhoneDialog}
          />
        )}
        {currentView === "extras" && movingInfo && (
          <Extras 
            onNavigate={setCurrentView}
            isGuest={!user}
            onSignupClick={phoneAuthFlow.triggerPhoneDialog}
          />
        )}
        {currentView === "settings" && movingInfo && (
          <Settings 
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
            onUpdate={setMovingInfo}
            isGuest={!user}
            onSignupClick={phoneAuthFlow.triggerPhoneDialog}
            user={user}
          />
        )}
        {currentView === "chat" && movingInfo && (
          <ChatHome 
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            isGuest={!user}
            onSignupClick={phoneAuthFlow.triggerPhoneDialog}
          />
        )}

        {/* Account creation dialog: phone → email → magic link */}
        <AccountCreationDialog
          open={phoneAuthFlow.showPhoneOTP}
          onOpenChange={phoneAuthFlow.setShowPhoneOTP}
          onAccountCreated={() => phoneAuthFlow.handlePhoneVerified(phoneAuthFlow.anonymousUserId || "user", false)}
          onDefer={phoneAuthFlow.handlePhoneOTPDismiss}
          isHardBlock={phoneAuthFlow.isPhoneOTPHardBlock}
        />

        {/* Household invite signup dialog */}
        {inviteToken && inviteData && (
          <HouseholdInviteSignup
            open={!!inviteToken && !!inviteData}
            onOpenChange={() => {
              setInviteToken(null);
              setInviteData(null);
              searchParams.delete("invite");
              setSearchParams(searchParams);
            }}
            inviteToken={inviteToken}
            phone={inviteData.phone}
            name={inviteData.name}
            ownerUserId={inviteData.ownerUserId}
            onComplete={() => {
              setInviteToken(null);
              setInviteData(null);
              searchParams.delete("invite");
              setSearchParams(searchParams);
            }}
          />
        )}

      </div>
    </ErrorBoundary>
  );
};

export default Index;
