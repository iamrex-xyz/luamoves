import { MovingInfo } from "@/pages/Index";

export type SmartQuestionType =
  | "keyHandoverDate"
  | "hasGas"
  | "hasSmartMeter"
  | "propertyType"
  | "glasvezel"
  | "worksFromHome"
  | "buildingAccess"
  | "insuranceValue"
  | "buildingYear"
  | "renovationType"
  | "needsContractor"
  | "hasGarden"
  | "gardenSize"
  | "hasChildren"
  | "hasPets"
  | "householdType"
  | "hasJob"
  | "parkingPermitNeeded";

export type SmartQuestion = {
  type: SmartQuestionType;
  luaMessage: string;
  options?: { value: string; label: string }[];
  inputType: "select" | "date" | "text" | "number" | "radio" | "counter";
  placeholder?: string;
  fieldKey: keyof MovingInfo;
};

// Lua-stijl vriendelijke vragen
export const smartQuestions: Record<SmartQuestionType, SmartQuestion> = {
  keyHandoverDate: {
    type: "keyHandoverDate",
    luaMessage: "Handig! Dan kan ik de planning nog beter timen 👉 Wanneer krijg je ongeveer de sleutel?",
    inputType: "date",
    fieldKey: "keyHandoverDate",
  },
  hasGas: {
    type: "hasGas",
    luaMessage: "Even checken: heeft je nieuwe woning gasaansluiting? 🔥",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja, met gas" },
      { value: "no", label: "Nee, all-electric" },
    ],
    fieldKey: "hasGas",
  },
  hasSmartMeter: {
    type: "hasSmartMeter",
    luaMessage: "Heeft je woning een slimme meter? Dan kan je makkelijk foto's uploaden 📸",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja, slimme meter" },
      { value: "no", label: "Nee, normale meter" },
      { value: "unknown", label: "Weet ik niet" },
    ],
    fieldKey: "hasSmartMeter",
  },
  propertyType: {
    type: "propertyType",
    luaMessage: "Wat voor type woning wordt het? 🏠",
    inputType: "radio",
    options: [
      { value: "apartment", label: "Appartement" },
      { value: "house", label: "Eengezinswoning" },
      { value: "studio", label: "Studio" },
    ],
    fieldKey: "propertyType",
  },
  glasvezel: {
    type: "glasvezel",
    luaMessage: "Weet je of er glasvezel beschikbaar is op je nieuwe adres? 🌐",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja, glasvezel" },
      { value: "no", label: "Nee, kabel/DSL" },
      { value: "unknown", label: "Weet ik niet" },
    ],
    fieldKey: "glasvezel",
  },
  worksFromHome: {
    type: "worksFromHome",
    luaMessage: "Werk je wel eens thuis? Dan is stabiel internet extra belangrijk! 💻",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja, regelmatig" },
      { value: "sometimes", label: "Soms" },
      { value: "no", label: "Nee, nooit" },
    ],
    fieldKey: "worksFromHome",
  },
  buildingAccess: {
    type: "buildingAccess",
    luaMessage: "Hoe is de bereikbaarheid van je nieuwe woning voor verhuizers? 🚚",
    inputType: "radio",
    options: [
      { value: "easy", label: "Makkelijk (begane grond/lift)" },
      { value: "medium", label: "Redelijk (1-2 trappen)" },
      { value: "hard", label: "Lastig (3+ trappen, geen lift)" },
    ],
    fieldKey: "buildingAccess",
  },
  insuranceValue: {
    type: "insuranceValue",
    luaMessage: "Heb je een idee van de totale waarde van je inboedel? Zo kan ik beter adviseren 💰",
    inputType: "radio",
    options: [
      { value: "low", label: "Tot €25.000" },
      { value: "medium", label: "€25.000 - €75.000" },
      { value: "high", label: "Meer dan €75.000" },
    ],
    fieldKey: "insuranceValue",
  },
  buildingYear: {
    type: "buildingYear",
    luaMessage: "Weet je het bouwjaar van je nieuwe woning? 🏗️",
    inputType: "radio",
    options: [
      { value: "new", label: "Nieuwbouw (na 2020)" },
      { value: "recent", label: "Recent (2000-2020)" },
      { value: "older", label: "Ouder (voor 2000)" },
      { value: "unknown", label: "Weet ik niet" },
    ],
    fieldKey: "buildingYear",
  },
  renovationType: {
    type: "renovationType",
    luaMessage: "Ga je nog verbouwen in je nieuwe woning? 🔨",
    inputType: "radio",
    options: [
      { value: "none", label: "Nee, direct woonklaar" },
      { value: "small", label: "Klein (schilderen, vloeren)" },
      { value: "large", label: "Groot (keuken, badkamer, etc.)" },
    ],
    fieldKey: "renovationType",
  },
  needsContractor: {
    type: "needsContractor",
    luaMessage: "Heb je hulp nodig van een aannemer of doe je het zelf? 👷",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja, ik zoek een aannemer" },
      { value: "no", label: "Nee, ik doe het zelf" },
    ],
    fieldKey: "needsContractorHelp",
  },
  hasGarden: {
    type: "hasGarden",
    luaMessage: "Heeft je nieuwe woning een tuin? 🌳",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja" },
      { value: "no", label: "Nee" },
    ],
    fieldKey: "hasGarden",
  },
  gardenSize: {
    type: "gardenSize",
    luaMessage: "Hoe groot is de tuin ongeveer?",
    inputType: "radio",
    options: [
      { value: "small", label: "Klein (balkon/terras)" },
      { value: "medium", label: "Gemiddeld" },
      { value: "large", label: "Groot" },
    ],
    fieldKey: "gardenSize",
  },
  hasChildren: {
    type: "hasChildren",
    luaMessage: "Verhuizen er kinderen mee? Dan voeg ik school/opvang taken toe 👶",
    inputType: "counter",
    fieldKey: "children",
  },
  hasPets: {
    type: "hasPets",
    luaMessage: "Heb je huisdieren? Dan voeg ik dierenarts taken toe 🐾",
    inputType: "counter",
    fieldKey: "pets",
  },
  householdType: {
    type: "householdType",
    luaMessage: "Woon je alleen of samen? Dan weten we of je taken kunt delen 👥",
    inputType: "radio",
    options: [
      { value: "single", label: "Alleen" },
      { value: "partner", label: "Met partner" },
      { value: "family", label: "Met gezin" },
      { value: "roommates", label: "Met huisgenoten" },
    ],
    fieldKey: "currentSituation",
  },
  hasJob: {
    type: "hasJob",
    luaMessage: "Heb je een baan? Dan voegen we werkgever-taken toe 💼",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja" },
      { value: "no", label: "Nee" },
    ],
    fieldKey: "hasJob",
  },
  parkingPermitNeeded: {
    type: "parkingPermitNeeded",
    luaMessage: "Heb je een parkeervergunning nodig op je nieuwe adres? 🚗",
    inputType: "radio",
    options: [
      { value: "yes", label: "Ja" },
      { value: "no", label: "Nee" },
      { value: "unknown", label: "Weet ik niet" },
    ],
    fieldKey: "hasParking",
  },
};

// Mapping van taken naar benodigde vragen
export type TaskQuestionTrigger = {
  taskIdPatterns: string[];
  titlePatterns: string[];
  requiredQuestions: SmartQuestionType[];
  checkField: (movingInfo: MovingInfo & Record<string, any>) => boolean;
};

export const taskQuestionTriggers: TaskQuestionTrigger[] = [
  // ===== ENERGIE & NUTS =====
  // Energiecontract: keyHandoverDate + gasConnection
  {
    taskIdPatterns: ["energy", "energieleverancier", "energie"],
    titlePatterns: ["energie", "energieleverancier", "energiecontract"],
    requiredQuestions: ["keyHandoverDate"],
    checkField: (info) => !info.keyHandoverDate,
  },
  {
    taskIdPatterns: ["energy", "energieleverancier", "energie"],
    titlePatterns: ["energie", "energieleverancier", "energiecontract"],
    requiredQuestions: ["hasGas"],
    checkField: (info) => !!info.keyHandoverDate && info.hasGas === undefined,
  },
  // Water/elektra activatie: keyHandoverDate
  {
    taskIdPatterns: ["water", "elektra"],
    titlePatterns: ["water", "elektra", "activatie"],
    requiredQuestions: ["keyHandoverDate"],
    checkField: (info) => !info.keyHandoverDate,
  },
  // Meterstanden: keyHandoverDate + hasSmartMeter
  {
    taskIdPatterns: ["meter"],
    titlePatterns: ["meterstanden", "meter"],
    requiredQuestions: ["keyHandoverDate"],
    checkField: (info) => !info.keyHandoverDate,
  },
  {
    taskIdPatterns: ["meter"],
    titlePatterns: ["meterstanden", "meter"],
    requiredQuestions: ["hasSmartMeter"],
    checkField: (info) => !!info.keyHandoverDate && info.hasSmartMeter === undefined,
  },

  // ===== INTERNET & TV =====
  // Internet: woningType
  {
    taskIdPatterns: ["internet", "wifi", "provider"],
    titlePatterns: ["internet", "telefoon", "wifi", "provider", "glasvezel"],
    requiredQuestions: ["propertyType"],
    checkField: (info) => !info.propertyType,
  },

  // ===== VERHUISBEDRIJF / HELPERS =====
  // Verhuisbedrijf/verhuislift: woningType + bereikbaarheid
  {
    taskIdPatterns: ["verhuisbedrijf", "verhuizers", "verhuislift"],
    titlePatterns: ["verhuisbedrijf", "verhuizers", "verhuislift", "helpers"],
    requiredQuestions: ["propertyType"],
    checkField: (info) => !info.propertyType,
  },
  {
    taskIdPatterns: ["verhuisbedrijf", "verhuizers", "verhuislift"],
    titlePatterns: ["verhuisbedrijf", "verhuizers", "verhuislift", "helpers"],
    requiredQuestions: ["buildingAccess"],
    checkField: (info) => !!info.propertyType && info.buildingAccess === undefined,
  },
  // Parkeervergunning: parkingPermitNeeded
  {
    taskIdPatterns: ["parkeer", "vergunning"],
    titlePatterns: ["parkeer", "vergunning"],
    requiredQuestions: ["parkingPermitNeeded"],
    checkField: (info) => info.hasParking === undefined,
  },

  // ===== VERZEKERINGEN =====
  // Inboedelverzekering: insuranceValue
  {
    taskIdPatterns: ["inboedel"],
    titlePatterns: ["inboedelverzekering", "inboedel"],
    requiredQuestions: ["insuranceValue"],
    checkField: (info) => info.insuranceValue === undefined,
  },
  // Opstalverzekering (alleen koop): buildingYear
  {
    taskIdPatterns: ["opstal"],
    titlePatterns: ["opstalverzekering", "opstal"],
    requiredQuestions: ["buildingYear"],
    checkField: (info) => info.type === "buy" && info.buildingYear === undefined,
  },

  // ===== VERBOUWING =====
  // Aannemer/klusmateriaal: renovationType
  {
    taskIdPatterns: ["aannemer", "klus", "verbouw", "materiaal"],
    titlePatterns: ["aannemer", "klus", "verbouw", "materiaal", "gereedschap"],
    requiredQuestions: ["renovationType"],
    checkField: (info) => info.renovationType === undefined,
  },
  {
    taskIdPatterns: ["aannemer"],
    titlePatterns: ["aannemer"],
    requiredQuestions: ["needsContractor"],
    checkField: (info) => info.renovationType !== undefined && info.renovationType !== "none" && info.needsContractorHelp === undefined,
  },

  // ===== TUIN =====
  // Tuinmateriaal/tuingereedschap: hasGarden
  {
    taskIdPatterns: ["tuin", "garden"],
    titlePatterns: ["tuin", "tuingereedschap", "tuinmateriaal", "gazon"],
    requiredQuestions: ["hasGarden"],
    checkField: (info) => info.hasGarden === undefined,
  },

  // ===== KINDEREN =====
  // School/kinderopvang: childrenCount
  {
    taskIdPatterns: ["school", "kinderopvang", "onderwijs"],
    titlePatterns: ["school", "kinderopvang", "onderwijs", "basisschool", "middelbaar"],
    requiredQuestions: ["hasChildren"],
    checkField: (info) => info.children === undefined,
  },

  // ===== HUISDIEREN =====
  // Dierenarts: petsCount
  {
    taskIdPatterns: ["dierenarts", "huisdier", "pet"],
    titlePatterns: ["dierenarts", "huisdier", "hond", "kat", "chippen"],
    requiredQuestions: ["hasPets"],
    checkField: (info) => info.pets === undefined,
  },

  // ===== WERK =====
  // Werkgever adreswijziging: jobStatus
  {
    taskIdPatterns: ["werkgever"],
    titlePatterns: ["werkgever", "werk informeren", "salarisadministratie"],
    requiredQuestions: ["hasJob"],
    checkField: (info) => info.hasJob === undefined,
  },
];

// Bepaal welke vraag nodig is voor een taak
export const getSmartQuestionForTask = (
  taskId: string,
  taskTitle: string,
  movingInfo: MovingInfo & Record<string, any>
): SmartQuestionType | null => {
  const titleLower = taskTitle.toLowerCase();
  const idLower = taskId.toLowerCase();

  for (const trigger of taskQuestionTriggers) {
    // Check of task ID of titel matched
    const idMatch = trigger.taskIdPatterns.some((p) => idLower.includes(p));
    const titleMatch = trigger.titlePatterns.some((p) => titleLower.includes(p));

    if ((idMatch || titleMatch) && trigger.checkField(movingInfo)) {
      // Return eerste vraag die nog niet beantwoord is
      for (const questionType of trigger.requiredQuestions) {
        const question = smartQuestions[questionType];
        const fieldKey = question.fieldKey;
        
        // Check of het veld al ingevuld is
        const value = movingInfo[fieldKey as keyof MovingInfo];
        if (value === undefined || value === null || value === "") {
          return questionType;
        }
      }
    }
  }

  return null;
};

// Dynamisch taken filteren op basis van profiel en huur/koop
export const shouldShowTask = (
  taskId: string,
  taskTitle: string,
  movingInfo: MovingInfo & Record<string, any>
): boolean => {
  const titleLower = taskTitle.toLowerCase();
  const idLower = taskId.toLowerCase();
  const isKoop = movingInfo.type === "buy";
  const isHuur = movingInfo.type === "rent";

  // ===== HUUR VS KOOP REGELS =====
  // Alleen KOOP: opstalverzekering, notaris, hypotheek, bouwkundige keuring, overdracht
  const koopOnlyPatterns = ["opstal", "notaris", "hypotheek", "bouwkundig", "overdracht", "taxatie", "koopakte", "eigenaar"];
  if (koopOnlyPatterns.some(p => idLower.includes(p) || titleLower.includes(p)) && isHuur) {
    return false;
  }

  // Alleen HUUR: huurovereenkomst, opzegtermijn, huurbescherming, verhuurder
  const huurOnlyPatterns = ["huurovereenkomst", "opzegtermijn", "huurbescherming", "verhuurder", "huurcontract", "opzeggen"];
  if (huurOnlyPatterns.some(p => idLower.includes(p) || titleLower.includes(p)) && isKoop) {
    return false;
  }

  // ===== DYNAMISCHE FILTERING OP BASIS VAN PROFIEL =====
  
  // Tuin taken verbergen als geen tuin
  if ((idLower.includes("tuin") || idLower.includes("garden") || titleLower.includes("tuin")) && 
      movingInfo.hasGarden === false) {
    return false;
  }

  // Kinderen taken verbergen als geen kinderen
  if ((idLower.includes("school") || idLower.includes("kinderopvang") || 
       titleLower.includes("school") || titleLower.includes("kinderopvang")) && 
      movingInfo.children === 0) {
    return false;
  }

  // Huisdieren taken verbergen als geen huisdieren
  if ((idLower.includes("dierenarts") || idLower.includes("huisdier") || 
       titleLower.includes("dierenarts") || titleLower.includes("huisdier")) && 
      movingInfo.pets === 0) {
    return false;
  }

  // Werkgever taken verbergen als geen baan
  if ((idLower.includes("werkgever") || titleLower.includes("werkgever")) && 
      movingInfo.hasJob === false) {
    return false;
  }

  // Verbouwing taken verbergen als geen verbouwing
  if ((idLower.includes("verbouw") || idLower.includes("aannemer") || idLower.includes("renovatie") ||
       titleLower.includes("verbouw") || titleLower.includes("aannemer")) && 
      movingInfo.renovationType === "none") {
    return false;
  }

  // Klusmateriaal verbergen als geen verbouwing of aannemer ingehuurd
  if ((idLower.includes("klus") || idLower.includes("gereedschap") || titleLower.includes("klus")) && 
      (movingInfo.renovationType === "none" || movingInfo.needsContractorHelp === true)) {
    return false;
  }

  // Gas taken verbergen als all-electric (behalve bankgarantie)
  if ((titleLower.includes("gas") && !titleLower.includes("bankgarantie") && !idLower.includes("bankgarantie")) && 
      movingInfo.hasGas === "no") {
    return false;
  }

  // VvE taken verbergen als geen appartement
  if ((idLower.includes("vve") || titleLower.includes("vve")) && 
      movingInfo.propertyType !== "apartment") {
    return false;
  }

  // Parkeervergunning verbergen als niet nodig
  if ((idLower.includes("parkeervergunning") || titleLower.includes("parkeervergunning")) && 
      movingInfo.hasParking === false) {
    return false;
  }

  return true;
};
