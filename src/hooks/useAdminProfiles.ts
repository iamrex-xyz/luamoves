import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminProfile = {
  id: string;
  user_id: string;
  phone: string | null;
  old_address: string | null;
  new_address: string | null;
  moving_date: string | null;
  key_handover_date: string | null;
  moving_type: string | null;
  renovation_type: string | null;
  needs_contractor_help: boolean | null;
  housing_property_type: string | null;
  has_garden: boolean | null;
  has_parking: boolean | null;
  is_vve: boolean | null;
  current_housing_situation: string | null;
  has_job: boolean | null;
  adults: number | null;
  children: number | null;
  pets: number | null;
  has_gas: string | null;
  has_smart_meter: string | null;
  glasvezel: string | null;
  works_from_home: string | null;
  building_access: string | null;
  insurance_value: string | null;
  building_year: string | null;
  garden_size: string | null;
  children_ages: string | null;
  energy_current_supplier: string | null;
  energy_connection_type: string | null;
  has_fiber: string | null;
  internet_speed_preference: string | null;
  internet_bundle: string | null;
  floor_level: string | null;
  has_elevator: string | null;
  number_of_rooms: string | null;
  special_items: string[] | null;
  has_fragile_items: string | null;
  home_size_m2: string | null;
  forwarding_start_date: string | null;
  forwarding_duration: string | null;
  household_names: string[] | null;
  municipality: string | null;
  service_type: string | null;
  preferred_service_date: string | null;
  number_of_floors: string | null;
  number_of_bedrooms: string | null;
  garden_service_type: string | null;
  renovation_budget: string | null;
  moving_budget: number | null;
  renovation_start_date: string | null;
  // New intake fields
  hypotheek_koopsom: number | null;
  hypotheek_werksituatie: string | null;
  hypotheek_heeft_partner: string | null;
  hypotheek_doel: string | null;
  notaris_dienst: string | null;
  taxatie_doel: string | null;
  taxatie_voorkeursdatum: string | null;
  slot_aantal_deuren: string | null;
  slot_veiligheidsniveau: string | null;
  slot_montage: string | null;
  verhuislift_locatie: string | null;
  bouwkundige_keuring_voorkeursdatum: string | null;
  created_at: string;
  updated_at: string;
};

export const useAdminProfiles = (isAdmin: boolean) => {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    if (!isAdmin) {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch from the admin view - this only returns data if user is admin
      const { data, error: fetchError } = await supabase
        .from('admin_profiles_view')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching admin profiles:', fetchError);
        setError('Kon profielen niet laden');
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
    } catch (err) {
      console.error('Error in useAdminProfiles:', err);
      setError('Er ging iets mis');
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [isAdmin]);

  const updateProfile = (updatedProfile: AdminProfile) => {
    setProfiles(prev => 
      prev.map(p => p.id === updatedProfile.id ? updatedProfile : p)
    );
  };

  return { profiles, isLoading, error, refetch: fetchProfiles, updateProfile };
};
