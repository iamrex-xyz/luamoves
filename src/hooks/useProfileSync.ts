import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MovingInfo } from "@/types/moving";

/**
 * Hook for syncing profile data to Supabase
 * This ensures all user-provided data is persisted immediately
 */
export const useProfileSync = () => {
  /**
   * Save partial moving info to the user's profile in Supabase
   * Silently succeeds if user is not logged in (data will be synced on signup)
   */
  const saveToProfile = useCallback(async (data: Partial<MovingInfo>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // User not logged in - data will be synced when they create account
        return { success: true, synced: false };
      }

      // Map MovingInfo fields to database columns
      const profileUpdate: Record<string, any> = {};

      // Core moving info
      if (data.oldAddress !== undefined) profileUpdate.old_address = data.oldAddress || null;
      if (data.newAddress !== undefined) profileUpdate.new_address = data.newAddress || null;
      if (data.movingDate !== undefined) profileUpdate.moving_date = data.movingDate || null;
      if (data.keyHandoverDate !== undefined) profileUpdate.key_handover_date = data.keyHandoverDate || null;
      if (data.type !== undefined) profileUpdate.moving_type = data.type || null;

      // Property info
      if (data.propertyType !== undefined) profileUpdate.housing_property_type = data.propertyType || null;
      if (data.housingPropertyType !== undefined) profileUpdate.housing_property_type = data.housingPropertyType || null;
      if (data.hasGarden !== undefined) profileUpdate.has_garden = data.hasGarden || false;
      if (data.hasParking !== undefined) profileUpdate.has_parking = data.hasParking || false;
      if (data.isVve !== undefined) profileUpdate.is_vve = data.isVve || false;
      if (data.currentSituation !== undefined) profileUpdate.current_housing_situation = data.currentSituation || null;

      // Renovation info
      if (data.renovationType !== undefined) profileUpdate.renovation_type = data.renovationType || "none";
      if (data.needsContractorHelp !== undefined) profileUpdate.needs_contractor_help = data.needsContractorHelp || false;
      if (data.renovationBudget !== undefined) profileUpdate.renovation_budget = data.renovationBudget || null;
      if (data.renovationStartDate !== undefined) profileUpdate.renovation_start_date = data.renovationStartDate || null;

      // Household info
      if (data.hasJob !== undefined) profileUpdate.has_job = data.hasJob !== false;
      if (data.children !== undefined) profileUpdate.children = data.children || 0;
      if (data.pets !== undefined) profileUpdate.pets = data.pets || 0;
      if (data.childrenAges !== undefined) profileUpdate.children_ages = data.childrenAges || null;
      if (data.householdNames !== undefined) profileUpdate.household_names = data.householdNames || [];

      // Smart questions
      if (data.hasGas !== undefined) profileUpdate.has_gas = data.hasGas || null;
      if (data.hasSmartMeter !== undefined) profileUpdate.has_smart_meter = data.hasSmartMeter || null;
      if (data.glasvezel !== undefined) profileUpdate.glasvezel = data.glasvezel || null;
      if (data.worksFromHome !== undefined) profileUpdate.works_from_home = data.worksFromHome || null;
      if (data.buildingAccess !== undefined) profileUpdate.building_access = data.buildingAccess || null;
      if (data.insuranceValue !== undefined) profileUpdate.insurance_value = data.insuranceValue || null;
      if (data.buildingYear !== undefined) profileUpdate.building_year = data.buildingYear || null;
      if (data.gardenSize !== undefined) profileUpdate.garden_size = data.gardenSize || null;

      // Energy questions
      if (data.energyCurrentSupplier !== undefined) profileUpdate.energy_current_supplier = data.energyCurrentSupplier || null;
      if (data.energyConnectionType !== undefined) profileUpdate.energy_connection_type = data.energyConnectionType || null;

      // Internet questions
      if (data.hasFiber !== undefined) profileUpdate.has_fiber = data.hasFiber || null;
      if (data.internetSpeedPreference !== undefined) profileUpdate.internet_speed_preference = data.internetSpeedPreference || null;
      if (data.internetBundle !== undefined) profileUpdate.internet_bundle = data.internetBundle || null;

      // Moving helper questions
      if (data.floorLevel !== undefined) profileUpdate.floor_level = data.floorLevel || null;
      if (data.hasElevator !== undefined) profileUpdate.has_elevator = data.hasElevator || null;
      if (data.numberOfRooms !== undefined) profileUpdate.number_of_rooms = data.numberOfRooms || null;
      if (data.specialItems !== undefined) profileUpdate.special_items = data.specialItems || [];
      if (data.hasFragileItems !== undefined) profileUpdate.has_fragile_items = data.hasFragileItems || null;
      if (data.homeSizeM2 !== undefined) profileUpdate.home_size_m2 = data.homeSizeM2 || null;

      // Forwarding service
      if (data.forwardingStartDate !== undefined) profileUpdate.forwarding_start_date = data.forwardingStartDate || null;
      if (data.forwardingDuration !== undefined) profileUpdate.forwarding_duration = data.forwardingDuration || null;

      // Location/services
      if (data.municipality !== undefined) profileUpdate.municipality = data.municipality || null;
      if (data.serviceType !== undefined) profileUpdate.service_type = data.serviceType || null;
      if (data.preferredServiceDate !== undefined) profileUpdate.preferred_service_date = data.preferredServiceDate || null;

      // Property details
      if (data.numberOfFloors !== undefined) profileUpdate.number_of_floors = data.numberOfFloors || null;
      if (data.numberOfBedrooms !== undefined) profileUpdate.number_of_bedrooms = data.numberOfBedrooms || null;
      if (data.gardenServiceType !== undefined) profileUpdate.garden_service_type = data.gardenServiceType || null;

      // Contact & budget
      if (data.phone !== undefined) profileUpdate.phone = data.phone || null;
      if (data.movingBudget !== undefined) profileUpdate.moving_budget = data.movingBudget || null;

      // Only update if there's something to update
      if (Object.keys(profileUpdate).length === 0) {
        return { success: true, synced: false };
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving to profile:', error);
        return { success: false, synced: false, error };
      }

      return { success: true, synced: true };
    } catch (error) {
      console.error('Error in saveToProfile:', error);
      return { success: false, synced: false, error };
    }
  }, []);

  return { saveToProfile };
};
