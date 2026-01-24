import { Task } from "@/lib/taskGenerator";
import { MovingInfo } from "@/pages/Index";

// Task type detection helpers
export const isEnergyTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("energieleverancier") ||
    (titleLower.includes("energie") && titleLower.includes("vergelijk")) ||
    (titleLower.includes("energie") && titleLower.includes("regelen")) ||
    (titleLower.includes("energiecontract") && titleLower.includes("kiezen")) ||
    idLower.includes("energie-vergelijk") ||
    idLower.includes("energy-compare") ||
    idLower.includes("fase2-energie") ||
    idLower.includes("rent-phase1-5") ||
    idLower.includes("buy-phase2-12")
  );
};

export const isInternetTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("internet") ||
    (titleLower.includes("regel") && titleLower.includes("telefoon")) ||
    idLower.includes("internet")
  );
};

export const isMovingTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  // Exclude feedback task from moving task detection
  if (isMovingFeedbackTask(task)) return false;
  return (
    (titleLower.includes("verhuisbedrijf") || titleLower.includes("helpers")) ||
    (titleLower.includes("regel") && (titleLower.includes("verhuis") || titleLower.includes("helpers"))) ||
    idLower.includes("verhuisbedrijf") ||
    idLower.includes("moving-company")
  );
};

export const isMovingFeedbackTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    idLower.includes("moving-feedback") ||
    idLower.includes("verhuisbedrijf-feedback") ||
    (titleLower.includes("feedback") && titleLower.includes("verhuisbedrijf"))
  );
};

export const isBoxesTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("verhuisdozen") ||
    (titleLower.includes("bestel") && titleLower.includes("dozen")) ||
    idLower.includes("boxes") ||
    idLower.includes("dozen")
  );
};

export const isInsuranceTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("inboedelverzekering") ||
    (titleLower.includes("inboedel") && titleLower.includes("regelen")) ||
    (titleLower.includes("controleer") && titleLower.includes("verzekering")) ||
    idLower.includes("insurance") ||
    idLower.includes("inboedel")
  );
};

export const isLiabilityTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("aansprakelijkheidsverzekering") ||
    (titleLower.includes("aansprakelijkheid") && titleLower.includes("verzekering")) ||
    idLower.includes("liability") ||
    idLower.includes("aansprakelijkheid")
  );
};

export const isForwardingTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("postnl") ||
    titleLower.includes("doorstuur") ||
    (titleLower.includes("post") && titleLower.includes("doorsturen")) ||
    idLower.includes("forwarding") ||
    idLower.includes("postnl")
  );
};

export const isParkingTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("parkeervergunning") ||
    titleLower.includes("parkeersituatie") ||
    (titleLower.includes("parking") && titleLower.includes("permit")) ||
    idLower.includes("parkeervergunning")
  );
};

export const isVerhuisliftTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("verhuislift") ||
    idLower.includes("verhuislift")
  );
};

export const isCleaningTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("schoonmaak") ||
    titleLower.includes("schilderwerk") ||
    (titleLower.includes("plan") && (titleLower.includes("cleaning") || titleLower.includes("painting"))) ||
    idLower.includes("cleaning") ||
    idLower.includes("schilderwerk")
  );
};

export const isSmokeDetectorTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("rookmelder") ||
    titleLower.includes("smoke detector") ||
    idLower.includes("rookmelder") ||
    idLower.includes("smoke")
  );
};

export const isGardenTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("tuinonderhoud") ||
    titleLower.includes("tuin") ||
    (titleLower.includes("garden") && titleLower.includes("maintenance")) ||
    idLower.includes("garden") ||
    idLower.includes("tuin")
  );
};

export const isRenovationTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("aannemer") ||
    titleLower.includes("materialen inkopen") ||
    titleLower.includes("materiaal inkopen") ||
    (titleLower.includes("vergelijk") && titleLower.includes("aannemer")) ||
    idLower.includes("contractor") ||
    idLower.includes("materialen") ||
    idLower.includes("materiaal")
  );
};

// KOOP-specifieke helpers
export const isHypothekTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("hypotheek") ||
    titleLower.includes("hypotheekadviseur") ||
    idLower.includes("hypotheek")
  );
};

export const isBouwkundigeKeuringTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("bouwkundige keuring") ||
    titleLower.includes("bouwkundig") ||
    idLower.includes("bouwkundig")
  );
};

export const isNotarisTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("notaris") ||
    idLower.includes("notaris")
  );
};

export const isTaxatieTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("taxatie") ||
    idLower.includes("taxatie")
  );
};

export const isOpstalTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("opstalverzekering") ||
    titleLower.includes("opstal") ||
    idLower.includes("opstal")
  );
};

export const isSlotTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("slotcilinder") ||
    titleLower.includes("slot") ||
    idLower.includes("slotcilinder")
  );
};

export const isBudgetTask = (task: Task): boolean => {
  const titleLower = task.title.toLowerCase();
  const idLower = task.id.toLowerCase();
  return (
    titleLower.includes("verhuisbudget") ||
    titleLower.includes("budget instellen") ||
    idLower.includes("verhuisbudget") ||
    idLower.includes("budget")
  );
};

export const isInviteHouseholdTask = (task: Task): boolean => {
  return task.id === "invite-household-members";
};

// Needs questions helpers
export const needsEnergyQuestions = (info: MovingInfo): boolean => {
  return !info.energyCurrentSupplier || !info.hasSmartMeter || !info.energyConnectionType;
};

export const needsInternetQuestions = (info: MovingInfo): boolean => {
  return !info.hasFiber || !info.internetSpeedPreference || !info.internetBundle;
};

export const needsMovingQuestions = (info: MovingInfo): boolean => {
  return !info.floorLevel || !info.hasElevator || !info.numberOfRooms || !info.specialItems || info.specialItems.length === 0;
};

export const needsBoxesQuestions = (info: MovingInfo): boolean => {
  return !info.numberOfRooms || !info.hasFragileItems;
};

export const needsInsuranceQuestions = (info: MovingInfo): boolean => {
  return !info.homeSizeM2 || !info.insuranceValue;
};

export const needsLiabilityQuestions = (info: MovingInfo): boolean => {
  return info.children === undefined || info.children === null || 
         info.pets === undefined || info.pets === null;
};

export const needsForwardingQuestions = (info: MovingInfo): boolean => {
  return !info.forwardingStartDate || !info.forwardingDuration || !info.householdNames || info.householdNames.length === 0;
};

export const needsVerhuisliftQuestions = (info: MovingInfo): boolean => {
  return !info.propertyType || !info.buildingAccess;
};

export const needsCleaningQuestions = (info: MovingInfo): boolean => {
  return !(info as any).serviceType || !info.homeSizeM2 || !(info as any).preferredServiceDate;
};

export const needsSmokeDetectorQuestions = (info: MovingInfo): boolean => {
  return !(info as any).numberOfFloors || !(info as any).numberOfBedrooms;
};

export const needsGardenQuestions = (info: MovingInfo): boolean => {
  return info.hasGarden === undefined || info.hasGarden === null || 
         (info.hasGarden && (!info.gardenSize || !(info as any).gardenServiceType));
};

export const needsRenovationQuestions = (info: MovingInfo): boolean => {
  return !(info as any).renovationBudget || 
         !(info as any).renovationStartDate || 
         !(info as any).housingPropertyType;
};

// Check if a task has affiliate options (i.e., should show "Regelen" button)
export const hasAffiliateOptions = (task: Task): boolean => {
  return (
    isEnergyTask(task) ||
    isInternetTask(task) ||
    isMovingTask(task) ||
    isMovingFeedbackTask(task) ||
    isBoxesTask(task) ||
    isInsuranceTask(task) ||
    isLiabilityTask(task) ||
    isForwardingTask(task) ||
    isVerhuisliftTask(task) ||
    isCleaningTask(task) ||
    isSmokeDetectorTask(task) ||
    isGardenTask(task) ||
    isRenovationTask(task) ||
    isHypothekTask(task) ||
    isBouwkundigeKeuringTask(task) ||
    isNotarisTask(task) ||
    isTaxatieTask(task) ||
    isOpstalTask(task) ||
    isSlotTask(task) ||
    isBudgetTask(task) ||
    isInviteHouseholdTask(task)
  );
};

// Get custom button label for specific task types
export const getTaskButtonLabel = (task: Task): string | null => {
  if (isMovingFeedbackTask(task)) {
    return "Feedback achterlaten";
  }
  return null;
};

// Task type to redirect URL mapping
export const getTaskRedirectUrl = (taskType: string): string => {
  const redirectMap: Record<string, string> = {
    energy: "Vergelijk en kies energieleverancier",
    internet: "Regel internet en telefoon",
    moving: "Regel verhuisbedrijf of helpers",
    boxes: "Bestel verhuisdozen",
    insurance: "Controleer inboedelverzekering",
    liability: "Controleer aansprakelijkheidsverzekering",
    forwarding: "Vraag PostNL doorstuurservice aan",
    verhuislift: "Verhuislift regelen",
    cleaning: "Plan schoonmaak of schilderwerk",
    smokeDetector: "Controleer rookmelders",
    garden: "Plan tuinonderhoud",
    renovation: "Aannemers vergelijken",
  };
  return redirectMap[taskType] || "";
};
