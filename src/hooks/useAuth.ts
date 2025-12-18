import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { MovingInfo } from "@/types/moving";
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = "lua_moving_info";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Allow parent to handle data sync
        }
      }
    );

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string): Promise<MovingInfo | null> => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile && profile.moving_date) {
      return {
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
        hasGas: (profile as any).has_gas as "yes" | "no" | undefined,
        hasSmartMeter: (profile as any).has_smart_meter as "yes" | "no" | "unknown" | undefined,
        glasvezel: (profile as any).glasvezel as "yes" | "no" | "unknown" | undefined,
        worksFromHome: (profile as any).works_from_home as "yes" | "sometimes" | "no" | undefined,
        buildingAccess: (profile as any).building_access as "easy" | "medium" | "hard" | undefined,
        insuranceValue: (profile as any).insurance_value as "low" | "medium" | "high" | undefined,
        buildingYear: (profile as any).building_year as "new" | "recent" | "older" | "unknown" | undefined,
        gardenSize: (profile as any).garden_size as "small" | "medium" | "large" | undefined,
        childrenAges: (profile as any).children_ages || undefined,
        energyCurrentSupplier: (profile as any).energy_current_supplier || undefined,
        energyConnectionType: (profile as any).energy_connection_type as "gas_stroom" | "alleen_stroom" | undefined,
        hasFiber: (profile as any).has_fiber as "yes" | "no" | "unknown" | undefined,
        internetSpeedPreference: (profile as any).internet_speed_preference as "basic" | "medium" | "high" | undefined,
        internetBundle: (profile as any).internet_bundle as "internet_only" | "internet_tv" | "internet_tv_mobile" | undefined,
        floorLevel: (profile as any).floor_level || undefined,
        hasElevator: (profile as any).has_elevator || undefined,
        numberOfRooms: (profile as any).number_of_rooms || undefined,
        specialItems: (profile as any).special_items || [],
        hasFragileItems: (profile as any).has_fragile_items || undefined,
        homeSizeM2: (profile as any).home_size_m2 || undefined,
        forwardingStartDate: (profile as any).forwarding_start_date || undefined,
        forwardingDuration: (profile as any).forwarding_duration || undefined,
        householdNames: (profile as any).household_names || [],
        municipality: (profile as any).municipality || undefined,
        serviceType: (profile as any).service_type || undefined,
        preferredServiceDate: (profile as any).preferred_service_date || undefined,
        numberOfFloors: (profile as any).number_of_floors || undefined,
        numberOfBedrooms: (profile as any).number_of_bedrooms || undefined,
        gardenServiceType: (profile as any).garden_service_type || undefined,
        renovationBudget: (profile as any).renovation_budget || undefined,
        renovationStartDate: (profile as any).renovation_start_date || undefined,
        housingPropertyType: (profile as any).housing_property_type || undefined,
      };
    }
    return null;
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
          housing_property_type: info.propertyType || null,
          has_garden: info.hasGarden || false,
          has_parking: info.hasParking || false,
          is_vve: info.isVve || false,
          current_housing_situation: info.currentSituation || null,
          has_job: info.hasJob !== false,
          children: info.children || 0,
          pets: info.pets || 0,
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
          renovation_budget: (info as any).renovationBudget || null,
          renovation_start_date: (info as any).renovationStartDate || null,
          phone: info.phone || null,
        } as any)
        .eq('user_id', userId);

      // Clear localStorage after sync
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem("lua_email_prompted");
      localStorage.removeItem("lua_signup_prompted");
      localStorage.removeItem("lua_captured_email");
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    
    // Clear all guest data
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("lua_email_prompted");
    localStorage.removeItem("lua_signup_prompted");
    localStorage.removeItem("lua_captured_email");
    localStorage.removeItem("lua_guest_tasks");
    localStorage.removeItem("lua_milestones_celebrated");
    localStorage.removeItem("lua_account_complete");
    
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
  };

  return {
    user,
    loading,
    loadUserProfile,
    syncLocalDataToProfile,
    logout,
    isGuest: !user,
  };
};
