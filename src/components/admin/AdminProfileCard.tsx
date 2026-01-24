import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Home, 
  Zap, 
  Wifi, 
  Truck, 
  Package, 
  Shield,
  User,
  Calendar,
  MapPin
} from "lucide-react";
import { AdminProfile } from "@/hooks/useAdminProfiles";
import { AdminEditableField } from "./AdminEditableField";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";

type AdminProfileCardProps = {
  profile: AdminProfile;
  onUpdate: (profile: AdminProfile) => void;
};

type FieldConfig = {
  label: string;
  key: keyof AdminProfile;
  type?: "text" | "number" | "date";
  dbKey?: string;
};

type DataSection = {
  title: string;
  icon: React.ReactNode;
  fields: FieldConfig[];
  hasData: boolean;
};

export const AdminProfileCard = ({ profile, onUpdate }: AdminProfileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: nl });
    } catch {
      return dateStr;
    }
  };

  const handleSaveField = async (fieldKey: string, value: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldKey]: value || null })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      const updatedProfile = { 
        ...localProfile, 
        [fieldKey]: value || null,
        updated_at: new Date().toISOString()
      } as AdminProfile;
      
      setLocalProfile(updatedProfile);
      onUpdate(updatedProfile);
      toast.success("Opgeslagen");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Kon niet opslaan");
      throw error;
    }
  };

  const sections: DataSection[] = [
    {
      title: "Basis informatie",
      icon: <User className="w-4 h-4" />,
      hasData: !!(localProfile.phone || localProfile.old_address || localProfile.new_address || localProfile.moving_date),
      fields: [
        { label: "Telefoon", key: "phone", dbKey: "phone" },
        { label: "Oud adres", key: "old_address", dbKey: "old_address" },
        { label: "Nieuw adres", key: "new_address", dbKey: "new_address" },
        { label: "Verhuisdatum", key: "moving_date", type: "date", dbKey: "moving_date" },
        { label: "Sleuteloverdracht", key: "key_handover_date", type: "date", dbKey: "key_handover_date" },
        { label: "Type (buy/rent)", key: "moving_type", dbKey: "moving_type" },
      ]
    },
    {
      title: "Woning",
      icon: <Home className="w-4 h-4" />,
      hasData: !!(localProfile.housing_property_type || localProfile.home_size_m2 || localProfile.building_year),
      fields: [
        { label: "Woningtype", key: "housing_property_type", dbKey: "housing_property_type" },
        { label: "Oppervlakte (m²)", key: "home_size_m2", dbKey: "home_size_m2" },
        { label: "Bouwjaar", key: "building_year", dbKey: "building_year" },
        { label: "Aantal kamers", key: "number_of_rooms", dbKey: "number_of_rooms" },
        { label: "Verdiepingen", key: "number_of_floors", dbKey: "number_of_floors" },
        { label: "Slaapkamers", key: "number_of_bedrooms", dbKey: "number_of_bedrooms" },
        { label: "Tuingrootte", key: "garden_size", dbKey: "garden_size" },
        { label: "Lift aanwezig", key: "has_elevator", dbKey: "has_elevator" },
        { label: "Verdieping", key: "floor_level", dbKey: "floor_level" },
      ]
    },
    {
      title: "Hypotheek",
      icon: <Home className="w-4 h-4" />,
      hasData: !!(localProfile.hypotheek_koopsom || localProfile.hypotheek_doel || localProfile.hypotheek_werksituatie),
      fields: [
        { label: "Koopsom", key: "hypotheek_koopsom", type: "number", dbKey: "hypotheek_koopsom" },
        { label: "Werksituatie", key: "hypotheek_werksituatie", dbKey: "hypotheek_werksituatie" },
        { label: "Heeft partner", key: "hypotheek_heeft_partner", dbKey: "hypotheek_heeft_partner" },
        { label: "Doel hypotheek", key: "hypotheek_doel", dbKey: "hypotheek_doel" },
      ]
    },
    {
      title: "Notaris & Taxatie",
      icon: <Shield className="w-4 h-4" />,
      hasData: !!(localProfile.notaris_dienst || localProfile.taxatie_doel || localProfile.taxatie_voorkeursdatum || localProfile.bouwkundige_keuring_voorkeursdatum),
      fields: [
        { label: "Notaris dienst", key: "notaris_dienst", dbKey: "notaris_dienst" },
        { label: "Taxatie doel", key: "taxatie_doel", dbKey: "taxatie_doel" },
        { label: "Taxatie voorkeursdatum", key: "taxatie_voorkeursdatum", type: "date", dbKey: "taxatie_voorkeursdatum" },
        { label: "Bouwk. keuring datum", key: "bouwkundige_keuring_voorkeursdatum", type: "date", dbKey: "bouwkundige_keuring_voorkeursdatum" },
      ]
    },
    {
      title: "Opstalverzekering",
      icon: <Shield className="w-4 h-4" />,
      hasData: !!(localProfile.opstal_dak_type),
      fields: [
        { label: "Daktype", key: "opstal_dak_type", dbKey: "opstal_dak_type" },
      ]
    },
    {
      title: "Energie",
      icon: <Zap className="w-4 h-4" />,
      hasData: !!(localProfile.energy_current_supplier || localProfile.energy_connection_type || localProfile.has_gas || localProfile.energy_estimated_gas || localProfile.energy_estimated_electricity),
      fields: [
        { label: "Huidige leverancier", key: "energy_current_supplier", dbKey: "energy_current_supplier" },
        { label: "Aansluiting", key: "energy_connection_type", dbKey: "energy_connection_type" },
        { label: "Gas aansluiting", key: "has_gas", dbKey: "has_gas" },
        { label: "Slimme meter", key: "has_smart_meter", dbKey: "has_smart_meter" },
        { label: "Geschat gasverbruik", key: "energy_estimated_gas", type: "number", dbKey: "energy_estimated_gas" },
        { label: "Geschat stroomverbruik", key: "energy_estimated_electricity", type: "number", dbKey: "energy_estimated_electricity" },
      ]
    },
    {
      title: "Internet",
      icon: <Wifi className="w-4 h-4" />,
      hasData: !!(localProfile.has_fiber || localProfile.internet_speed_preference || localProfile.internet_bundle),
      fields: [
        { label: "Glasvezel", key: "has_fiber", dbKey: "has_fiber" },
        { label: "Snelheid voorkeur", key: "internet_speed_preference", dbKey: "internet_speed_preference" },
        { label: "Bundel", key: "internet_bundle", dbKey: "internet_bundle" },
      ]
    },
    {
      title: "Verhuizing & Lift",
      icon: <Truck className="w-4 h-4" />,
      hasData: !!(localProfile.floor_level || localProfile.has_elevator || localProfile.verhuislift_locatie || localProfile.building_access),
      fields: [
        { label: "Gemeente", key: "municipality", dbKey: "municipality" },
        { label: "Verdieping", key: "floor_level", dbKey: "floor_level" },
        { label: "Toegang gebouw", key: "building_access", dbKey: "building_access" },
        { label: "Verhuislift locatie", key: "verhuislift_locatie", dbKey: "verhuislift_locatie" },
      ]
    },
    {
      title: "Sloten",
      icon: <Shield className="w-4 h-4" />,
      hasData: !!(localProfile.slot_aantal_deuren || localProfile.slot_veiligheidsniveau || localProfile.slot_montage),
      fields: [
        { label: "Aantal deuren", key: "slot_aantal_deuren", dbKey: "slot_aantal_deuren" },
        { label: "Veiligheidsniveau", key: "slot_veiligheidsniveau", dbKey: "slot_veiligheidsniveau" },
        { label: "Montage", key: "slot_montage", dbKey: "slot_montage" },
      ]
    },
    {
      title: "Verhuisdozen",
      icon: <Package className="w-4 h-4" />,
      hasData: !!(localProfile.number_of_rooms || localProfile.has_fragile_items),
      fields: [
        { label: "Aantal kamers", key: "number_of_rooms", dbKey: "number_of_rooms" },
        { label: "Breekbare spullen", key: "has_fragile_items", dbKey: "has_fragile_items" },
      ]
    },
    {
      title: "Verzekeringen & Renovatie",
      icon: <Shield className="w-4 h-4" />,
      hasData: !!(localProfile.insurance_value || localProfile.renovation_budget),
      fields: [
        { label: "Verzekerde waarde", key: "insurance_value", dbKey: "insurance_value" },
        { label: "Renovatie budget", key: "renovation_budget", dbKey: "renovation_budget" },
        { label: "Renovatie startdatum", key: "renovation_start_date", type: "date", dbKey: "renovation_start_date" },
      ]
    },
  ];

  const filledSections = sections.filter(s => s.hasData);
  const filledFieldsCount = sections.reduce((count, section) => {
    return count + section.fields.filter(f => localProfile[f.key]).length;
  }, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {localProfile.phone || 'Geen telefoon'}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5 text-sm text-muted-foreground">
              {localProfile.new_address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {localProfile.new_address.substring(0, 30)}{localProfile.new_address.length > 30 ? '...' : ''}
                </span>
              )}
              {localProfile.moving_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(localProfile.moving_date)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filledFieldsCount} velden
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Quick badges for filled sections */}
        <div className="flex flex-wrap gap-1 mt-2">
          {filledSections.map((section) => (
            <Badge key={section.title} variant="outline" className="text-xs gap-1">
              {section.icon}
              {section.title}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-4 space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground mb-2">
                {section.icon}
                {section.title}
              </h4>
              <div className="pl-6 space-y-0.5">
                {section.fields.map((field) => (
                  <AdminEditableField
                    key={field.key}
                    label={field.label}
                    value={localProfile[field.key] as string | null}
                    fieldKey={field.dbKey || field.key}
                    type={field.type}
                    onSave={handleSaveField}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Laatst bijgewerkt: {formatDate(localProfile.updated_at)}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
