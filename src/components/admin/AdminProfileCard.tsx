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
  Phone,
  Calendar,
  MapPin
} from "lucide-react";
import { AdminProfile } from "@/hooks/useAdminProfiles";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

type AdminProfileCardProps = {
  profile: AdminProfile;
};

type DataSection = {
  title: string;
  icon: React.ReactNode;
  fields: { label: string; value: string | null | undefined }[];
  hasData: boolean;
};

export const AdminProfileCard = ({ profile }: AdminProfileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: nl });
    } catch {
      return dateStr;
    }
  };

  const formatBoolean = (val: boolean | null | undefined) => {
    if (val === null || val === undefined) return null;
    return val ? 'Ja' : 'Nee';
  };

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return null;
    return arr.join(', ');
  };

  const sections: DataSection[] = [
    {
      title: "Basis informatie",
      icon: <User className="w-4 h-4" />,
      hasData: !!(profile.phone || profile.old_address || profile.new_address || profile.moving_date),
      fields: [
        { label: "Telefoon", value: profile.phone },
        { label: "Oud adres", value: profile.old_address },
        { label: "Nieuw adres", value: profile.new_address },
        { label: "Verhuisdatum", value: formatDate(profile.moving_date) },
        { label: "Sleuteloverdracht", value: formatDate(profile.key_handover_date) },
        { label: "Type", value: profile.moving_type === 'buy' ? 'Koop' : profile.moving_type === 'rent' ? 'Huur' : null },
      ]
    },
    {
      title: "Woning",
      icon: <Home className="w-4 h-4" />,
      hasData: !!(profile.housing_property_type || profile.home_size_m2 || profile.building_year),
      fields: [
        { label: "Woningtype", value: profile.housing_property_type },
        { label: "Oppervlakte", value: profile.home_size_m2 ? `${profile.home_size_m2} m²` : null },
        { label: "Bouwjaar", value: profile.building_year },
        { label: "Aantal kamers", value: profile.number_of_rooms },
        { label: "Verdiepingen", value: profile.number_of_floors },
        { label: "Slaapkamers", value: profile.number_of_bedrooms },
        { label: "Heeft tuin", value: formatBoolean(profile.has_garden) },
        { label: "Tuingrootte", value: profile.garden_size },
        { label: "Heeft parkeren", value: formatBoolean(profile.has_parking) },
        { label: "VvE", value: formatBoolean(profile.is_vve) },
        { label: "Lift aanwezig", value: profile.has_elevator },
        { label: "Verdieping", value: profile.floor_level },
      ]
    },
    {
      title: "Energie",
      icon: <Zap className="w-4 h-4" />,
      hasData: !!(profile.energy_current_supplier || profile.energy_connection_type || profile.has_gas),
      fields: [
        { label: "Huidige leverancier", value: profile.energy_current_supplier },
        { label: "Aansluiting", value: profile.energy_connection_type },
        { label: "Gas aansluiting", value: profile.has_gas },
        { label: "Slimme meter", value: profile.has_smart_meter },
      ]
    },
    {
      title: "Internet",
      icon: <Wifi className="w-4 h-4" />,
      hasData: !!(profile.has_fiber || profile.internet_speed_preference || profile.internet_bundle),
      fields: [
        { label: "Glasvezel", value: profile.has_fiber || profile.glasvezel },
        { label: "Snelheid voorkeur", value: profile.internet_speed_preference },
        { label: "Bundel", value: profile.internet_bundle },
      ]
    },
    {
      title: "Verhuizing",
      icon: <Truck className="w-4 h-4" />,
      hasData: !!(profile.floor_level || profile.has_elevator || profile.special_items?.length),
      fields: [
        { label: "Verdieping", value: profile.floor_level },
        { label: "Lift", value: profile.has_elevator },
        { label: "Speciale items", value: formatArray(profile.special_items) },
        { label: "Gemeente", value: profile.municipality },
      ]
    },
    {
      title: "Verhuisdozen",
      icon: <Package className="w-4 h-4" />,
      hasData: !!(profile.number_of_rooms || profile.has_fragile_items),
      fields: [
        { label: "Aantal kamers", value: profile.number_of_rooms },
        { label: "Breekbare spullen", value: profile.has_fragile_items },
      ]
    },
    {
      title: "Verzekeringen & Overig",
      icon: <Shield className="w-4 h-4" />,
      hasData: !!(profile.insurance_value || profile.renovation_budget),
      fields: [
        { label: "Verzekerde waarde", value: profile.insurance_value },
        { label: "Renovatie budget", value: profile.renovation_budget },
        { label: "Renovatie startdatum", value: formatDate(profile.renovation_start_date) },
        { label: "Verhuisbudget", value: profile.moving_budget ? `€${profile.moving_budget}` : null },
      ]
    },
  ];

  const filledSections = sections.filter(s => s.hasData);
  const filledFieldsCount = sections.reduce((count, section) => {
    return count + section.fields.filter(f => f.value).length;
  }, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {profile.phone || 'Geen telefoon'}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5 text-sm text-muted-foreground">
              {profile.new_address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.new_address.substring(0, 30)}{profile.new_address.length > 30 ? '...' : ''}
                </span>
              )}
              {profile.moving_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(profile.moving_date)}
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
          {sections.map((section) => {
            const filledFields = section.fields.filter(f => f.value);
            if (filledFields.length === 0) return null;

            return (
              <div key={section.title} className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  {section.icon}
                  {section.title}
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6">
                  {filledFields.map((field) => (
                    <div key={field.label} className="text-sm">
                      <span className="text-muted-foreground">{field.label}:</span>{' '}
                      <span className="font-medium">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Laatst bijgewerkt: {formatDate(profile.updated_at)}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
