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
} from "lucide-react";
import { cn } from "@/lib/utils";

type ExtraInfoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onUpdate: (info: MovingInfo) => void;
};

type Category = "energie" | "woning" | "internet" | "verzekering";

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
    subtitle: "Type & kenmerken",
    icon: Home,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "internet" as Category,
    title: "Internet",
    subtitle: "Verbinding & thuiswerken",
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
  
  const [glasvezel, setGlasvezel] = useState("");
  const [worksFromHome, setWorksFromHome] = useState("");
  
  const [insuranceValue, setInsuranceValue] = useState("");

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
        setGlasvezel(movingInfo.glasvezel || "");
        setWorksFromHome(movingInfo.worksFromHome || "");
        setInsuranceValue(movingInfo.insuranceValue || "");
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
        setGlasvezel((profile as any).glasvezel || "");
        setWorksFromHome((profile as any).works_from_home || "");
        setInsuranceValue((profile as any).insurance_value || "");
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
        glasvezel: glasvezel as any || undefined,
        worksFromHome: worksFromHome as any || undefined,
        insuranceValue: insuranceValue as any || undefined,
      };

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
            glasvezel: glasvezel || null,
            works_from_home: worksFromHome || null,
            insurance_value: insuranceValue || null,
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
        return [propertyType, buildingYear, hasGarden, buildingAccess].filter(Boolean).length;
      case "internet":
        return [glasvezel, worksFromHome].filter(Boolean).length;
      case "verzekering":
        return [insuranceValue].filter(Boolean).length;
    }
  };

  const getTotalFields = (categoryId: Category) => {
    switch (categoryId) {
      case "energie": return 3;
      case "woning": return 4;
      case "internet": return 2;
      case "verzekering": return 1;
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
                    </>
                  )}

                  {category.id === "internet" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Glasvezel beschikbaar</Label>
                        <Select value={glasvezel} onValueChange={setGlasvezel}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="yes">Ja, glasvezel</SelectItem>
                            <SelectItem value="no">Nee, kabel/DSL</SelectItem>
                            <SelectItem value="unknown">Weet ik niet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Thuiswerken</Label>
                        <Select value={worksFromHome} onValueChange={setWorksFromHome}>
                          <SelectTrigger className="rounded-xl h-11 mt-1">
                            <SelectValue placeholder="Selecteer" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="yes">Ja, regelmatig</SelectItem>
                            <SelectItem value="sometimes">Soms</SelectItem>
                            <SelectItem value="no">Nee, nooit</SelectItem>
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
