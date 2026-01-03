import { MovingInfo } from "@/pages/Index";
import {
  Home,
  Zap,
  Wifi,
  Shield,
  FileText,
  Truck,
  Mail,
  Package,
  Key,
  Trash2,
  Users,
  MapPin,
  Euro,
  ClipboardCheck,
  Sparkles,
  Hammer,
  PaintBucket,
} from "lucide-react";

export type Task = {
  id: string;
  title: string;
  category: string;
  description: string;
  deadline: Date;
  deadlineLabel: string;
  phase: string;
  status: "todo" | "in_progress" | "done";
  icon: React.ReactNode;
  priority: number;
  assignedTo?: string | null;
  assignedToEmail?: string | null;
  notes?: string | null;
  affiliateLink?: string;
  hasDocumentLink?: boolean; // Voor taken die naar documenten-tab moeten linken
};

export type HouseholdInfo = {
  children: number;
  pets: number;
  propertyType?: "apartment" | "house" | "studio";
  hasGarden?: boolean;
  hasParking?: boolean;
  isVve?: boolean;
  hasJob?: boolean;
};

// Helper functie voor dynamische deadline labels
const getDeadlineLabel = (deadline: Date, movingDate: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilMove = Math.ceil((movingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const weeksBeforeMove = Math.ceil((movingDate.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Na verhuizing
  if (deadline > movingDate) {
    const daysAfterMove = Math.ceil((deadline.getTime() - movingDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAfterMove <= 1) return "dag na verhuizing";
    if (daysAfterMove <= 7) return "eerste week na verhuizing";
    if (daysAfterMove <= 14) return "2 weken na verhuizing";
    return `${Math.ceil(daysAfterMove / 7)} weken na verhuizing`;
  }
  
  // Verhuisdag zelf
  if (daysUntilDeadline === daysUntilMove && daysUntilDeadline >= 0) {
    return "op verhuisdag";
  }
  
  // Voor verhuizing
  if (daysUntilDeadline <= 0) return "vandaag doen";
  if (daysUntilDeadline <= 2) return "deze week doen";
  if (daysUntilDeadline <= 7) return "deze week doen";
  if (weeksBeforeMove <= 1) return "over 1 week doen";
  if (weeksBeforeMove <= 2) return "over 2 weken doen";
  if (weeksBeforeMove <= 3) return "over 3 weken doen";
  return `over ${weeksBeforeMove} weken doen`;
};

export const generateTasksForRenter = (movingInfo: MovingInfo, householdInfo?: HouseholdInfo): Task[] => {
  const movingDate = new Date(movingInfo.movingDate);
  const keyHandoverDate = movingInfo.keyHandoverDate 
    ? new Date(movingInfo.keyHandoverDate) 
    : new Date(movingDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  const adjustDeadline = (originalDeadline: Date, urgencyLevel: 'urgent' | 'normal' | 'later') => {
    if (originalDeadline >= today) {
      return originalDeadline;
    }
    
    switch (urgencyLevel) {
      case 'urgent':
        return addDays(today, 2);
      case 'normal':
        return addDays(today, 5);
      case 'later':
        return addDays(today, 7);
      default:
        return addDays(today, 3);
    }
  };
  
  // Helper om deadline met dynamisch label te maken
  const createDeadline = (daysFromMove: number, urgency: 'urgent' | 'normal' | 'later' = 'normal') => {
    const deadline = adjustDeadline(addDays(movingDate, daysFromMove), urgency);
    return {
      deadline,
      deadlineLabel: getDeadlineLabel(deadline, movingDate)
    };
  };

  const tasks: Task[] = [];

  // =====================================================
  // TAAK 0 — Mede-verhuizers uitnodigen (altijd eerste taak)
  // =====================================================
  const inviteDeadline = createDeadline(-28, 'urgent');
  
  tasks.push({
    id: "invite-household-members",
    title: "Mede-verhuizers uitnodigen",
    category: "Samenwerken",
    description: "Nodig mede-verhuizers uit om samen de verhuizing te regelen. Zo kunnen jullie taken verdelen en chatten.",
    ...inviteDeadline,
    phase: "Fase 1 - Je nieuwe thuis is bevestigd",
    status: "todo",
    icon: <Users className="w-4 h-4" />,
    priority: 0, // Highest priority to appear first
  });

  // =====================================================
  // FASE 1 — Even landen (4-3 weken voor verhuizing)
  // =====================================================
  const fase1Deadline = createDeadline(-28, 'urgent');
  const fase1LaterDeadline = createDeadline(-24, 'normal');
  
  tasks.push(
    {
      id: "rent-fase1-check-huurcontract",
      title: "Check je huidige huurcontract",
      category: "Administratie",
      description: "Bekijk je huidige huurcontract en check de opzegtermijn. Lua berekent automatisch wanneer je uiterlijk moet opzeggen.",
      ...fase1Deadline,
      phase: "Even landen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "rent-fase1-bevestig-nieuwe-woning",
      title: "Nieuwe huurwoning bevestigen",
      category: "Administratie",
      description: "Teken het huurcontract en betaal de borg. Upload je documenten zodat je ze altijd bij de hand hebt.",
      ...fase1Deadline,
      phase: "Even landen",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "rent-fase1-inventariseer-spullen",
      title: "Inventariseer je spullen",
      category: "Huishouden",
      description: "Maak een overzicht van wat je meeneemt, verkoopt of weggeeft. Zo weet je hoeveel dozen je nodig hebt.",
      ...fase1LaterDeadline,
      phase: "Even landen",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    }
  );

  // =====================================================
  // FASE 2 — Slim vooruit regelen (3 weken voor verhuizing)
  // =====================================================
  const fase2Deadline = createDeadline(-21, 'urgent');
  const fase2NormalDeadline = createDeadline(-21, 'normal');
  
  tasks.push(
    {
      id: "rent-fase2-verhuisbedrijf",
      title: "Verhuisbedrijf of helpers regelen",
      category: "Verhuizing",
      description: "Boek een verhuisbedrijf of organiseer vrienden en familie om te helpen.",
      ...fase2Deadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.verhuisofferte.nl/",
    },
    {
      id: "rent-fase2-energie",
      title: "Energie voor je nieuwe adres regelen",
      category: "Nutsvoorzieningen",
      description: "Vergelijk energieleveranciers en sluit een contract af voor je nieuwe adres.",
      ...fase2Deadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/energie/intro.aspx",
    },
    {
      id: "rent-fase2-internet",
      title: "Internet voor je nieuwe adres regelen",
      category: "Nutsvoorzieningen",
      description: "Regel je internetaansluiting op tijd, dit kan soms een paar weken duren.",
      ...fase2Deadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Wifi className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/internet/intro.aspx",
    },
    {
      id: "rent-fase2-verhuisdozen",
      title: "Verhuisdozen & verpakkingsmateriaal bestellen",
      category: "Verhuizing",
      description: "Bestel voldoende dozen, tape, bubbelfolie en markers.",
      ...fase2NormalDeadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuisdozen.nl/",
    }
  );

  // =====================================================
  // FASE 3 — Papier & zekerheid (2 weken voor verhuizing)
  // =====================================================
  const fase3Deadline = createDeadline(-14, 'urgent');
  const fase3NormalDeadline = createDeadline(-14, 'normal');
  
  tasks.push(
    {
      id: "rent-fase3-huur-opzeggen",
      title: "Huidige huur officieel opzeggen",
      category: "Administratie",
      description: "Stuur een opzegbrief naar je huidige verhuurder. Hiermee voorkom je gedoe later.",
      ...fase3Deadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "rent-fase3-inboedelverzekering",
      title: "Inboedelverzekering regelen",
      category: "Financieel",
      description: "Sluit een inboedelverzekering af voor je nieuwe woning of pas je huidige aan.",
      ...fase3NormalDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/inboedelverzekering/intro.aspx",
    },
    {
      id: "rent-fase3-aansprakelijkheid",
      title: "Aansprakelijkheidsverzekering checken",
      category: "Financieel",
      description: "Controleer of je aansprakelijkheidsverzekering nog actueel is, of sluit er een af.",
      ...fase3NormalDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/aansprakelijkheidsverzekering/intro.aspx",
    }
  );

  // =====================================================
  // FASE 4 — De praktische puzzel (2-1 weken voor verhuizing)
  // =====================================================
  const fase4Deadline = createDeadline(-10, 'urgent');
  const fase4NormalDeadline = createDeadline(-10, 'normal');
  const fase4LaterDeadline = createDeadline(-7, 'normal');
  
  tasks.push(
    {
      id: "rent-fase4-gemeente",
      title: "Adreswijziging doorgeven aan gemeente",
      category: "Administratie",
      description: "Geef je nieuwe adres door aan de gemeente. Dit is verplicht binnen 5 dagen na verhuizing.",
      ...fase4Deadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 1,
      // Geen affiliate - doorlinken naar gemeente op basis van postcode
    },
    {
      id: "rent-fase4-postnl",
      title: "Post doorsturen aanvragen",
      category: "Administratie",
      description: "Vraag PostNL doorstuurservice aan zodat je geen belangrijke post mist.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://doorzenden.postnl.nl/van-naar#/van-naar",
    },
    {
      id: "rent-fase4-parkeervergunning",
      title: "Parkeervergunning aanvragen",
      category: "Administratie",
      description: "Check of je een parkeervergunning nodig hebt op je nieuwe adres en vraag deze op tijd aan.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - gemeente-specifiek
    },
    {
      id: "rent-fase4-verhuislift",
      title: "Verhuislift regelen",
      category: "Verhuizing",
      description: "Woon je hoog zonder lift? Een verhuislift maakt het verhuizen veel makkelijker.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuislift-huren.nl/",
    },
    {
      id: "rent-fase4-huisarts",
      title: "Huisarts, tandarts en apotheek informeren",
      category: "Administratie",
      description: "Meld je adreswijziging bij je zorgverleners.",
      ...fase4LaterDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-fase4-afvalinzameling",
      title: "Afvalinzameling nieuw adres checken",
      category: "Administratie",
      description: "Check wanneer welk afval wordt opgehaald en vraag eventueel een afvalpas aan.",
      ...fase4LaterDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Trash2 className="w-4 h-4" />,
      priority: 3,
    }
  );

  // Werkgever taken (alleen als iemand een baan heeft)
  if (householdInfo?.hasJob !== false) {
    tasks.push({
      id: "rent-fase4-werkgever",
      title: "Werkgever informeren over verhuizing",
      category: "Administratie",
      description: "Meld je nieuwe adres bij je werkgever en vraag eventueel verhuisverlof aan.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - sociale melding
    });
  }

  // School/kinderopvang (alleen als er kinderen zijn)
  if (householdInfo && householdInfo.children > 0) {
    tasks.push({
      id: "rent-fase4-school",
      title: "School of kinderopvang informeren",
      category: "Sociaal",
      description: "Meld je adreswijziging bij school en/of kinderopvang.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - sociale melding
    });
  }

  // Huisdieren (alleen als er huisdieren zijn)
  if (householdInfo && householdInfo.pets > 0) {
    tasks.push({
      id: "rent-fase4-dierenarts",
      title: "Dierenarts informeren over verhuizing",
      category: "Administratie",
      description: "Meld je nieuwe adres bij de dierenarts.",
      ...fase4LaterDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 3,
      // Geen affiliate - sociale melding
    });
  }

  // =====================================================
  // FASE 5 — Bijna daar (1 week voor verhuizing)
  // =====================================================
  const keyDeadline = {
    deadline: keyHandoverDate,
    deadlineLabel: getDeadlineLabel(keyHandoverDate, movingDate)
  };
  const fase5Deadline = createDeadline(-5, 'normal');
  const fase5UrgentDeadline = createDeadline(-3, 'urgent');
  
  tasks.push(
    {
      id: "rent-fase5-inspectie",
      title: "Nieuwe woning inspecteren en foto's maken",
      category: "Huishouden",
      description: "Controleer de staat van je nieuwe woning en maak foto's voor je dossier.",
      ...keyDeadline,
      phase: "Bijna daar",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "rent-fase5-schoonmaak",
      title: "Schoonmaak plannen",
      category: "Schoonmaak",
      description: "Plan schoonmaak voor je oude of nieuwe woning, of doe het zelf.",
      ...fase5Deadline,
      phase: "Bijna daar",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.zoofy.nl/schoonmaak",
    },
    {
      id: "rent-fase5-bevestig-verhuizers",
      title: "Verhuisbedrijf of helpers bevestigen",
      category: "Verhuizing",
      description: "Bevestig de afspraak met je verhuisbedrijf of helpers. Een appje of belletje is genoeg!",
      ...fase5UrgentDeadline,
      phase: "Bijna daar",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
      // Geen affiliate - bevestiging van eerdere boeking
    }
  );

  // =====================================================
  // FASE 6 — Verhuisdag
  // =====================================================
  const moveDayDeadline = {
    deadline: movingDate,
    deadlineLabel: getDeadlineLabel(movingDate, movingDate)
  };
  
  tasks.push(
    {
      id: "rent-fase6-meterstanden",
      title: "Meterstanden vastleggen",
      category: "Nutsvoorzieningen",
      description: "Maak foto's van de meterstanden voor gas, water en elektra.",
      ...moveDayDeadline,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "rent-fase6-oplevering-oude-woning",
      title: "Oplevering oude woning",
      category: "Administratie",
      description: "Lever de sleutels in bij je oude verhuurder en maak foto's van de oplevering.",
      ...moveDayDeadline,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "rent-fase6-belangrijke-spullen",
      title: "Belangrijke spullen apart houden",
      category: "Verhuizing",
      description: "Houd sleutels, paspoorten, opladers en medicijnen bij de hand — niet in de verhuisdozen!",
      ...moveDayDeadline,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase6-verhuizing-uitvoeren",
      title: "Verhuizing uitvoeren",
      category: "Verhuizing",
      description: "De grote dag is daar! Neem de tijd, houd overzicht en vergeet niet te genieten. 🎉",
      ...moveDayDeadline,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
    }
  );

  // =====================================================
  // FASE 7 — Welkom thuis (1 week na verhuizing)
  // =====================================================
  const postMove1Day = {
    deadline: addDays(movingDate, 1),
    deadlineLabel: getDeadlineLabel(addDays(movingDate, 1), movingDate)
  };
  const postMove1Week = {
    deadline: addDays(movingDate, 7),
    deadlineLabel: getDeadlineLabel(addDays(movingDate, 7), movingDate)
  };
  
  const postMove2Weeks = {
    deadline: addDays(movingDate, 14),
    deadlineLabel: getDeadlineLabel(addDays(movingDate, 14), movingDate)
  };

  tasks.push(
    {
      id: "rent-fase7-check-voorzieningen",
      title: "Controleren of alles werkt",
      category: "Nutsvoorzieningen",
      description: "Test of energie, water en internet goed werken in je nieuwe woning.",
      ...postMove1Day,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase7-dozen-uitpakken",
      title: "Dozen uitpakken & organiseren",
      category: "Huishouden",
      description: "Pak je spullen uit en geef alles een plek. Begin met de belangrijkste kamers.",
      ...postMove1Day,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.ikea.com/nl/nl/cat/opbergers-702/",
    },
    {
      id: "rent-fase7-instanties",
      title: "Verhuizing doorgeven bij overige instanties",
      category: "Administratie",
      description: "Update je adres bij bank, verzekeraars en abonnementen.",
      ...postMove1Week,
      phase: "Welkom thuis",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-fase7-buren-ontmoeten",
      title: "Kennismaken met je buren",
      category: "Sociaal",
      description: "Stel jezelf voor bij de buren. Een goede start in de buurt is altijd fijn!",
      ...postMove1Week,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-fase7-feedback-verhuizers",
      title: "Feedback geven op verhuisbedrijf",
      category: "Verhuizing",
      description: "Geregeld via Lua? Laat een review achter voor het verhuisbedrijf.",
      ...postMove1Week,
      phase: "Welkom thuis",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-fase7-gemeentelijke-belastingen",
      title: "Gemeentelijke belastingen checken",
      category: "Financieel",
      description: "Check welke gemeentelijke belastingen je kunt verwachten op je nieuwe adres.",
      ...postMove2Weeks,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 3,
    }
  );

  // =====================================================
  // CONDITIONELE TAKEN
  // =====================================================

  // VvE taken (alleen voor appartementen met VvE)
  if (householdInfo?.propertyType === "apartment" && householdInfo?.isVve) {
    tasks.push({
      id: "rent-vve-melden",
      title: "Verhuizing melden bij VvE",
      category: "Administratie",
      description: "Informeer de VvE over je verhuizing en vraag het huisreglement op.",
      ...fase3NormalDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - wettelijke melding
    });
  }

  // Verbouwing taken
  if (movingInfo.renovationType && movingInfo.renovationType !== "none") {
    if (movingInfo.renovationType === "small") {
      tasks.push(
        {
          id: "reno-small-materiaal",
          title: "Materiaal inkopen voor klussen",
          category: "Verbouwing",
          description: "Koop verf, kwasten, afplaktape en ander materiaal.",
          ...fase3NormalDeadline,
          phase: "Papier & zekerheid",
          status: "todo",
          icon: <Package className="w-4 h-4" />,
          priority: 2,
          affiliateLink: "https://www.praxis.nl/",
        }
      );
    }

    if (movingInfo.renovationType === "large") {
      if (movingInfo.needsContractorHelp) {
        tasks.push({
          id: "reno-large-aannemer",
          title: "Aannemer selecteren",
          category: "Verbouwing",
          description: "Vraag offertes aan bij minimaal 3 aannemers en kies de beste optie.",
          ...fase2Deadline,
          phase: "Slim vooruit regelen",
          status: "todo",
          icon: <Users className="w-4 h-4" />,
          priority: 1,
          affiliateLink: "https://www.werkspot.nl/",
        });
      } else {
        tasks.push({
          id: "reno-large-diy-materiaal",
          title: "Materialen voor verbouwing inkopen",
          category: "Verbouwing",
          description: "Koop alle benodigde materialen voor de verbouwing.",
          ...fase3NormalDeadline,
          phase: "Papier & zekerheid",
          status: "todo",
          icon: <Package className="w-4 h-4" />,
          priority: 1,
          affiliateLink: "https://www.praxis.nl/",
        });
      }
    }
  }

  return tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
};

export const generateTasksForBuyer = (movingInfo: MovingInfo, householdInfo?: HouseholdInfo): Task[] => {
  const movingDate = new Date(movingInfo.movingDate);
  const keyHandoverDate = movingInfo.keyHandoverDate 
    ? new Date(movingInfo.keyHandoverDate) 
    : new Date(movingDate.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  const adjustDeadline = (originalDeadline: Date, urgencyLevel: 'urgent' | 'normal' | 'later') => {
    if (originalDeadline >= today) {
      return originalDeadline;
    }
    
    switch (urgencyLevel) {
      case 'urgent':
        return addDays(today, 2);
      case 'normal':
        return addDays(today, 5);
      case 'later':
        return addDays(today, 7);
      default:
        return addDays(today, 3);
    }
  };
  
  // Helper om deadline met dynamisch label te maken
  const createDeadline = (daysFromMove: number, urgency: 'urgent' | 'normal' | 'later' = 'normal') => {
    const deadline = adjustDeadline(addDays(movingDate, daysFromMove), urgency);
    return {
      deadline,
      deadlineLabel: getDeadlineLabel(deadline, movingDate)
    };
  };

  const tasks: Task[] = [];

  // =====================================================
  // TAAK 0 — Mede-verhuizers uitnodigen (altijd eerste taak)
  // =====================================================
  const inviteDeadline = createDeadline(-28, 'urgent');
  
  tasks.push({
    id: "invite-household-members",
    title: "Mede-verhuizers uitnodigen",
    category: "Samenwerken",
    description: "Nodig mede-verhuizers uit om samen de verhuizing te regelen. Zo kunnen jullie taken verdelen en chatten.",
    ...inviteDeadline,
    phase: "Fase 1 - Je nieuwe thuis is bevestigd",
    status: "todo",
    icon: <Users className="w-4 h-4" />,
    priority: 0, // Highest priority to appear first
  });

  // =====================================================
  // FASE 1 — Even landen (4-3 weken voor verhuizing)
  // KOOP-SPECIFIEK: Koopcontract, hypotheek, bouwkundige keuring
  // =====================================================
  const fase1Deadline = createDeadline(-28, 'urgent');
  const fase1NormalDeadline = createDeadline(-25, 'normal');
  const fase1LaterDeadline = createDeadline(-24, 'normal');
  
  tasks.push(
    {
      id: "buy-fase1-koopcontract",
      title: "Voorlopig koopcontract tekenen",
      category: "Administratie",
      description: "Onderteken het voorlopig koopcontract. Vanaf nu gaat de bedenktijd in.",
      ...fase1Deadline,
      phase: "Even landen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "buy-fase1-roerende-zaken",
      title: "Roerende zaken doornemen",
      category: "Administratie",
      description: "Wat blijft achter en wat neem je over? Denk aan gordijnen, lampen en inbouwapparatuur.",
      ...fase1Deadline,
      phase: "Even landen",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-fase1-hypotheekadviseur",
      title: "Hypotheekadviseur kiezen en hypotheek aanvragen",
      category: "Financieel",
      description: "Selecteer een hypotheekadviseur en start de aanvraag. Dit is een van de belangrijkste stappen!",
      ...fase1Deadline,
      phase: "Even landen",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/hypotheek/intro.aspx",
    },
    {
      id: "buy-fase1-bouwkundige-keuring",
      title: "Bouwkundige keuring laten uitvoeren",
      category: "Administratie",
      description: "Laat een bouwkundige keuring uitvoeren zodat je weet waar je aan toe bent.",
      ...fase1NormalDeadline,
      phase: "Even landen",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.bouwkundigekeuring.com/",
      hasDocumentLink: true,
    },
    {
      id: "buy-fase1-inventariseer-spullen",
      title: "Inventariseer je spullen",
      category: "Huishouden",
      description: "Maak een overzicht van wat je meeneemt, verkoopt of weggeeft. Zo weet je hoeveel dozen je nodig hebt.",
      ...fase1LaterDeadline,
      phase: "Even landen",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    }
  );

  // =====================================================
  // FASE 2 — Slim vooruit regelen (3 weken voor verhuizing)
  // GEDEELDE TAKEN
  // =====================================================
  const fase2Deadline = createDeadline(-21, 'urgent');
  const fase2NormalDeadline = createDeadline(-21, 'normal');
  
  tasks.push(
    {
      id: "buy-fase2-verhuisbedrijf",
      title: "Verhuisbedrijf of helpers regelen",
      category: "Verhuizing",
      description: "Boek een verhuisbedrijf of organiseer vrienden en familie om te helpen.",
      ...fase2Deadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.verhuisofferte.nl/",
    },
    {
      id: "buy-fase2-energie",
      title: "Energie voor je nieuwe adres regelen",
      category: "Nutsvoorzieningen",
      description: "Vergelijk energieleveranciers en sluit een contract af voor je nieuwe adres.",
      ...fase2Deadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/energie/intro.aspx",
    },
    {
      id: "buy-fase2-internet",
      title: "Internet voor je nieuwe adres regelen",
      category: "Nutsvoorzieningen",
      description: "Regel je internetaansluiting op tijd, dit kan soms een paar weken duren.",
      ...fase2Deadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Wifi className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/internet/intro.aspx",
    },
    {
      id: "buy-fase2-verhuisdozen",
      title: "Verhuisdozen & verpakkingsmateriaal bestellen",
      category: "Verhuizing",
      description: "Bestel voldoende dozen, tape, bubbelfolie en markers.",
      ...fase2NormalDeadline,
      phase: "Slim vooruit regelen",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuisdozen.nl/",
    }
  );

  // =====================================================
  // FASE 3 — Papier & zekerheid (2-3 weken voor verhuizing)
  // KOOP-SPECIFIEK: Notaris, taxatie, waarborgsom, opstal
  // =====================================================
  const fase3EarlyDeadline = createDeadline(-21, 'normal');
  const fase3Deadline = createDeadline(-18, 'urgent');
  const fase3NormalDeadline = createDeadline(-14, 'normal');
  const fase3LateDeadline = createDeadline(-10, 'urgent');
  
  tasks.push(
    {
      id: "buy-fase3-notaris",
      title: "Notaris kiezen",
      category: "Administratie",
      description: "Kies een notaris voor de levering van je nieuwe woning.",
      ...fase3EarlyDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.degoedkoopstenotaris.nl/",
    },
    {
      id: "buy-fase3-hypotheekdocs",
      title: "Hypotheekdocumenten uploaden",
      category: "Administratie",
      description: "Upload loonstroken, ID-bewijzen en andere benodigde documenten.",
      ...fase3Deadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "buy-fase3-waarborgsom",
      title: "Waarborgsom of bankgarantie regelen",
      category: "Financieel",
      description: "Regel de waarborgsom of bankgarantie zoals afgesproken in het contract.",
      ...fase3Deadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 1,
      // Geen affiliate - financiële verplichting
    },
    {
      id: "buy-fase3-taxatie",
      title: "Taxatie laten uitvoeren",
      category: "Administratie",
      description: "Plan een taxatie van de woning in voor de hypotheekverstrekker.",
      ...fase3Deadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.taxatiewijzer.nl/",
      hasDocumentLink: true,
    },
    {
      id: "buy-fase3-opstal",
      title: "Opstalverzekering afsluiten",
      category: "Financieel",
      description: "Sluit een opstalverzekering af. Dit is verplicht bij een hypotheek.",
      ...fase3NormalDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/woonverzekering/intro.aspx",
    },
    {
      id: "buy-fase3-inboedelverzekering",
      title: "Inboedelverzekering regelen",
      category: "Financieel",
      description: "Sluit een inboedelverzekering af voor je nieuwe woning of pas je huidige aan.",
      ...fase3NormalDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/inboedelverzekering/intro.aspx",
    },
    {
      id: "buy-fase3-aansprakelijkheid",
      title: "Aansprakelijkheidsverzekering checken",
      category: "Financieel",
      description: "Controleer of je aansprakelijkheidsverzekering nog actueel is, of sluit er een af.",
      ...fase3NormalDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/aansprakelijkheidsverzekering/intro.aspx",
    },
    {
      id: "buy-fase3-conceptaktes",
      title: "Conceptaktes van notaris doornemen",
      category: "Administratie",
      description: "Geen paniek, dit is standaard. Lees de leveringsakte en hypotheekakte door.",
      ...fase3LateDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    }
  );

  // VvE documenten (alleen bij appartement)
  if (householdInfo?.propertyType === "apartment" && householdInfo?.isVve) {
    tasks.push({
      id: "buy-fase3-vve-docs",
      title: "VvE-documenten opvragen en bekijken",
      category: "Administratie",
      description: "Vraag notulen, jaarrekening en meerjarenplan op. Zo weet je waar je aan toe bent.",
      ...fase3NormalDeadline,
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
      hasDocumentLink: true,
      // Geen affiliate - wettelijke verplichting
    });
  }

  // =====================================================
  // FASE 4 — De praktische puzzel (2-1 weken voor verhuizing)
  // GEDEELDE TAKEN
  // =====================================================
  const fase4Deadline = createDeadline(-10, 'urgent');
  const fase4NormalDeadline = createDeadline(-10, 'normal');
  const fase4LaterDeadline = createDeadline(-7, 'normal');
  
  tasks.push(
    {
      id: "buy-fase4-gemeente",
      title: "Adreswijziging doorgeven aan gemeente",
      category: "Administratie",
      description: "Geef je nieuwe adres door aan de gemeente. Dit is verplicht binnen 5 dagen na verhuizing.",
      ...fase4Deadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 1,
      // Geen affiliate - doorlinken naar gemeente op basis van postcode
    },
    {
      id: "buy-fase4-postnl",
      title: "Post doorsturen aanvragen",
      category: "Administratie",
      description: "Vraag PostNL doorstuurservice aan zodat je geen belangrijke post mist.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://doorzenden.postnl.nl/van-naar#/van-naar",
    },
    {
      id: "buy-fase4-parkeervergunning",
      title: "Parkeervergunning aanvragen",
      category: "Administratie",
      description: "Check of je een parkeervergunning nodig hebt op je nieuwe adres en vraag deze op tijd aan.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - gemeente-specifiek
    },
    {
      id: "buy-fase4-verhuislift",
      title: "Verhuislift regelen",
      category: "Verhuizing",
      description: "Woon je hoog zonder lift? Een verhuislift maakt het verhuizen veel makkelijker.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuislift-huren.nl/",
    },
    {
      id: "buy-fase4-huisarts",
      title: "Huisarts, tandarts en apotheek informeren",
      category: "Administratie",
      description: "Meld je adreswijziging bij je zorgverleners.",
      ...fase4LaterDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-fase4-afvalinzameling",
      title: "Afvalinzameling nieuw adres checken",
      category: "Administratie",
      description: "Check wanneer welk afval wordt opgehaald en vraag eventueel een afvalpas aan.",
      ...fase4LaterDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Trash2 className="w-4 h-4" />,
      priority: 3,
    }
  );

  // Werkgever taken (alleen als iemand een baan heeft)
  if (householdInfo?.hasJob !== false) {
    tasks.push({
      id: "buy-fase4-werkgever",
      title: "Werkgever informeren over verhuizing",
      category: "Administratie",
      description: "Meld je nieuwe adres bij je werkgever en vraag eventueel verhuisverlof aan.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - sociale melding
    });
  }

  // School/kinderopvang (alleen als er kinderen zijn)
  if (householdInfo && householdInfo.children > 0) {
    tasks.push({
      id: "buy-fase4-school",
      title: "School of kinderopvang informeren",
      category: "Sociaal",
      description: "Meld je adreswijziging bij school en/of kinderopvang.",
      ...fase4NormalDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - sociale melding
    });
  }

  // Huisdieren (alleen als er huisdieren zijn)
  if (householdInfo && householdInfo.pets > 0) {
    tasks.push({
      id: "buy-fase4-dierenarts",
      title: "Dierenarts informeren over verhuizing",
      category: "Administratie",
      description: "Meld je nieuwe adres bij de dierenarts.",
      ...fase4LaterDeadline,
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 3,
      // Geen affiliate - sociale melding
    });
  }

  // =====================================================
  // FASE 5 — Bijna daar (1 week voor verhuizing)
  // KOOP-SPECIFIEK: Notaris passeren, slotcilinders, rookmelders
  // =====================================================
  const keyDeadline = {
    deadline: keyHandoverDate,
    deadlineLabel: getDeadlineLabel(keyHandoverDate, movingDate)
  };
  const fase5Deadline = createDeadline(-5, 'normal');
  const fase5UrgentDeadline = createDeadline(-3, 'urgent');
  
  tasks.push(
    {
      id: "buy-fase5-notaris-levering",
      title: "Notaris: levering van de woning",
      category: "Administratie",
      description: "Dit is het officiële overdrachtsmoment. Gefeliciteerd, je wordt eigenaar!",
      ...keyDeadline,
      phase: "Bijna daar",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "buy-fase5-inspectie",
      title: "Nieuwe woning inspecteren en foto's maken",
      category: "Huishouden",
      description: "Controleer de staat van je nieuwe woning en maak foto's voor je dossier.",
      ...keyDeadline,
      phase: "Bijna daar",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "buy-fase5-rookmelders",
      title: "Rookmelders checken (verplicht)",
      category: "Veiligheid",
      description: "Controleer of alle rookmelders aanwezig en werkend zijn. Dit is verplicht!",
      deadline: addDays(keyHandoverDate, 1),
      deadlineLabel: getDeadlineLabel(addDays(keyHandoverDate, 1), movingDate),
      phase: "Bijna daar",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=rookmelder",
    },
    {
      id: "buy-fase5-slotcilinders",
      title: "Slotcilinders vervangen",
      category: "Veiligheid",
      description: "Dan weet je zeker dat jij de enige bent met een sleutel.",
      deadline: addDays(keyHandoverDate, 2),
      deadlineLabel: getDeadlineLabel(addDays(keyHandoverDate, 2), movingDate),
      phase: "Bijna daar",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=slotcilinder",
    },
    {
      id: "buy-fase5-schoonmaak",
      title: "Schoonmaak plannen",
      category: "Schoonmaak",
      description: "Plan schoonmaak voor je oude of nieuwe woning, of doe het zelf.",
      ...fase5Deadline,
      phase: "Bijna daar",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.zoofy.nl/schoonmaak",
    },
    {
      id: "buy-fase5-bevestig-verhuizers",
      title: "Verhuisbedrijf of helpers bevestigen",
      category: "Verhuizing",
      description: "Bevestig de afspraak met je verhuisbedrijf of helpers. Een appje of belletje is genoeg!",
      ...fase5UrgentDeadline,
      phase: "Bijna daar",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
      // Geen affiliate - bevestiging van eerdere boeking
    }
  );

  // =====================================================
  // FASE 6 — Verhuisdag
  // =====================================================
  const moveDayDeadline = {
    deadline: movingDate,
    deadlineLabel: getDeadlineLabel(movingDate, movingDate)
  };
  
  tasks.push(
    {
      id: "buy-fase6-meterstanden",
      title: "Meterstanden vastleggen",
      category: "Nutsvoorzieningen",
      description: "Maak foto's van de meterstanden voor gas, water en elektra.",
      ...moveDayDeadline,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
      hasDocumentLink: true,
    },
    {
      id: "buy-fase6-belangrijke-spullen",
      title: "Belangrijke spullen apart houden",
      category: "Verhuizing",
      description: "Houd sleutels, paspoorten, opladers en medicijnen bij de hand — niet in de verhuisdozen!",
      ...moveDayDeadline,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-fase6-verhuizing-uitvoeren",
      title: "Verhuizing uitvoeren",
      category: "Verhuizing",
      description: "De grote dag is daar! Neem de tijd, houd overzicht en vergeet niet te genieten. 🎉",
      ...moveDayDeadline,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
    }
  );

  // =====================================================
  // FASE 7 — Welkom thuis (1 week na verhuizing)
  // KOOP-SPECIFIEK: Maandlasten, hypotheekrenteaftrek
  // =====================================================
  const postMove1Day = {
    deadline: addDays(movingDate, 1),
    deadlineLabel: getDeadlineLabel(addDays(movingDate, 1), movingDate)
  };
  const postMove1Week = {
    deadline: addDays(movingDate, 7),
    deadlineLabel: getDeadlineLabel(addDays(movingDate, 7), movingDate)
  };
  const postMove2Weeks = {
    deadline: addDays(movingDate, 14),
    deadlineLabel: getDeadlineLabel(addDays(movingDate, 14), movingDate)
  };
  const postMove1Month = {
    deadline: addDays(movingDate, 30),
    deadlineLabel: getDeadlineLabel(addDays(movingDate, 30), movingDate)
  };
  
  tasks.push(
    {
      id: "buy-fase7-check-voorzieningen",
      title: "Controleren of alles werkt",
      category: "Nutsvoorzieningen",
      description: "Test of energie, water en internet goed werken in je nieuwe woning.",
      ...postMove1Day,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-fase7-dozen-uitpakken",
      title: "Dozen uitpakken & organiseren",
      category: "Huishouden",
      description: "Pak je spullen uit en geef alles een plek. Begin met de belangrijkste kamers.",
      ...postMove1Day,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.ikea.com/nl/nl/cat/opbergers-702/",
    },
    {
      id: "buy-fase7-instanties",
      title: "Verhuizing doorgeven bij overige instanties",
      category: "Administratie",
      description: "Update je adres bij bank, verzekeraars en abonnementen.",
      ...postMove1Week,
      phase: "Welkom thuis",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-fase7-buren-ontmoeten",
      title: "Kennismaken met je buren",
      category: "Sociaal",
      description: "Stel jezelf voor bij de buren. Een goede start in de buurt is altijd fijn!",
      ...postMove1Week,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "buy-fase7-feedback-verhuizers",
      title: "Feedback geven op verhuisbedrijf",
      category: "Verhuizing",
      description: "Geregeld via Lua? Laat een review achter voor het verhuisbedrijf.",
      ...postMove1Week,
      phase: "Welkom thuis",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "buy-fase7-maandlasten",
      title: "Maandlasten overzicht maken",
      category: "Financieel",
      description: "Zo weet je precies waar je maandelijks aan toe bent. Hypotheek, verzekeringen, energie, en meer.",
      ...postMove2Weeks,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-fase7-gemeentelijke-belastingen",
      title: "Gemeentelijke belastingen checken",
      category: "Financieel",
      description: "Check welke gemeentelijke belastingen je kunt verwachten op je nieuwe adres.",
      ...postMove2Weeks,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "buy-fase7-hypotheekrenteaftrek",
      title: "Hypotheekrenteaftrek instellen",
      category: "Financieel",
      description: "Stel hypotheekrenteaftrek in bij de Belastingdienst. Hiermee voorkom je dat je geld laat liggen.",
      ...postMove1Month,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    }
  );

  // VvE bijdrage controleren (alleen bij appartement)
  if (householdInfo?.propertyType === "apartment" && householdInfo?.isVve) {
    tasks.push({
      id: "buy-fase7-vve-bijdrage",
      title: "VvE-bijdrage controleren",
      category: "Financieel",
      description: "Zo weet je precies waar je maandelijks aan toe bent en wat de VvE dekt.",
      ...postMove2Weeks,
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
      // Geen affiliate - controle
    });
  }

  // =====================================================
  // CONDITIONELE TAKEN - VERBOUWING
  // =====================================================
  if (movingInfo.renovationType && movingInfo.renovationType !== "none") {
    if (movingInfo.renovationType === "small") {
      tasks.push({
        id: "buy-reno-small-materiaal",
        title: "Materiaal inkopen voor klussen",
        category: "Verbouwing",
        description: "Koop verf, kwasten, afplaktape en ander materiaal.",
        ...fase3NormalDeadline,
        phase: "Papier & zekerheid",
        status: "todo",
        icon: <Package className="w-4 h-4" />,
        priority: 2,
        affiliateLink: "https://www.praxis.nl/",
      });
    }

    if (movingInfo.renovationType === "large") {
      if (movingInfo.needsContractorHelp) {
        tasks.push({
          id: "buy-reno-large-aannemer",
          title: "Aannemer selecteren",
          category: "Verbouwing",
          description: "Vraag offertes aan bij minimaal 3 aannemers en kies de beste optie.",
          ...fase2Deadline,
          phase: "Slim vooruit regelen",
          status: "todo",
          icon: <Users className="w-4 h-4" />,
          priority: 1,
          affiliateLink: "https://www.werkspot.nl/",
        });
      } else {
        tasks.push({
          id: "buy-reno-large-diy-materiaal",
          title: "Materialen voor verbouwing inkopen",
          category: "Verbouwing",
          description: "Koop alle benodigde materialen voor de verbouwing.",
          ...fase3NormalDeadline,
          phase: "Papier & zekerheid",
          status: "todo",
          icon: <Package className="w-4 h-4" />,
          priority: 1,
          affiliateLink: "https://www.praxis.nl/",
        });
      }
    }
  }

  return tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
};
