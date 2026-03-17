import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { supabase } from "@/integrations/supabase/client";
import { MovingInfo } from "@/types/moving";
import { LuaLogo } from "@/components/LuaLogo";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

type AppView = "dashboard" | "tasks" | "extras" | "settings";

export const UserDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("dashboard");

  useEffect(() => {
    const loadUserByToken = async () => {
      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch profile by dashboard_token
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('dashboard_token', token)
          .single();

        if (profileError || !profile) {
          console.error('Profile not found:', profileError);
          setError(true);
          setLoading(false);
          return;
        }

        // Build MovingInfo from profile
        const info: MovingInfo = {
          oldAddress: profile.old_address || '',
          newAddress: profile.new_address || '',
          movingDate: profile.moving_date || '',
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
          adults: profile.adults || 1,
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
        setUserId(profile.user_id);
        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadUserByToken();
  }, [token]);

  const handleUpdateMovingInfo = async (data: Partial<MovingInfo>) => {
    if (!movingInfo || !userId) return;
    
    const updatedInfo = { ...movingInfo, ...data };
    setMovingInfo(updatedInfo);
    
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
          adults: updatedInfo.adults || 1,
          children: updatedInfo.children || 0,
          pets: updatedInfo.pets || 0,
          moving_budget: updatedInfo.movingBudget || null,
        } as any)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-8">
            <LuaLogo size="lg" className="mb-6 justify-center" />
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Oeps, deze link is ongeldig
            </h1>
            <p className="text-muted-foreground mb-6">
              We kunnen je dashboard niet vinden. Controleer je link of start opnieuw met Lua.
            </p>
            <Link to="/">
              <Button size="lg" className="w-full h-12 rounded-full">
                <Home className="w-5 h-5 mr-2" />
                Terug naar home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!movingInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {currentView === "dashboard" && (
        <Dashboard 
          movingInfo={movingInfo} 
          onNavigate={setCurrentView}
          onUpdateMovingInfo={handleUpdateMovingInfo}
        />
      )}
      {currentView === "tasks" && (
        <TaskList 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
          onUpdateMovingInfo={handleUpdateMovingInfo}
          isGuest={false}
        />
      )}
      {currentView === "extras" && (
        <Extras 
          onNavigate={setCurrentView}
          isGuest={false}
        />
      )}
      {currentView === "settings" && (
        <Settings 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
          onUpdate={setMovingInfo}
          isGuest={false}
        />
      )}
    </div>
  );
};

export default UserDashboard;
