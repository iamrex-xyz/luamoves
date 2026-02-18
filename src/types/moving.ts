export type MovingInfo = {
  oldAddress: string;
  newAddress: string;
  movingDate: string;
  keyHandoverDate?: string;
  type: "buy" | "rent";
  renovationType?: "none" | "small" | "large";
  needsContractorHelp?: boolean;
  // Personalisatie velden
  propertyType?: "apartment" | "house" | "studio";
  hasGarden?: boolean;
  hasParking?: boolean;
  isVve?: boolean;
  currentSituation?: "rent" | "buy" | "parents" | "other";
  hasJob?: boolean;
  adults?: number;
  children?: number;
  pets?: number;
  // Smart questions velden
  hasGas?: "yes" | "no";
  hasSmartMeter?: "yes" | "no" | "unknown";
  glasvezel?: "yes" | "no" | "unknown";
  worksFromHome?: "yes" | "sometimes" | "no";
  buildingAccess?: "easy" | "medium" | "hard";
  insuranceValue?: "low" | "medium" | "high";
  buildingYear?: "new" | "recent" | "older" | "unknown";
  gardenSize?: "small" | "medium" | "large";
  childrenAges?: string;
  // Energy questions velden
  energyCurrentSupplier?: string;
  energyConnectionType?: "gas_stroom" | "alleen_stroom";
  // Internet questions velden
  hasFiber?: "yes" | "no" | "unknown";
  internetSpeedPreference?: "basic" | "medium" | "high";
  internetBundle?: "internet_only" | "internet_tv" | "internet_tv_mobile";
  // Moving helper questions velden
  floorLevel?: string;
  hasElevator?: string;
  numberOfRooms?: string;
  specialItems?: string[];
  // Boxes questions velden
  hasFragileItems?: string;
  // Insurance questions velden
  homeSizeM2?: string;
  // Forwarding service velden
  forwardingStartDate?: string;
  forwardingDuration?: string;
  householdNames?: string[];
  // Parking/lift velden
  municipality?: string;
  // Cleaning/painting velden
  serviceType?: string;
  preferredServiceDate?: string;
  // Smoke detector velden
  numberOfFloors?: string;
  numberOfBedrooms?: string;
  // Garden velden
  gardenServiceType?: string;
  // Renovation velden
  renovationBudget?: string;
  renovationStartDate?: string;
  housingPropertyType?: string;
  // Contact veld
  phone?: string;
  // Budget veld
  movingBudget?: number;
  // KOOP-specifieke intake velden
  hypotheekDoel?: string;
  hypotheekWerkSituatie?: string;
  hypotheekHeeftPartner?: string;
  hypotheekKoopsom?: number;
  notarisDienst?: string;
  taxatieDoel?: string;
  taxatieVoorkeursdatum?: string;
  bouwkundigeKeuringVoorkeursdatum?: string;
  opstalDakType?: string;
  slotVeiligheidsniveau?: string;
  slotAantalDeuren?: string;
  slotMontage?: string;
  verhuisliftLocatie?: string;
};

export type AppView = "onboarding" | "auth" | "dashboard" | "tasks" | "extras" | "settings" | "chat";
