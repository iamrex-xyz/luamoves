import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Wifi,
  Home,
  Shield,
  ChevronDown,
  Check,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type ExtraInfoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onUpdate: (info: MovingInfo) => void;
};

type Category = "energie" | "woning" | "internet" | "verzekering" | "verhuizing" | "renovatie";

const categories = [
  {
    id: "energie" as Category,
    title: "Energie",
    subtitle: "Leverancier & aansluiting",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "woning" as Category,
    title: "Woning",
    subtitle: "Type, grootte & kenmerken",
    icon: Home,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "internet" as Category,
    title: "Internet",
    subtitle: "Snelheid & bundel",
    icon: Wifi,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "verzekering" as Category,
    title: "Verzekering",
    subtitle: "Inboedel & opstal",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "verhuizing" as Category,
    title: "Verhuizing",
    subtitle: "Verdieping & spullen",
    icon: Truck,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "renovatie" as Category,
    title: "Renovatie",
    subtitle: "Budget & planning",
    icon: Wrench,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
];

const energySuppliers = [
  "Vattenfall", "Eneco", "Essent", "Budget Energie", "Greenchoice",
  "Vandebron", "Oxxio", "Engie", "Innova Energie", "Pure Energie",
  "NLE", "Mega", "ANWB Energie", "United Consumers", "Coolblue Energie",
  "Tibber", "Frank Energie",
];

export const ExtraInfoSheet = ({
  open,
  onOpenChange,
  movingInfo,
  onUpdate,
}: ExtraInfoSheetProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState<Category | null>(null);

  // Local state for all fields
  const [energyCurrentSupplier, setEnergyCurrentSupplier] = useState("");
  const [hasSmartMeter, setHasSmartMeter] = useState("");
  const [energyConnectionType, setEnergyConnectionType] = useState("");
  const [hasGas, setHasGas] = useState("");
  
  const [propertyType, setPropertyType] = useState("");
  const [buildingYear, setBuildingYear] = useState("");
  const [hasGarden, setHasGarden] = useState("");
  const [gardenSize, setGardenSize] = useState("");
  const [buildingAccess, setBuildingAccess] = useState("");
  
  const [hasFiber, setHasFiber] = useState("");
  const [internetSpeedPreference, setInternetSpeedPreference] = useState("");
  const [internetBundle, setInternetBundle] = useState("");
  const [glasvezel, setGlasvezel] = useState("");
  const [worksFromHome, setWorksFromHome] = useState("");
  
  const [insuranceValue, setInsuranceValue] = useState("");
  
  const [floorLevel, setFloorLevel] = useState("");
  const [hasElevator, setHasElevator] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const [specialItems, setSpecialItems] = useState<string[]>([]);
  
  // New fields for woning
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [numberOfBedrooms, setNumberOfBedrooms] = useState("");
  const [homeSizeM2, setHomeSizeM2] = useState("");
  const [municipality, setMunicipality] = useState("");
  
  // Renovatie fields
  const [renovationBudget, setRenovationBudget] = useState("");
  const [renovationStartDate, setRenovationStartDate] = useState("");

  // Load data when sheet opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Load from movingInfo for guests
        setEnergyCurrentSupplier(movingInfo.energyCurrentSupplier || "");
        setHasSmartMeter(movingInfo.hasSmartMeter || "");
        setEnergyConnectionType(movingInfo.energyConnectionType || "");
        setHasGas(movingInfo.hasGas || "");
        setPropertyType(movingInfo.propertyType || "");
        setBuildingYear(movingInfo.buildingYear || "");
        setHasGarden(movingInfo.hasGarden === true ? "yes" : movingInfo.hasGarden === false ? "no" : "");
        setGardenSize(movingInfo.gardenSize || "");
        setBuildingAccess(movingInfo.buildingAccess || "");
        setHasFiber(movingInfo.hasFiber || "");
        setInternetSpeedPreference(movingInfo.internetSpeedPreference || "");
        setInternetBundle(movingInfo.internetBundle || "");
        setGlasvezel(movingInfo.glasvezel || "");
        setWorksFromHome(movingInfo.worksFromHome || "");
        setInsuranceValue(movingInfo.insuranceValue || "");
        setFloorLevel(movingInfo.floorLevel || "");
        setHasElevator(movingInfo.hasElevator || "");
        setNumberOfRooms(movingInfo.numberOfRooms || "");
        setSpecialItems(movingInfo.specialItems || []);
        // New fields
        setNumberOfFloors((movingInfo as any).numberOfFloors || "");
        setNumberOfBedrooms((movingInfo as any).numberOfBedrooms || "");
        setHomeSizeM2((movingInfo as any).homeSizeM2 || "");
        setMunicipality((movingInfo as any).municipality || "");
        setRenovationBudget((movingInfo as any).renovationBudget || "");
        setRenovationStartDate((movingInfo as any).renovationStartDate || "");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setEnergyCurrentSupplier((profile as any).energy_current_supplier || "");
        setHasSmartMeter((profile as any).has_smart_meter || "");
        setEnergyConnectionType((profile as any).energy_connection_type || "");
        setHasGas((profile as any).has_gas || "");
        setPropertyType((profile as any).housing_property_type || "");
        setBuildingYear((profile as any).building_year || "");
        setHasGarden(profile.has_garden === true ? "yes" : profile.has_garden === false ? "no" : "");
        setGardenSize((profile as any).garden_size || "");
        setBuildingAccess((profile as any).building_access || "");
        setHasFiber((profile as any).has_fiber || "");
        setInternetSpeedPreference((profile as any).internet_speed_preference || "");
        setInternetBundle((profile as any).internet_bundle || "");
        setGlasvezel((profile as any).glasvezel || "");
        setWorksFromHome((profile as any).works_from_home || "");
        setInsuranceValue((profile as any).insurance_value || "");
        setFloorLevel((profile as any).floor_level || "");
        setHasElevator((profile as any).has_elevator || "");
        setNumberOfRooms((profile as any).number_of_rooms || "");
        setSpecialItems((profile as any).special_items || []);
        // New fields
        setNumberOfFloors((profile as any).number_of_floors || "");
        setNumberOfBedrooms((profile as any).number_of_bedrooms || "");
        setHomeSizeM2((profile as any).home_size_m2 || "");
        setMunicipality((profile as any).municipality || "");
        setRenovationBudget((profile as any).renovation_budget || "");
        setRenovationStartDate((profile as any).renovation_start_date || "");
      }
    } catch (error) {
      console.error("Error loading extra info:", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const updatedInfo: Partial<MovingInfo> = {
        energyCurrentSupplier: energyCurrentSupplier || undefined,
        hasSmartMeter: hasSmartMeter as any || undefined,
        energyConnectionType: energyConnectionType as any || undefined,
        hasGas: hasGas as any || undefined,
        propertyType: propertyType as any || undefined,
        buildingYear: buildingYear as any || undefined,
        hasGarden: hasGarden === "yes" ? true : hasGarden === "no" ? false : undefined,
        gardenSize: gardenSize as any || undefined,
        buildingAccess: buildingAccess as any || undefined,
        hasFiber: hasFiber as any || undefined,
        internetSpeedPreference: internetSpeedPreference as any || undefined,
        internetBundle: internetBundle as any || undefined,
        glasvezel: glasvezel as any || undefined,
        worksFromHome: worksFromHome as any || undefined,
        insuranceValue: insuranceValue as any || undefined,
        floorLevel: floorLevel || undefined,
        hasElevator: hasElevator || undefined,
        numberOfRooms: numberOfRooms || undefined,
        specialItems: specialItems.length > 0 ? specialItems : undefined,
        // New fields
        numberOfFloors: numberOfFloors || undefined,
        numberOfBedrooms: numberOfBedrooms || undefined,
        homeSizeM2: homeSizeM2 || undefined,
        municipality: municipality || undefined,
        renovationBudget: renovationBudget || undefined,
        renovationStartDate: renovationStartDate || undefined,
      } as Partial<MovingInfo>;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            energy_current_supplier: energyCurrentSupplier || null,
            has_smart_meter: hasSmartMeter || null,
            energy_connection_type: energyConnectionType || null,
            has_gas: hasGas || null,
            housing_property_type: propertyType || null,
            building_year: buildingYear || null,
            has_garden: hasGarden === "yes" ? true : hasGarden === "no" ? false : null,
            garden_size: gardenSize || null,
            building_access: buildingAccess || null,
            has_fiber: hasFiber || null,
            internet_speed_preference: internetSpeedPreference || null,
            internet_bundle: internetBundle || null,
            glasvezel: glasvezel || null,
            works_from_home: worksFromHome || null,
            insurance_value: insuranceValue || null,
            floor_level: floorLevel || null,
            has_elevator: hasElevator || null,
            number_of_rooms: numberOfRooms || null,
            special_items: specialItems.length > 0 ? specialItems : [],
            // New fields
            number_of_floors: numberOfFloors || null,
            number_of_bedrooms: numberOfBedrooms || null,
            home_size_m2: homeSizeM2 || null,
            municipality: municipality || null,
            renovation_budget: renovationBudget || null,
            renovation_start_date: renovationStartDate || null,
          } as any)
          .eq("user_id", user.id);

        if (error) throw error;
      }

      onUpdate({ ...movingInfo, ...updatedInfo });

      toast({
        title: "Opgeslagen",
        description: "Je gegevens zijn bijgewerkt.",
      });
    } catch (error) {
      console.error("Error saving extra info:", error);
      toast({
        title: "Fout",
        description: "Kon gegevens niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionStatus = (categoryId: Category) => {
    switch (categoryId) {
      case "energie":
        return [energyCurrentSupplier, hasSmartMeter, energyConnectionType].filter(Boolean).length;
      case "woning":
        return [propertyType, buildingYear, hasGarden, buildingAccess, numberOfFloors, numberOfBedrooms, homeSizeM2].filter(Boolean).length;
      case "internet":
        return [hasFiber, internetSpeedPreference, internetBundle].filter(Boolean).length;
      case "verzekering":
        return [insuranceValue].filter(Boolean).length;
      case "verhuizing":
        return [floorLevel, hasElevator, numberOfRooms, specialItems.length > 0 ? "filled" : ""].filter(Boolean).length;
      case "renovatie":
        return [renovationBudget, renovationStartDate].filter(Boolean).length;
      default:
        return 0;
    }
  };

  const getTotalFields = (categoryId: Category) => {
    switch (categoryId) {
      case "energie": return 3;
      case "woning": return 7;
      case "internet": return 3;
      case "verzekering": return 1;
      case "verhuizing": return 4;
      case "renovatie": return 2;
      default: return 0;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-left">Extra info</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Zo kan Lua je beter helpen
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(85vh-140px)] space-y-3 pb-4">
          {categories.map((category) => {
            const completed = getCompletionStatus(category.id);
            const total = getTotalFields(category.id);
            const isComplete = completed === total;

            return (
              <Collapsible
                key={category.id}
                open={openCategory === category.id}
                onOpenChange={(isOpen) => setOpenCategory(isOpen ? category.id : null)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", category.bgColor)}>
                      <category.icon className={cn("w-5 h-5", category.color)} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{category.title}</p>
                      <p className="text-xs text-muted-foreground">{category.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{completed}/{total}</span>
                      )}
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        openCategory === category.id && "rotate-180"
                      )} />
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-3 px-2 space-y-3">
                  {category.id === "energie" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Huidige leverancier</Label>
                        <Select value={energyCurrentSupplier} onValueChange={setEnergyCurrentSupplier}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50 max-h-64">
                            {energySuppliers.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                            <SelectItem value="unknown">Weet ik niet / heb ik niet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Slimme meter</Label>
                        <Select value={hasSmartMeter} onValueChange={setHasSmartMeter}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="yes">Ja, slimme meter</SelectItem>
                            <SelectItem value="no">Nee, normale meter</SelectItem>
                            <SelectItem value="unknown">Weet ik niet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Aansluiting</Label>
                        <Select value={energyConnectionType} onValueChange={setEnergyConnectionType}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="gas_stroom">Gas & stroom</SelectItem>
                            <SelectItem value="alleen_stroom">Alleen stroom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {category.id === "woning" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Type woning</Label>
                        <Select value={propertyType} onValueChange={setPropertyType}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="apartment">Appartement</SelectItem>
                            <SelectItem value="house">Eengezinswoning</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bouwjaar</Label>
                        <Select value={buildingYear} onValueChange={setBuildingYear}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="new">Nieuwbouw (na 2020)</SelectItem>
                            <SelectItem value="recent">Recent (2000-2020)</SelectItem>
                            <SelectItem value="older">Ouder (voor 2000)</SelectItem>
                            <SelectItem value="unknown">Weet ik niet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tuin</Label>
                        <Select value={hasGarden} onValueChange={setHasGarden}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="yes">Ja</SelectItem>
                            <SelectItem value="no">Nee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bereikbaarheid</Label>
                        <Select value={buildingAccess} onValueChange={setBuildingAccess}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="easy">Makkelijk (begane grond/lift)</SelectItem>
                            <SelectItem value="medium">Redelijk (1-2 trappen)</SelectItem>
                            <SelectItem value="hard">Lastig (3+ trappen, geen lift)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Aantal verdiepingen</Label>
                        <Select value={numberOfFloors} onValueChange={setNumberOfFloors}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="1">1 verdieping</SelectItem>
                            <SelectItem value="2">2 verdiepingen</SelectItem>
                            <SelectItem value="3">3 verdiepingen</SelectItem>
                            <SelectItem value="4+">4 of meer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Aantal slaapkamers</Label>
                        <Select value={numberOfBedrooms} onValueChange={setNumberOfBedrooms}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="1">1 slaapkamer</SelectItem>
                            <SelectItem value="2">2 slaapkamers</SelectItem>
                            <SelectItem value="3">3 slaapkamers</SelectItem>
                            <SelectItem value="4">4 slaapkamers</SelectItem>
                            <SelectItem value="5+">5 of meer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Woonoppervlakte (m²)</Label>
                        <Input
                          type="text"
                          value={homeSizeM2}
                          onChange={(e) => setHomeSizeM2(e.target.value)}
                          placeholder="bijv. 80"
                          className="rounded-xl h-11 mt-1"
                        />
                      </div>
                    </>
                  )}

                  {category.id === "internet" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Glasvezel beschikbaar</Label>
                        <Select value={hasFiber} onValueChange={setHasFiber}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="yes">Ja, glasvezel beschikbaar</SelectItem>
                            <SelectItem value="no">Nee, geen glasvezel</SelectItem>
                            <SelectItem value="unknown">Weet ik niet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Gewenste snelheid</Label>
                        <Select value={internetSpeedPreference} onValueChange={setInternetSpeedPreference}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="basic">Basis (mail & browsen)</SelectItem>
                            <SelectItem value="medium">Gemiddeld (streamen)</SelectItem>
                            <SelectItem value="high">Veel (thuiswerken/gamen)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bundel</Label>
                        <Select value={internetBundle} onValueChange={setInternetBundle}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="internet_only">Alleen internet</SelectItem>
                            <SelectItem value="internet_tv">Internet + tv</SelectItem>
                            <SelectItem value="internet_tv_mobile">Internet + tv + mobiel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {category.id === "verzekering" && (
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Geschatte inboedelwaarde</Label>
                      <Select value={insuranceValue} onValueChange={setInsuranceValue}>
                        <SelectTrigger className="rounded-xl h-11 mt-1">
                          <SelectValue placeholder="Selecteer" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="low">Tot €25.000</SelectItem>
                          <SelectItem value="medium">€25.000 - €75.000</SelectItem>
                          <SelectItem value="high">Meer dan €75.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {category.id === "verhuizing" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Verdieping</Label>
                        <Select value={floorLevel} onValueChange={setFloorLevel}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="begane-grond">Begane grond</SelectItem>
                            <SelectItem value="1">1e verdieping</SelectItem>
                            <SelectItem value="2">2e verdieping</SelectItem>
                            <SelectItem value="3">3e verdieping</SelectItem>
                            <SelectItem value="4+">4e of hoger</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Lift aanwezig</Label>
                        <Select value={hasElevator} onValueChange={setHasElevator}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="ja">Ja, er is een lift</SelectItem>
                            <SelectItem value="nee">Nee, geen lift</SelectItem>
                            <SelectItem value="nvt">Niet van toepassing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Aantal kamers</Label>
                        <Select value={numberOfRooms} onValueChange={setNumberOfRooms}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="1-2">1-2 kamers</SelectItem>
                            <SelectItem value="3-4">3-4 kamers</SelectItem>
                            <SelectItem value="5-6">5-6 kamers</SelectItem>
                            <SelectItem value="7+">7 of meer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Speciale items</Label>
                        <div className="space-y-2 mt-2">
                          {[
                            { value: "piano", label: "Piano/Vleugel" },
                            { value: "witgoed", label: "Witgoed" },
                            { value: "inpakservice", label: "Inpakservice nodig" },
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setSpecialItems(prev =>
                                  prev.includes(item.value)
                                    ? prev.filter(i => i !== item.value)
                                    : [...prev, item.value]
                                );
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                specialItems.includes(item.value)
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                specialItems.includes(item.value)
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              )}>
                                {specialItems.includes(item.value) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {category.id === "renovatie" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Budgetindicatie</Label>
                        <Select value={renovationBudget} onValueChange={setRenovationBudget}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="under_5k">Minder dan €5.000</SelectItem>
                            <SelectItem value="5k_15k">€5.000 - €15.000</SelectItem>
                            <SelectItem value="15k_50k">€15.000 - €50.000</SelectItem>
                            <SelectItem value="over_50k">Meer dan €50.000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Startdatum renovatie</Label>
                        <Input
                          type="date"
                          value={renovationStartDate}
                          onChange={(e) => setRenovationStartDate(e.target.value)}
                          className="rounded-xl h-11 mt-1"
                        />
                      </div>
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="w-full h-12 rounded-xl"
          >
            Opslaan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
