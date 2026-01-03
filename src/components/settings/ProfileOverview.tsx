import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { ProfileSectionCard } from "./ProfileSectionCard";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { validatePhone as validatePhoneUtil, cleanPhone, validateAddressPostcode } from "@/lib/validation";
import {
  Home,
  Calendar,
  Phone,
  Cake,
  Users,
  Zap,
  Wifi,
  Shield,
  Truck,
  Mail,
  Sparkle,
  Wrench,
  X,
  Plus,
  Save,
} from "lucide-react";

type ProfileOverviewProps = {
  movingInfo: MovingInfo;
  onUpdate: (info: MovingInfo) => void;
};

type ProfileData = {
  // Personal
  phone: string;
  birthDate: string;
  // Household
  adults: number;
  children: number;
  pets: number;
  // Moving
  oldAddress: string;
  newAddress: string;
  movingDate: string;
  keyHandoverDate: string;
  renovationType: string;
  // Energy
  energyCurrentSupplier: string;
  hasSmartMeter: string;
  energyConnectionType: string;
  hasGas: string;
  // Property
  propertyType: string;
  buildingYear: string;
  hasGarden: string;
  gardenSize: string;
  buildingAccess: string;
  municipality: string;
  numberOfFloors: string;
  numberOfBedrooms: string;
  homeSizeM2: string;
  // Internet
  hasFiber: string;
  internetSpeedPreference: string;
  internetBundle: string;
  glasvezel: string;
  worksFromHome: string;
  // Insurance
  insuranceValue: string;
  // Moving details
  floorLevel: string;
  hasElevator: string;
  numberOfRooms: string;
  specialItems: string[];
  // Post
  forwardingStartDate: string;
  forwardingDuration: string;
  householdNames: string[];
  // Cleaning
  serviceType: string;
  preferredServiceDate: string;
  // Renovation
  renovationBudget: string;
  renovationStartDate: string;
};

const energySuppliers = [
  "Vattenfall", "Eneco", "Essent", "Budget Energie", "Greenchoice",
  "Vandebron", "Oxxio", "Engie", "Innova Energie", "Pure Energie",
  "NLE", "Mega", "ANWB Energie", "United Consumers", "Coolblue Energie",
  "Tibber", "Frank Energie",
];

export const ProfileOverview = ({ movingInfo, onUpdate }: ProfileOverviewProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [newSpecialItem, setNewSpecialItem] = useState("");

  const [data, setData] = useState<ProfileData>({
    phone: "",
    birthDate: "",
    adults: 1,
    children: 0,
    pets: 0,
    oldAddress: movingInfo.oldAddress || "",
    newAddress: movingInfo.newAddress || "",
    movingDate: movingInfo.movingDate || "",
    keyHandoverDate: movingInfo.keyHandoverDate || "",
    renovationType: movingInfo.renovationType || "none",
    energyCurrentSupplier: "",
    hasSmartMeter: "",
    energyConnectionType: "",
    hasGas: "",
    propertyType: "",
    buildingYear: "",
    hasGarden: "",
    gardenSize: "",
    buildingAccess: "",
    municipality: "",
    numberOfFloors: "",
    numberOfBedrooms: "",
    homeSizeM2: "",
    hasFiber: "",
    internetSpeedPreference: "",
    internetBundle: "",
    glasvezel: "",
    worksFromHome: "",
    insuranceValue: "",
    floorLevel: "",
    hasElevator: "",
    numberOfRooms: "",
    specialItems: [],
    forwardingStartDate: "",
    forwardingDuration: "",
    householdNames: [],
    serviceType: "",
    preferredServiceDate: "",
    renovationBudget: "",
    renovationStartDate: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsInitialLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setData({
          phone: profile.phone || "",
          birthDate: profile.birth_date || "",
          adults: profile.adults || 1,
          children: profile.children || 0,
          pets: profile.pets || 0,
          oldAddress: profile.old_address || movingInfo.oldAddress || "",
          newAddress: profile.new_address || movingInfo.newAddress || "",
          movingDate: profile.moving_date || movingInfo.movingDate || "",
          keyHandoverDate: profile.key_handover_date || movingInfo.keyHandoverDate || "",
          renovationType: profile.renovation_type || movingInfo.renovationType || "none",
          energyCurrentSupplier: profile.energy_current_supplier || "",
          hasSmartMeter: profile.has_smart_meter || "",
          energyConnectionType: profile.energy_connection_type || "",
          hasGas: profile.has_gas || "",
          propertyType: profile.housing_property_type || "",
          buildingYear: profile.building_year || "",
          hasGarden: profile.has_garden === true ? "yes" : profile.has_garden === false ? "no" : "",
          gardenSize: profile.garden_size || "",
          buildingAccess: profile.building_access || "",
          municipality: profile.municipality || "",
          numberOfFloors: profile.number_of_floors || "",
          numberOfBedrooms: profile.number_of_bedrooms || "",
          homeSizeM2: profile.home_size_m2 || "",
          hasFiber: profile.has_fiber || "",
          internetSpeedPreference: profile.internet_speed_preference || "",
          internetBundle: profile.internet_bundle || "",
          glasvezel: profile.glasvezel || "",
          worksFromHome: profile.works_from_home || "",
          insuranceValue: profile.insurance_value || "",
          floorLevel: profile.floor_level || "",
          hasElevator: profile.has_elevator || "",
          numberOfRooms: profile.number_of_rooms || "",
          specialItems: profile.special_items || [],
          forwardingStartDate: profile.forwarding_start_date || "",
          forwardingDuration: profile.forwarding_duration || "",
          householdNames: profile.household_names || [],
          serviceType: profile.service_type || "",
          preferredServiceDate: profile.preferred_service_date || "",
          renovationBudget: profile.renovation_budget || "",
          renovationStartDate: profile.renovation_start_date || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const validatePhone = (value: string) => {
    const result = validatePhoneUtil(value);
    setPhoneError(result.error);
    return result.isValid;
  };

  const handleSave = async () => {
    if (data.phone && !validatePhone(data.phone)) {
      toast({ title: "Fout", description: "Corrigeer het telefoonnummer.", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cleanedPhone = cleanPhone(data.phone);

      const { error } = await supabase
        .from("profiles")
        .update({
          phone: cleanedPhone || null,
          birth_date: data.birthDate || null,
          adults: data.adults,
          children: data.children,
          pets: data.pets,
          old_address: data.oldAddress || null,
          new_address: data.newAddress || null,
          moving_date: data.movingDate || null,
          key_handover_date: data.keyHandoverDate || null,
          renovation_type: data.renovationType || null,
          energy_current_supplier: data.energyCurrentSupplier || null,
          has_smart_meter: data.hasSmartMeter || null,
          energy_connection_type: data.energyConnectionType || null,
          has_gas: data.hasGas || null,
          housing_property_type: data.propertyType || null,
          building_year: data.buildingYear || null,
          has_garden: data.hasGarden === "yes" ? true : data.hasGarden === "no" ? false : null,
          garden_size: data.gardenSize || null,
          building_access: data.buildingAccess || null,
          municipality: data.municipality || null,
          number_of_floors: data.numberOfFloors || null,
          number_of_bedrooms: data.numberOfBedrooms || null,
          home_size_m2: data.homeSizeM2 || null,
          has_fiber: data.hasFiber || null,
          internet_speed_preference: data.internetSpeedPreference || null,
          internet_bundle: data.internetBundle || null,
          glasvezel: data.glasvezel || null,
          works_from_home: data.worksFromHome || null,
          insurance_value: data.insuranceValue || null,
          floor_level: data.floorLevel || null,
          has_elevator: data.hasElevator || null,
          number_of_rooms: data.numberOfRooms || null,
          special_items: data.specialItems.length > 0 ? data.specialItems : [],
          forwarding_start_date: data.forwardingStartDate || null,
          forwarding_duration: data.forwardingDuration || null,
          household_names: data.householdNames.length > 0 ? data.householdNames : null,
          service_type: data.serviceType || null,
          preferred_service_date: data.preferredServiceDate || null,
          renovation_budget: data.renovationBudget || null,
          renovation_start_date: data.renovationStartDate || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Update movingInfo (only fields that exist in MovingInfo type)
      onUpdate({
        ...movingInfo,
        oldAddress: data.oldAddress,
        newAddress: data.newAddress,
        movingDate: data.movingDate,
        keyHandoverDate: data.keyHandoverDate || undefined,
        renovationType: data.renovationType as "none" | "small" | "large",
        children: data.children,
        pets: data.pets,
      });

      toast({ title: "Opgeslagen", description: "Je profiel is bijgewerkt." });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Fout", description: "Kon profiel niet opslaan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const addHouseholdName = () => {
    if (newHouseholdName.trim() && !data.householdNames.includes(newHouseholdName.trim())) {
      updateField("householdNames", [...data.householdNames, newHouseholdName.trim()]);
      setNewHouseholdName("");
    }
  };

  const removeHouseholdName = (name: string) => {
    updateField("householdNames", data.householdNames.filter(n => n !== name));
  };

  const addSpecialItem = () => {
    if (newSpecialItem.trim() && !data.specialItems.includes(newSpecialItem.trim())) {
      updateField("specialItems", [...data.specialItems, newSpecialItem.trim()]);
      setNewSpecialItem("");
    }
  };

  const removeSpecialItem = (item: string) => {
    updateField("specialItems", data.specialItems.filter(i => i !== item));
  };

  const getPersonalCompletion = () => [data.phone, data.birthDate].filter(Boolean).length;
  const getHouseholdCompletion = () => [data.adults > 0, data.children >= 0, data.pets >= 0].filter(Boolean).length;
  const getMovingCompletion = () => [data.oldAddress, data.newAddress, data.movingDate, data.keyHandoverDate].filter(Boolean).length;
  const getEnergyCompletion = () => [data.energyCurrentSupplier, data.hasSmartMeter, data.energyConnectionType].filter(Boolean).length;
  const getPropertyCompletion = () => [data.propertyType, data.buildingYear, data.hasGarden, data.numberOfFloors, data.numberOfBedrooms, data.homeSizeM2, data.municipality].filter(Boolean).length;
  const getInternetCompletion = () => [data.hasFiber, data.internetSpeedPreference, data.internetBundle, data.worksFromHome].filter(Boolean).length;
  const getInsuranceCompletion = () => [data.insuranceValue, data.children >= 0, data.pets >= 0].filter(v => v !== false && v !== "").length;
  const getMovingDetailsCompletion = () => [data.floorLevel, data.hasElevator, data.numberOfRooms, data.specialItems.length > 0].filter(Boolean).length;
  const getPostCompletion = () => [data.forwardingStartDate, data.forwardingDuration, data.householdNames.length > 0].filter(Boolean).length;
  const getCleaningCompletion = () => [data.serviceType, data.preferredServiceDate].filter(Boolean).length;
  const getRenovationCompletion = () => [data.renovationBudget, data.renovationStartDate].filter(Boolean).length;

  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-card border-0 shadow-soft p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <ProfileSectionCard
        title="Persoonlijke gegevens"
        subtitle="Contact en geboortedatum"
        icon={<Phone className="w-5 h-5 text-primary" />}
        iconBgColor="bg-primary/10"
        isOpen={openSection === "personal"}
        onToggle={() => setOpenSection(openSection === "personal" ? null : "personal")}
        completedFields={getPersonalCompletion()}
        totalFields={2}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Telefoonnummer</Label>
            <Input
              type="tel"
              placeholder="06 12345678"
              value={data.phone}
              onChange={(e) => {
                updateField("phone", e.target.value);
                if (phoneError) validatePhone(e.target.value);
              }}
              className={cn("rounded-xl h-11", phoneError && "border-destructive")}
            />
            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Geboortedatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal rounded-xl h-11", !data.birthDate && "text-muted-foreground")}
                >
                  <Cake className="mr-2 h-4 w-4" />
                  {data.birthDate ? format(new Date(data.birthDate), "dd-MM-yyyy") : "Selecteer"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={data.birthDate ? new Date(data.birthDate) : undefined}
                  onSelect={(date) => updateField("birthDate", date ? format(date, "yyyy-MM-dd") : "")}
                  disabled={(date) => date > new Date()}
                  defaultMonth={data.birthDate ? new Date(data.birthDate) : new Date(1990, 0, 1)}
                  captionLayout="dropdown-buttons"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Household */}
      <ProfileSectionCard
        title="Huishouden"
        subtitle="Bewoners en huisdieren"
        icon={<Users className="w-5 h-5 text-info" />}
        iconBgColor="bg-info/10"
        isOpen={openSection === "household"}
        onToggle={() => setOpenSection(openSection === "household" ? null : "household")}
        completedFields={getHouseholdCompletion()}
        totalFields={3}
      >
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Volwassenen</Label>
            <Input
              type="number"
              min="1"
              value={data.adults}
              onChange={(e) => updateField("adults", parseInt(e.target.value) || 1)}
              className="rounded-xl h-11"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Kinderen</Label>
            <Input
              type="number"
              min="0"
              value={data.children}
              onChange={(e) => updateField("children", parseInt(e.target.value) || 0)}
              className="rounded-xl h-11"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Huisdieren</Label>
            <Input
              type="number"
              min="0"
              value={data.pets}
              onChange={(e) => updateField("pets", parseInt(e.target.value) || 0)}
              className="rounded-xl h-11"
            />
          </div>
        </div>
      </ProfileSectionCard>

      {/* Moving Details */}
      <ProfileSectionCard
        title="Verhuizing"
        subtitle="Adressen en datums"
        icon={<Home className="w-5 h-5 text-primary" />}
        iconBgColor="bg-primary/10"
        isOpen={openSection === "moving"}
        onToggle={() => setOpenSection(openSection === "moving" ? null : "moving")}
        completedFields={getMovingCompletion()}
        totalFields={4}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Oud adres</Label>
            <AddressAutocomplete
              label=""
              placeholder="Begin met typen..."
              value={data.oldAddress}
              onChange={(v) => updateField("oldAddress", v)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nieuw adres</Label>
            <AddressAutocomplete
              label=""
              placeholder="Begin met typen..."
              value={data.newAddress}
              onChange={(v) => updateField("newAddress", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verhuisdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-11 text-xs", !data.movingDate && "text-muted-foreground")}>
                    <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{data.movingDate ? format(new Date(data.movingDate), "dd-MM-yyyy") : "Selecteer"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={data.movingDate ? new Date(data.movingDate) : undefined}
                    onSelect={(date) => updateField("movingDate", date ? format(date, "yyyy-MM-dd") : "")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Sleuteloverdracht</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-11 text-xs", !data.keyHandoverDate && "text-muted-foreground")}>
                    <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{data.keyHandoverDate ? format(new Date(data.keyHandoverDate), "dd-MM-yyyy") : "Selecteer"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={data.keyHandoverDate ? new Date(data.keyHandoverDate) : undefined}
                    onSelect={(date) => updateField("keyHandoverDate", date ? format(date, "yyyy-MM-dd") : "")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verbouwing</Label>
            <Select value={data.renovationType} onValueChange={(v) => updateField("renovationType", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Geen verbouwing</SelectItem>
                <SelectItem value="small">Kleine verbouwing</SelectItem>
                <SelectItem value="large">Grote verbouwing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Energy */}
      <ProfileSectionCard
        title="Energie"
        subtitle="Leverancier & aansluiting"
        icon={<Zap className="w-5 h-5 text-amber-500" />}
        iconBgColor="bg-amber-500/10"
        isOpen={openSection === "energy"}
        onToggle={() => setOpenSection(openSection === "energy" ? null : "energy")}
        completedFields={getEnergyCompletion()}
        totalFields={3}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Huidige leverancier</Label>
            <Select value={data.energyCurrentSupplier} onValueChange={(v) => updateField("energyCurrentSupplier", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                {energySuppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Slimme meter</Label>
            <Select value={data.hasSmartMeter} onValueChange={(v) => updateField("hasSmartMeter", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Ja</SelectItem>
                <SelectItem value="no">Nee</SelectItem>
                <SelectItem value="unknown">Weet ik niet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Type aansluiting</Label>
            <Select value={data.energyConnectionType} onValueChange={(v) => updateField("energyConnectionType", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elektra_gas">Elektra + Gas</SelectItem>
                <SelectItem value="elektra_only">Alleen elektra</SelectItem>
                <SelectItem value="unknown">Weet ik niet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Property */}
      <ProfileSectionCard
        title="Woning"
        subtitle="Type, grootte & kenmerken"
        icon={<Home className="w-5 h-5 text-blue-500" />}
        iconBgColor="bg-blue-500/10"
        isOpen={openSection === "property"}
        onToggle={() => setOpenSection(openSection === "property" ? null : "property")}
        completedFields={getPropertyCompletion()}
        totalFields={7}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Type woning</Label>
              <Select value={data.propertyType} onValueChange={(v) => updateField("propertyType", v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Appartement</SelectItem>
                  <SelectItem value="house">Eengezinswoning</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="room">Kamer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bouwjaar</Label>
              <Select value={data.buildingYear} onValueChange={(v) => updateField("buildingYear", v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_1930">Voor 1930</SelectItem>
                  <SelectItem value="1930_1970">1930-1970</SelectItem>
                  <SelectItem value="1970_1990">1970-1990</SelectItem>
                  <SelectItem value="1990_2010">1990-2010</SelectItem>
                  <SelectItem value="after_2010">Na 2010</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Oppervlakte (m²)</Label>
              <Input
                type="text"
                placeholder="bijv. 80"
                value={data.homeSizeM2}
                onChange={(e) => updateField("homeSizeM2", e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Gemeente</Label>
              <Input
                type="text"
                placeholder="bijv. Amsterdam"
                value={data.municipality}
                onChange={(e) => updateField("municipality", e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Aantal verdiepingen</Label>
              <Select value={data.numberOfFloors} onValueChange={(v) => updateField("numberOfFloors", v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 verdieping</SelectItem>
                  <SelectItem value="2">2 verdiepingen</SelectItem>
                  <SelectItem value="3">3 verdiepingen</SelectItem>
                  <SelectItem value="4+">4 of meer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Aantal slaapkamers</Label>
              <Select value={data.numberOfBedrooms} onValueChange={(v) => updateField("numberOfBedrooms", v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5+">5 of meer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tuin</Label>
            <Select value={data.hasGarden} onValueChange={(v) => updateField("hasGarden", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Ja</SelectItem>
                <SelectItem value="no">Nee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Internet */}
      <ProfileSectionCard
        title="Internet"
        subtitle="Snelheid & bundel"
        icon={<Wifi className="w-5 h-5 text-purple-500" />}
        iconBgColor="bg-purple-500/10"
        isOpen={openSection === "internet"}
        onToggle={() => setOpenSection(openSection === "internet" ? null : "internet")}
        completedFields={getInternetCompletion()}
        totalFields={4}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Glasvezel beschikbaar?</Label>
            <Select value={data.hasFiber} onValueChange={(v) => updateField("hasFiber", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Ja</SelectItem>
                <SelectItem value="no">Nee</SelectItem>
                <SelectItem value="unknown">Weet ik niet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Snelheidsvoorkeur</Label>
            <Select value={data.internetSpeedPreference} onValueChange={(v) => updateField("internetSpeedPreference", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basis (tot 100 Mbps)</SelectItem>
                <SelectItem value="fast">Snel (100-500 Mbps)</SelectItem>
                <SelectItem value="ultra">Ultra (500+ Mbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bundel</Label>
            <Select value={data.internetBundle} onValueChange={(v) => updateField("internetBundle", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internet_only">Alleen internet</SelectItem>
                <SelectItem value="internet_tv">Internet + TV</SelectItem>
                <SelectItem value="internet_phone">Internet + Telefonie</SelectItem>
                <SelectItem value="alles_in_1">Alles-in-1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Thuiswerken</Label>
            <Select value={data.worksFromHome} onValueChange={(v) => updateField("worksFromHome", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Nooit</SelectItem>
                <SelectItem value="sometimes">Soms</SelectItem>
                <SelectItem value="often">Vaak</SelectItem>
                <SelectItem value="always">Altijd</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Insurance */}
      <ProfileSectionCard
        title="Verzekering"
        subtitle="Inboedelwaarde"
        icon={<Shield className="w-5 h-5 text-green-500" />}
        iconBgColor="bg-green-500/10"
        isOpen={openSection === "insurance"}
        onToggle={() => setOpenSection(openSection === "insurance" ? null : "insurance")}
        completedFields={getInsuranceCompletion()}
        totalFields={1}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Geschatte inboedelwaarde</Label>
            <Select value={data.insuranceValue} onValueChange={(v) => updateField("insuranceValue", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_25k">Minder dan €25.000</SelectItem>
                <SelectItem value="25k_50k">€25.000 - €50.000</SelectItem>
                <SelectItem value="50k_100k">€50.000 - €100.000</SelectItem>
                <SelectItem value="over_100k">Meer dan €100.000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Moving Details */}
      <ProfileSectionCard
        title="Verhuizing details"
        subtitle="Verdieping & spullen"
        icon={<Truck className="w-5 h-5 text-orange-500" />}
        iconBgColor="bg-orange-500/10"
        isOpen={openSection === "movingDetails"}
        onToggle={() => setOpenSection(openSection === "movingDetails" ? null : "movingDetails")}
        completedFields={getMovingDetailsCompletion()}
        totalFields={4}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verdieping</Label>
              <Select value={data.floorLevel} onValueChange={(v) => updateField("floorLevel", v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ground">Begane grond</SelectItem>
                  <SelectItem value="1">1e verdieping</SelectItem>
                  <SelectItem value="2">2e verdieping</SelectItem>
                  <SelectItem value="3">3e verdieping</SelectItem>
                  <SelectItem value="4+">4e of hoger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Lift aanwezig</Label>
              <Select value={data.hasElevator} onValueChange={(v) => updateField("hasElevator", v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Ja</SelectItem>
                  <SelectItem value="no">Nee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Aantal kamers</Label>
            <Select value={data.numberOfRooms} onValueChange={(v) => updateField("numberOfRooms", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 kamers</SelectItem>
                <SelectItem value="3-4">3-4 kamers</SelectItem>
                <SelectItem value="5-6">5-6 kamers</SelectItem>
                <SelectItem value="7+">7 of meer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Speciale items</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.specialItems.map(item => (
                <Badge key={item} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeSpecialItem(item)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="bijv. Piano, Aquarium"
                value={newSpecialItem}
                onChange={(e) => setNewSpecialItem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSpecialItem()}
                className="rounded-xl h-11"
              />
              <Button variant="outline" size="icon" onClick={addSpecialItem} className="h-11 w-11 rounded-xl shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Post */}
      <ProfileSectionCard
        title="Post doorsturen"
        subtitle="PostNL verhuisservice"
        icon={<Mail className="w-5 h-5 text-cyan-500" />}
        iconBgColor="bg-cyan-500/10"
        isOpen={openSection === "post"}
        onToggle={() => setOpenSection(openSection === "post" ? null : "post")}
        completedFields={getPostCompletion()}
        totalFields={3}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Startdatum doorsturen</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-11", !data.forwardingStartDate && "text-muted-foreground")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {data.forwardingStartDate ? format(new Date(data.forwardingStartDate), "dd-MM-yyyy") : "Selecteer"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={data.forwardingStartDate ? new Date(data.forwardingStartDate) : undefined}
                  onSelect={(date) => updateField("forwardingStartDate", date ? format(date, "yyyy-MM-dd") : "")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Doorstuurperiode</Label>
            <Select value={data.forwardingDuration} onValueChange={(v) => updateField("forwardingDuration", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3_months">3 maanden</SelectItem>
                <SelectItem value="6_months">6 maanden</SelectItem>
                <SelectItem value="12_months">12 maanden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Huisgenoten</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.householdNames.map(name => (
                <Badge key={name} variant="secondary" className="flex items-center gap-1">
                  {name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeHouseholdName(name)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Naam toevoegen"
                value={newHouseholdName}
                onChange={(e) => setNewHouseholdName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHouseholdName()}
                className="rounded-xl h-11"
              />
              <Button variant="outline" size="icon" onClick={addHouseholdName} className="h-11 w-11 rounded-xl shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Cleaning */}
      <ProfileSectionCard
        title="Schoonmaak & klussen"
        subtitle="Service & planning"
        icon={<Sparkle className="w-5 h-5 text-pink-500" />}
        iconBgColor="bg-pink-500/10"
        isOpen={openSection === "cleaning"}
        onToggle={() => setOpenSection(openSection === "cleaning" ? null : "cleaning")}
        completedFields={getCleaningCompletion()}
        totalFields={2}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Type service</Label>
            <Select value={data.serviceType} onValueChange={(v) => updateField("serviceType", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deep_cleaning">Eenmalige grote schoonmaak</SelectItem>
                <SelectItem value="regular">Regelmatige schoonmaak</SelectItem>
                <SelectItem value="move_out">Oplevering schoonmaak</SelectItem>
                <SelectItem value="handyman">Klusjesman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Voorkeursdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-11", !data.preferredServiceDate && "text-muted-foreground")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {data.preferredServiceDate ? format(new Date(data.preferredServiceDate), "dd-MM-yyyy") : "Selecteer"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={data.preferredServiceDate ? new Date(data.preferredServiceDate) : undefined}
                  onSelect={(date) => updateField("preferredServiceDate", date ? format(date, "yyyy-MM-dd") : "")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Renovation */}
      <ProfileSectionCard
        title="Renovatie"
        subtitle="Budget & planning"
        icon={<Wrench className="w-5 h-5 text-rose-500" />}
        iconBgColor="bg-rose-500/10"
        isOpen={openSection === "renovation"}
        onToggle={() => setOpenSection(openSection === "renovation" ? null : "renovation")}
        completedFields={getRenovationCompletion()}
        totalFields={2}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Budget</Label>
            <Select value={data.renovationBudget} onValueChange={(v) => updateField("renovationBudget", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_5k">Minder dan €5.000</SelectItem>
                <SelectItem value="5k_15k">€5.000 - €15.000</SelectItem>
                <SelectItem value="15k_30k">€15.000 - €30.000</SelectItem>
                <SelectItem value="30k_50k">€30.000 - €50.000</SelectItem>
                <SelectItem value="over_50k">Meer dan €50.000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Startdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-11", !data.renovationStartDate && "text-muted-foreground")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {data.renovationStartDate ? format(new Date(data.renovationStartDate), "dd-MM-yyyy") : "Selecteer"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={data.renovationStartDate ? new Date(data.renovationStartDate) : undefined}
                  onSelect={(date) => updateField("renovationStartDate", date ? format(date, "yyyy-MM-dd") : "")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </ProfileSectionCard>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full rounded-xl h-12 gap-2 shadow-soft"
        size="lg"
      >
        <Save className="w-4 h-4" />
        {isLoading ? "Opslaan..." : "Alle wijzigingen opslaan"}
      </Button>
    </div>
  );
};
