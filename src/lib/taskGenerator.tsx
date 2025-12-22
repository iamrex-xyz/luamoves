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

  const tasks: Task[] = [];

  // =====================================================
  // FASE 1 — Even landen (4-3 weken voor verhuizing)
  // =====================================================
  tasks.push(
    {
      id: "rent-fase1-check-huurcontract",
      title: "Check je huidige huurcontract",
      category: "Administratie",
      description: "Bekijk je huidige huurcontract en check de opzegtermijn. Lua berekent automatisch wanneer je uiterlijk moet opzeggen.",
      deadline: adjustDeadline(addDays(movingDate, -28), 'urgent'),
      deadlineLabel: "4 weken voor verhuizing",
      phase: "Even landen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase1-bevestig-nieuwe-woning",
      title: "Nieuwe huurwoning bevestigen",
      category: "Administratie",
      description: "Teken het huurcontract en betaal de borg voor je nieuwe woning. Upload je documenten zodat je ze altijd bij de hand hebt.",
      deadline: adjustDeadline(addDays(movingDate, -28), 'urgent'),
      deadlineLabel: "4 weken voor verhuizing",
      phase: "Even landen",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase1-verhuisbudget",
      title: "Stel je verhuisbudget in",
      category: "Financieel",
      description: "Maak een overzicht van alle verhuiskosten. Dit helpt Lua om betere suggesties te geven.",
      deadline: adjustDeadline(addDays(movingDate, -25), 'normal'),
      deadlineLabel: "3-4 weken voor verhuizing",
      phase: "Even landen",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-fase1-inventariseer-spullen",
      title: "Inventariseer je spullen",
      category: "Huishouden",
      description: "Maak een overzicht van wat je meeneemt, verkoopt of weggeeft. Zo weet je hoeveel dozen je nodig hebt.",
      deadline: adjustDeadline(addDays(movingDate, -24), 'normal'),
      deadlineLabel: "3-4 weken voor verhuizing",
      phase: "Even landen",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    }
  );

  // =====================================================
  // FASE 2 — Slim vooruit regelen (3 weken voor verhuizing)
  // =====================================================
  tasks.push(
    {
      id: "rent-fase2-verhuisbedrijf",
      title: "Verhuisbedrijf of helpers regelen",
      category: "Verhuizing",
      description: "Boek een verhuisbedrijf of organiseer vrienden en familie om te helpen.",
      deadline: adjustDeadline(addDays(movingDate, -21), 'urgent'),
      deadlineLabel: "3 weken voor verhuizing",
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
      deadline: adjustDeadline(addDays(movingDate, -21), 'urgent'),
      deadlineLabel: "3 weken voor verhuizing",
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
      deadline: adjustDeadline(addDays(movingDate, -21), 'urgent'),
      deadlineLabel: "3 weken voor verhuizing",
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
      description: "Bestel voldoende dozen, tape, bubbelfolie en markers. Beter iets teveel dan te weinig!",
      deadline: adjustDeadline(addDays(movingDate, -21), 'normal'),
      deadlineLabel: "3 weken voor verhuizing",
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
  tasks.push(
    {
      id: "rent-fase3-inboedelverzekering",
      title: "Nieuwe inboedelverzekering afsluiten",
      category: "Financieel",
      description: "Sluit een inboedelverzekering af voor je nieuwe woning of pas je huidige aan.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "2 weken voor verhuizing",
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
      description: "Check of je aansprakelijkheidsverzekering ook geldt tijdens de verhuizing.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 3,
      affiliateLink: "https://www.independer.nl/aansprakelijkheidsverzekering/intro.aspx",
    },
    {
      id: "rent-fase3-huur-opzeggen",
      title: "Huidige huur officieel opzeggen",
      category: "Administratie",
      description: "Stuur een opzegbrief naar je huidige verhuurder. Lua toont wanneer dit uiterlijk moet gebeuren op basis van je opzegtermijn.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'urgent'),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    }
  );

  // =====================================================
  // FASE 4 — De praktische puzzel (2-1 weken voor verhuizing)
  // =====================================================
  tasks.push(
    {
      id: "rent-fase4-gemeente",
      title: "Adreswijziging doorgeven aan de gemeente",
      category: "Administratie",
      description: "Geef je nieuwe adres door aan de gemeente. Dit is verplicht binnen 5 dagen na verhuizing.",
      deadline: adjustDeadline(addDays(movingDate, -10), 'urgent'),
      deadlineLabel: "1-2 weken voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.rijksoverheid.nl/onderwerpen/verhuizen/vraag-en-antwoord/verhuizing-doorgeven-aan-gemeente",
    },
    {
      id: "rent-fase4-postnl",
      title: "Post doorsturen aanvragen",
      category: "Administratie",
      description: "Vraag PostNL doorstuurservice aan zodat je geen belangrijke post mist.",
      deadline: adjustDeadline(addDays(movingDate, -10), 'normal'),
      deadlineLabel: "1-2 weken voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://doorzenden.postnl.nl/van-naar#/van-naar",
    },
    {
      id: "rent-fase4-parkeren",
      title: "Parkeersituatie checken & regelen",
      category: "Verhuizing",
      description: "Check of je een parkeervergunning nodig hebt en of een verhuislift handig is.",
      deadline: adjustDeadline(addDays(movingDate, -10), 'normal'),
      deadlineLabel: "1-2 weken voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuislift-huren.nl/",
    },
    {
      id: "rent-fase4-afval",
      title: "Afvalinzameling nieuw adres checken",
      category: "Huishouden",
      description: "Check de afvalregels en ophaaldata in je nieuwe buurt.",
      deadline: adjustDeadline(addDays(movingDate, -7), 'later'),
      deadlineLabel: "1 week voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Trash2 className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-fase4-huisarts",
      title: "Huisarts, tandarts en apotheek informeren",
      category: "Administratie",
      description: "Meld je adreswijziging bij je huisarts, tandarts en apotheek.",
      deadline: adjustDeadline(addDays(movingDate, -7), 'normal'),
      deadlineLabel: "1 week voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    }
  );

  // Werkgever taken (alleen als iemand een baan heeft)
  if (householdInfo?.hasJob !== false) {
    tasks.push({
      id: "rent-fase4-werkgever",
      title: "Werkgever informeren over je verhuizing",
      category: "Administratie",
      description: "Meld je nieuwe adres bij je werkgever en vraag eventueel verhuisverlof aan.",
      deadline: adjustDeadline(addDays(movingDate, -10), 'normal'),
      deadlineLabel: "1-2 weken voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    });
  }

  // School/kinderopvang (alleen als er kinderen zijn)
  if (householdInfo && householdInfo.children > 0) {
    tasks.push({
      id: "rent-fase4-school",
      title: "School of kinderopvang informeren",
      category: "Sociaal",
      description: "Meld je adreswijziging bij school en/of kinderopvang.",
      deadline: adjustDeadline(addDays(movingDate, -10), 'normal'),
      deadlineLabel: "1-2 weken voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 2,
    });
  }

  // Huisdieren (alleen als er huisdieren zijn)
  if (householdInfo && householdInfo.pets > 0) {
    tasks.push({
      id: "rent-fase4-dierenarts",
      title: "Dierenarts informeren over verhuizing",
      category: "Administratie",
      description: "Meld je nieuwe adres bij de dierenarts.",
      deadline: adjustDeadline(addDays(movingDate, -7), 'normal'),
      deadlineLabel: "1 week voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 3,
    });
  }

  // =====================================================
  // FASE 5 — Bijna daar (1 week voor verhuizing)
  // =====================================================
  tasks.push(
    {
      id: "rent-fase5-inspectie",
      title: "Nieuwe woning inspecteren en foto's maken",
      category: "Huishouden",
      description: "Controleer de staat van je nieuwe woning en maak foto's. Upload ze direct naar je documenten.",
      deadline: keyHandoverDate,
      deadlineLabel: "Bij sleuteloverdracht",
      phase: "Bijna daar",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase5-schoonmaak",
      title: "Schoonmaak plannen",
      category: "Schoonmaak",
      description: "Plan schoonmaak voor je oude of nieuwe woning, of doe het zelf.",
      deadline: adjustDeadline(addDays(movingDate, -5), 'normal'),
      deadlineLabel: "Paar dagen voor verhuizing",
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
      deadline: adjustDeadline(addDays(movingDate, -3), 'urgent'),
      deadlineLabel: "3 dagen voor verhuizing",
      phase: "Bijna daar",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    }
  );

  // =====================================================
  // FASE 6 — Verhuisdag
  // =====================================================
  tasks.push(
    {
      id: "rent-fase6-meterstanden",
      title: "Meterstanden vastleggen (foto's)",
      category: "Nutsvoorzieningen",
      description: "Maak foto's van de meterstanden voor gas, water en elektra. Upload ze naar je documenten.",
      deadline: movingDate,
      deadlineLabel: "Op verhuisdag",
      phase: "Verhuisdag",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase6-belangrijke-spullen",
      title: "Belangrijke spullen apart houden",
      category: "Huishouden",
      description: "Leg sleutels, paspoorten, opladers en medicijnen even samen. Zo heb je ze altijd bij de hand.",
      deadline: movingDate,
      deadlineLabel: "Op verhuisdag",
      phase: "Verhuisdag",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase6-verhuizing",
      title: "Verhuizing uitvoeren",
      category: "Verhuizing",
      description: "De grote dag! Neem even de tijd, het komt allemaal goed. Veel succes!",
      deadline: movingDate,
      deadlineLabel: "Op verhuisdag",
      phase: "Verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    }
  );

  // =====================================================
  // FASE 7 — Welkom thuis (1 week na verhuizing)
  // =====================================================
  tasks.push(
    {
      id: "rent-fase7-check-voorzieningen",
      title: "Controleren of alles werkt",
      category: "Nutsvoorzieningen",
      description: "Test of energie, water en internet goed werken in je nieuwe woning.",
      deadline: addDays(movingDate, 1),
      deadlineLabel: "Dag na verhuizing",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-fase7-uitpakken",
      title: "Dozen uitpakken & organiseren",
      category: "Huishouden",
      description: "Begin rustig met uitpakken. Rome is ook niet in één dag gebouwd!",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Eerste week",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.ikea.com/nl/nl/cat/opbergers-st002/",
    },
    {
      id: "rent-fase7-instanties",
      title: "Verhuizing doorgeven bij overige instanties",
      category: "Administratie",
      description: "Update je adres bij bank, verzekeraars en abonnementen.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Eerste week",
      phase: "Welkom thuis",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-fase7-buren",
      title: "Kennismaken met je buren",
      category: "Sociaal",
      description: "Stel jezelf even voor bij de buren. Een goed begin is het halve werk!",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Eerste 2 weken",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-fase7-feedback-verhuizers",
      title: "Feedback geven op verhuisbedrijf",
      category: "Financieel",
      description: "Tevreden over je verhuizers? Geef een review! Geregeld via Lua.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Eerste week",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-fase7-gemeentelijke-belastingen",
      title: "Gemeentelijke belastingen checken",
      category: "Financieel",
      description: "Check afvalstoffenheffing en waterbelasting bij je nieuwe gemeente.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
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
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "De praktische puzzel",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    });
  }

  // Tuin taken (alleen als er een tuin is)
  if (householdInfo?.hasGarden) {
    tasks.push({
      id: "rent-tuin-onderhoud",
      title: "Tuinonderhoud plannen",
      category: "Huishouden",
      description: "Inventariseer wat er in de tuin moet gebeuren en plan eventueel hulp in.",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Eerste 2 weken",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 3,
    });
  }

  // Verbouwing taken
  if (movingInfo.renovationType && movingInfo.renovationType !== "none") {
    if (movingInfo.renovationType === "small") {
      tasks.push(
        {
          id: "reno-small-verfkleuren",
          title: "Verfkleuren uitkiezen",
          category: "Verbouwing",
          description: "Kies verfkleuren voor de kamers die je wilt schilderen.",
          deadline: adjustDeadline(addDays(movingDate, -21), 'normal'),
          deadlineLabel: "3 weken voor verhuizing",
          phase: "Slim vooruit regelen",
          status: "todo",
          icon: <PaintBucket className="w-4 h-4" />,
          priority: 2,
        },
        {
          id: "reno-small-materiaal",
          title: "Materiaal inkopen voor klussen",
          category: "Verbouwing",
          description: "Koop verf, kwasten, afplaktape en ander materiaal.",
          deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
          deadlineLabel: "2 weken voor verhuizing",
          phase: "Papier & zekerheid",
          status: "todo",
          icon: <Package className="w-4 h-4" />,
          priority: 2,
          affiliateLink: "https://www.praxis.nl/",
        },
        {
          id: "reno-small-uitvoeren",
          title: "Kleine klussen uitvoeren",
          category: "Verbouwing",
          description: "Voer schilderwerk en andere kleine klussen uit.",
          deadline: addDays(keyHandoverDate, 5),
          deadlineLabel: "Week na sleuteloverdracht",
          phase: "Bijna daar",
          status: "todo",
          icon: <Hammer className="w-4 h-4" />,
          priority: 1,
        }
      );
    }

    if (movingInfo.renovationType === "large") {
      tasks.push({
        id: "reno-large-plan",
        title: "Verbouwingsplan maken",
        category: "Verbouwing",
        description: "Maak een gedetailleerd plan van wat er verbouwd moet worden.",
        deadline: adjustDeadline(addDays(movingDate, -28), 'urgent'),
        deadlineLabel: "4 weken voor verhuizing",
        phase: "Even landen",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 1,
      });

      if (movingInfo.needsContractorHelp) {
        tasks.push(
          {
            id: "reno-large-aannemer",
            title: "Aannemers vergelijken en selecteren",
            category: "Verbouwing",
            description: "Vraag offertes aan bij minimaal 3 aannemers.",
            deadline: adjustDeadline(addDays(movingDate, -21), 'urgent'),
            deadlineLabel: "3 weken voor verhuizing",
            phase: "Slim vooruit regelen",
            status: "todo",
            icon: <Users className="w-4 h-4" />,
            priority: 1,
            affiliateLink: "https://www.werkspot.nl/",
          },
          {
            id: "reno-large-start",
            title: "Start verbouwing met aannemer",
            category: "Verbouwing",
            description: "Start de verbouwing en houd contact met je aannemer.",
            deadline: addDays(keyHandoverDate, 7),
            deadlineLabel: "Week na sleuteloverdracht",
            phase: "Welkom thuis",
            status: "todo",
            icon: <Hammer className="w-4 h-4" />,
            priority: 1,
          }
        );
      } else {
        tasks.push(
          {
            id: "reno-large-diy-materiaal",
            title: "Materialen voor verbouwing inkopen",
            category: "Verbouwing",
            description: "Koop alle benodigde materialen voor de verbouwing.",
            deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
            deadlineLabel: "2 weken voor verhuizing",
            phase: "Papier & zekerheid",
            status: "todo",
            icon: <Package className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "reno-large-diy-uitvoeren",
            title: "Verbouwing zelf uitvoeren",
            category: "Verbouwing",
            description: "Voer de verbouwing stap voor stap uit.",
            deadline: addDays(keyHandoverDate, 14),
            deadlineLabel: "2 weken na sleuteloverdracht",
            phase: "Welkom thuis",
            status: "todo",
            icon: <Hammer className="w-4 h-4" />,
            priority: 1,
          }
        );
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

  const tasks: Task[] = [];

  // FASE 1 – Na akkoord nieuwe koopwoning
  tasks.push(
    {
      id: "buy-phase1-1",
      title: "Tekenen voorlopig koopcontract",
      category: "Administratie",
      description: "Onderteken het voorlopig koopcontract bij de makelaar.",
      deadline: adjustDeadline(addDays(movingDate, -90), 'urgent'),
      deadlineLabel: "Direct na akkoord",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase1-2",
      title: "Roerende zakenlijst doornemen",
      category: "Administratie",
      description: "Controleer welke zaken meeverkocht worden (bijv. gordijnen, lampen).",
      deadline: adjustDeadline(addDays(movingDate, -88), 'urgent'),
      deadlineLabel: "Direct na akkoord",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase1-4",
      title: "Benodigde documenten verzamelen voor hypotheek",
      category: "Administratie",
      description: "Verzamel loonstroken, ID-bewijzen en andere benodigde documenten.",
      deadline: adjustDeadline(addDays(movingDate, -85), 'urgent'),
      deadlineLabel: "Binnen 1 week",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase1-5",
      title: "Notaris selecteren",
      category: "Administratie",
      description: "Kies een notaris voor de levering van je nieuwe woning.",
      deadline: adjustDeadline(addDays(movingDate, -85), 'normal'),
      deadlineLabel: "Binnen 1 week",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.degoedkoopstenotaris.nl/",
    },
    {
      id: "buy-phase1-8",
      title: "Hypotheekadviseur kiezen en hypotheek aanvragen",
      category: "Financieel",
      description: "Selecteer een hypotheekadviseur en start de aanvraag.",
      deadline: adjustDeadline(addDays(movingDate, -88), 'urgent'),
      deadlineLabel: "Zo snel mogelijk",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/hypotheek/intro.aspx",
    },
    {
      id: "buy-phase1-11",
      title: "Waarborgsom of bankgarantie regelen",
      category: "Financieel",
      description: "Regel de waarborgsom of bankgarantie zoals afgesproken in het contract.",
      deadline: adjustDeadline(addDays(movingDate, -82), 'urgent'),
      deadlineLabel: "Binnen 10 dagen",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase1-14",
      title: "Vaststellen voorlopige verhuisdatum",
      category: "Verhuizing",
      description: "Plan een voorlopige verhuisdatum in overleg met alle partijen.",
      deadline: adjustDeadline(addDays(movingDate, -80), 'normal'),
      deadlineLabel: "Binnen 10 dagen",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-phase1-15",
      title: "Verhuisbudget bepalen",
      category: "Verhuizing",
      description: "Stel een budget op voor je verhuizing.",
      deadline: adjustDeadline(addDays(movingDate, -78), 'normal'),
      deadlineLabel: "Binnen 12 dagen",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-phase1-18",
      title: "Bouwkundige keuring laten uitvoeren",
      category: "Administratie",
      description: "Laat een bouwkundige keuring uitvoeren (indien gewenst).",
      deadline: adjustDeadline(addDays(movingDate, -85), 'normal'),
      deadlineLabel: "Binnen 1 week",
      phase: "Fase 1 - Na akkoord nieuwe koopwoning",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.bouwkundigekeuring.com/",
    }
  );

  // FASE 2 – Voor sleuteloverdracht (contract & hypotheek afronden)
  tasks.push(
    {
      id: "buy-phase2-1",
      title: "Koopcontract definitief tekenen",
      category: "Administratie",
      description: "Teken het definitieve koopcontract na afloop van de bedenktijd.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -60), 'urgent'),
      deadlineLabel: "Na bedenktijd",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase2-3",
      title: "Taxatie laten uitvoeren",
      category: "Administratie",
      description: "Plan een taxatie van de woning in voor de hypotheekverstrekker.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -50), 'urgent'),
      deadlineLabel: "2-3 weken voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.taxatiewijzer.nl/",
    },
    {
      id: "buy-phase2-5",
      title: "Definitieve hypotheekofferte controleren en tekenen",
      category: "Financieel",
      description: "Controleer en onderteken de definitieve hypotheekofferte.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -40), 'urgent'),
      deadlineLabel: "4 weken voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase2-6",
      title: "Concept-aktes van notaris lezen",
      category: "Administratie",
      description: "Lees de leveringsakte en hypotheekakte die je bij de notaris gaat tekenen.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -14), 'urgent'),
      deadlineLabel: "2 weken voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase2-9",
      title: "Eigen geld voor kosten koper klaarzetten",
      category: "Financieel",
      description: "Zorg dat je voldoende eigen geld beschikbaar hebt voor de kosten koper.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -30), 'urgent'),
      deadlineLabel: "1 maand voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase2-12",
      title: "Vergelijk en kies energieleverancier",
      category: "Nutsvoorzieningen",
      description: "Vergelijk prijzen en voorwaarden van energieleveranciers en sluit een contract af.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -30), 'normal'),
      deadlineLabel: "1 maand voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/energie/intro.aspx",
    },
    {
      id: "buy-phase2-14",
      title: "Internetprovider kiezen",
      category: "Nutsvoorzieningen",
      description: "Vergelijk internetproviders en kies de beste optie.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -28), 'normal'),
      deadlineLabel: "4 weken voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <Wifi className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/internet/intro.aspx",
    },
    {
      id: "buy-phase2-16",
      title: "Verhuisbedrijf boeken",
      category: "Verhuizing",
      description: "Vergelijk verhuisbedrijven en boek er een.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -35), 'normal'),
      deadlineLabel: "5 weken voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuisofferte.nl/",
    },
    {
      id: "buy-phase2-18",
      title: "Verhuisdozen en verpakkingsmateriaal kopen",
      category: "Verhuizing",
      description: "Koop dozen, tape en noppenfolie.",
      deadline: adjustDeadline(addDays(keyHandoverDate, -21), 'normal'),
      deadlineLabel: "3 weken voor levering",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuisdozen.nl/",
    },
    {
      id: "buy-phase2-20",
      title: "Opstalverzekering regelen (verplicht)",
      category: "Financieel",
      description: "Sluit een opstalverzekering af (verplicht bij hypotheek).",
      deadline: adjustDeadline(addDays(keyHandoverDate, -7), 'urgent'),
      deadlineLabel: "Voor sleuteloverdracht",
      phase: "Fase 2 - Voor sleuteloverdracht",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/woonverzekering/intro.aspx",
    }
  );

  // FASE 3 – Na sleuteloverdracht
  tasks.push(
    {
      id: "buy-phase3-1",
      title: "Notaris passeren (levering woning)",
      category: "Administratie",
      description: "Teken bij de notaris voor de overdracht van de woning.",
      deadline: adjustDeadline(keyHandoverDate, 'urgent'),
      deadlineLabel: "Op leveringsdatum",
      phase: "Fase 3 - Na sleuteloverdracht",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase3-2",
      title: "Sleutels ontvangen en woning inspecteren",
      category: "Administratie",
      description: "Ontvang de sleutels en controleer de staat van de woning.",
      deadline: adjustDeadline(keyHandoverDate, 'urgent'),
      deadlineLabel: "Op leveringsdatum",
      phase: "Fase 3 - Na sleuteloverdracht",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase3-3",
      title: "Meterstanden noteren",
      category: "Nutsvoorzieningen",
      description: "Noteer alle meterstanden en meld deze aan je energieleverancier.",
      deadline: adjustDeadline(keyHandoverDate, 'urgent'),
      deadlineLabel: "Op leveringsdatum",
      phase: "Fase 3 - Na sleuteloverdracht",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase3-7",
      title: "Gas/water/licht activeren",
      category: "Nutsvoorzieningen",
      description: "Activeer alle nutsvoorzieningen op je naam.",
      deadline: adjustDeadline(keyHandoverDate, 'urgent'),
      deadlineLabel: "Bij sleuteloverdracht",
      phase: "Fase 3 - Na sleuteloverdracht",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase3-10",
      title: "Rookmelders checken (verplicht)",
      category: "Veiligheid",
      description: "Controleer of alle rookmelders aanwezig en werkend zijn.",
      deadline: adjustDeadline(addDays(keyHandoverDate, 1), 'urgent'),
      deadlineLabel: "Direct na sleuteloverdracht",
      phase: "Fase 3 - Na sleuteloverdracht",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=rookmelder",
    },
    {
      id: "buy-phase3-15",
      title: "Eerste schoonmaak nieuwe woning",
      category: "Schoonmaak",
      description: "Maak de woning schoon voordat je erin trekt.",
      deadline: adjustDeadline(addDays(keyHandoverDate, 2), 'normal'),
      deadlineLabel: "Eerste dagen",
      phase: "Fase 3 - Na sleuteloverdracht",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.zoofy.nl/schoonmaak",
    },
    {
      id: "buy-phase3-21",
      title: "Slotcilinders vervangen (aanrader)",
      category: "Veiligheid",
      description: "Vervang de slotcilinders voor extra beveiliging.",
      deadline: adjustDeadline(addDays(keyHandoverDate, 2), 'normal'),
      deadlineLabel: "Eerste dagen",
      phase: "Fase 3 - Na sleuteloverdracht",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=slotcilinder",
    }
  );

  // FASE 4 – Voor verhuisdag
  tasks.push(
    {
      id: "buy-phase4-1",
      title: "Verhuisservice PostNL aanvragen",
      category: "Administratie",
      description: "Meld je verhuizing aan bij PostNL voor postdoorsturen.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 4 - Voor verhuisdag",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://doorzenden.postnl.nl/van-naar#/van-naar",
    },
    {
      id: "buy-phase4-9",
      title: "Dozen inpakken",
      category: "Verhuizing",
      description: "Begin met het inpakken van je spullen in dozen.",
      deadline: adjustDeadline(addDays(movingDate, -7), 'urgent'),
      deadlineLabel: "1 week voor verhuizing",
      phase: "Fase 4 - Voor verhuisdag",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase4-11",
      title: "Verhuisbedrijf bevestigen",
      category: "Verhuizing",
      description: "Bevestig de reservering met je verhuisbedrijf.",
      deadline: adjustDeadline(addDays(movingDate, -7), 'urgent'),
      deadlineLabel: "1 week voor verhuizing",
      phase: "Fase 4 - Voor verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase4-12",
      title: "Parkeervergunning of verhuislift regelen",
      category: "Verhuizing",
      description: "Vraag een parkeervergunning aan of huur een verhuislift voor de verhuisdag.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 4 - Voor verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuislift-huren.nl/",
    },
    {
      id: "buy-phase4-15",
      title: "Koelkast leegmaken",
      category: "Huishouden",
      description: "Gebruik bederfelijke producten op of gooi ze weg.",
      deadline: adjustDeadline(addDays(movingDate, -2), 'normal'),
      deadlineLabel: "2 dagen voor verhuizing",
      phase: "Fase 4 - Voor verhuisdag",
      status: "todo",
      icon: <Trash2 className="w-4 h-4" />,
      priority: 2,
    }
  );

  // Huisdieren taken (alleen als er huisdieren zijn)
  if (householdInfo && householdInfo.pets > 0) {
    tasks.push({
      id: "buy-phase4-13",
      title: "Huisdieren opvang regelen voor verhuisdag",
      category: "Verhuizing",
      description: "Regel opvang voor huisdieren tijdens de verhuizing.",
      deadline: adjustDeadline(addDays(movingDate, -7), 'normal'),
      deadlineLabel: "1 week voor verhuizing",
      phase: "Fase 4 - Voor verhuisdag",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 2,
    });
  }

  // FASE 5 – Sleuteloverdracht oude woning (alleen bij huurwoning of verkoop oude woning)
  tasks.push(
    {
      id: "buy-phase5-1",
      title: "Oude woning opleveren (indien van toepassing)",
      category: "Administratie",
      description: "Lever je oude woning op aan de nieuwe eigenaar of verhuurder.",
      deadline: adjustDeadline(movingDate, 'urgent'),
      deadlineLabel: "Verhuisdag",
      phase: "Fase 5 - Sleuteloverdracht oude woning",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase5-3",
      title: "Meterstanden oude woning noteren",
      category: "Nutsvoorzieningen",
      description: "Noteer de eindstanden voor gas, water en elektra.",
      deadline: adjustDeadline(movingDate, 'urgent'),
      deadlineLabel: "Verhuisdag",
      phase: "Fase 5 - Sleuteloverdracht oude woning",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase5-7",
      title: "Oude woning schoonmaken",
      category: "Schoonmaak",
      description: "Maak de woning schoon voor oplevering.",
      deadline: adjustDeadline(addDays(movingDate, -1), 'normal'),
      deadlineLabel: "1 dag voor verhuizing",
      phase: "Fase 5 - Sleuteloverdracht oude woning",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.zoofy.nl/schoonmaak",
    }
  );

  // FASE 6 – Verhuisdag
  tasks.push(
    {
      id: "buy-phase6-1",
      title: "Verhuisteam of helpers ontvangen",
      category: "Verhuizing",
      description: "Ontvang het verhuisteam of je helpers.",
      deadline: adjustDeadline(movingDate, 'urgent'),
      deadlineLabel: "Verhuisdag",
      phase: "Fase 6 - Verhuisdag",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase6-3",
      title: "Spullen vervoeren naar nieuwe woning",
      category: "Verhuizing",
      description: "Coördineer het vervoer van al je spullen.",
      deadline: adjustDeadline(movingDate, 'urgent'),
      deadlineLabel: "Verhuisdag",
      phase: "Fase 6 - Verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase6-4",
      title: "Dozen naar juiste kamers brengen",
      category: "Verhuizing",
      description: "Zorg dat dozen in de juiste kamers worden geplaatst.",
      deadline: adjustDeadline(movingDate, 'urgent'),
      deadlineLabel: "Verhuisdag",
      phase: "Fase 6 - Verhuisdag",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase6-9",
      title: "Bedden opmaken",
      category: "Huishouden",
      description: "Maak de bedden op voor de eerste nacht.",
      deadline: adjustDeadline(movingDate, 'normal'),
      deadlineLabel: "Verhuisdag",
      phase: "Fase 6 - Verhuisdag",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    }
  );

  // FASE 7 – Eerste week na verhuizing
  tasks.push(
    {
      id: "buy-phase7-1",
      title: "Verhuizing doorgeven gemeente",
      category: "Administratie",
      description: "Geef je verhuizing door bij de gemeente binnen 5 werkdagen.",
      deadline: adjustDeadline(addDays(movingDate, 3), 'urgent'),
      deadlineLabel: "Binnen 3 dagen",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase7-2",
      title: "Adreswijziging doorgeven belangrijke instanties",
      category: "Administratie",
      description: "Update je adres bij werkgever, bank, belastingdienst en verzekeringen.",
      deadline: adjustDeadline(addDays(movingDate, 5), 'urgent'),
      deadlineLabel: "Binnen 5 dagen",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-phase7-10",
      title: "Inboedelverzekering activeren",
      category: "Financieel",
      description: "Activeer je inboedelverzekering.",
      deadline: adjustDeadline(addDays(movingDate, 1), 'urgent'),
      deadlineLabel: "Direct na verhuizing",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/woonverzekering/intro.aspx",
    },
    {
      id: "buy-phase7-12",
      title: "Eerste boodschappen doen",
      category: "Huishouden",
      description: "Doe een grote boodschappenronde voor je nieuwe woning.",
      deadline: adjustDeadline(addDays(movingDate, 2), 'normal'),
      deadlineLabel: "Eerste dagen",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-phase7-13",
      title: "Afvalpassen regelen",
      category: "Huishouden",
      description: "Regel afvalpassen of containers bij de gemeente.",
      deadline: adjustDeadline(addDays(movingDate, 5), 'normal'),
      deadlineLabel: "Binnen 5 dagen",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <Trash2 className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-phase7-16",
      title: "Meubels opstellen",
      category: "Inrichten",
      description: "Plaats alle meubels op hun definitieve plek.",
      deadline: adjustDeadline(addDays(movingDate, 7), 'normal'),
      deadlineLabel: "Binnen 1 week",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-phase7-17",
      title: "Lampen ophangen",
      category: "Inrichten",
      description: "Hang alle lampen op.",
      deadline: adjustDeadline(addDays(movingDate, 7), 'normal'),
      deadlineLabel: "Binnen 1 week",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=lamp",
    }
  );

  // Huisdieren taken na verhuizing
  if (householdInfo && householdInfo.pets > 0) {
    tasks.push({
      id: "buy-phase7-14",
      title: "Huisdieren laten wennen",
      category: "Huishouden",
      description: "Help je huisdieren wennen aan de nieuwe woning.",
      deadline: adjustDeadline(addDays(movingDate, 1), 'normal'),
      deadlineLabel: "Direct na verhuizing",
      phase: "Fase 7 - Eerste week na verhuizing",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    });
  }

  // VvE taken (alleen voor appartementen met VvE)
  if (householdInfo?.propertyType === "apartment" && householdInfo?.isVve) {
    tasks.push(
      {
        id: "buy-vve-1",
        title: "VvE contacteren voor levering",
        category: "Administratie",
        description: "Neem contact op met de VvE beheerder over de eigendomsoverdracht.",
        deadline: addDays(keyHandoverDate, -14),
        deadlineLabel: "2 weken voor levering",
        phase: "Fase 2 - Voor sleuteloverdracht",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "buy-vve-2",
        title: "VvE vergaderstukken opvragen",
        category: "Administratie",
        description: "Vraag notulen, jaarrekening en meerjarenplan op bij de VvE.",
        deadline: addDays(keyHandoverDate, -7),
        deadlineLabel: "1 week voor levering",
        phase: "Fase 2 - Voor sleuteloverdracht",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "buy-vve-3",
        title: "VvE bijdrage controleren",
        category: "Financieel",
        description: "Controleer de maandelijkse VvE bijdrage en wat deze dekt.",
        deadline: addDays(movingDate, 14),
        deadlineLabel: "2 weken na verhuizing",
        phase: "Fase 8 - Binnen eerste maand",
        status: "todo",
        icon: <Euro className="w-4 h-4" />,
        priority: 2,
      }
    );
  }

  // Tuin taken (alleen als er een tuin is)
  if (householdInfo?.hasGarden) {
    tasks.push(
      {
        id: "buy-garden-1",
        title: "Tuin inspecteren en plan maken",
        category: "Huishouden",
        description: "Inspecteer de tuin en maak een plan voor onderhoud of herinrichting.",
        deadline: addDays(keyHandoverDate, 7),
        deadlineLabel: "Eerste week",
        phase: "Fase 3 - Na sleuteloverdracht",
        status: "todo",
        icon: <Home className="w-4 h-4" />,
        priority: 3,
      },
      {
        id: "buy-garden-2",
        title: "Tuingereedschap aanschaffen",
        category: "Huishouden",
        description: "Koop benodigd tuingereedschap (grasmaaier, snoeischaar, etc.).",
        deadline: addDays(movingDate, 21),
        deadlineLabel: "3 weken na verhuizing",
        phase: "Fase 8 - Binnen eerste maand",
        status: "todo",
        icon: <Home className="w-4 h-4" />,
        priority: 3,
        affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=tuingereedschap",
      },
      {
        id: "buy-garden-3",
        title: "Tuinafval container regelen",
        category: "Huishouden",
        description: "Vraag een GFT container aan bij de gemeente indien nodig.",
        deadline: addDays(movingDate, 14),
        deadlineLabel: "2 weken na verhuizing",
        phase: "Fase 8 - Binnen eerste maand",
        status: "todo",
        icon: <Trash2 className="w-4 h-4" />,
        priority: 3,
      }
    );
  }

  // Parkeren taken (alleen als er een parkeerplek is)
  if (householdInfo?.hasParking) {
    tasks.push(
      {
        id: "buy-parking-1",
        title: "Parkeerplaats/garage sleutels ophalen",
        category: "Administratie",
        description: "Haal de sleutels of afstandsbediening voor je parkeerplek op.",
        deadline: keyHandoverDate,
        deadlineLabel: "Bij sleuteloverdracht",
        phase: "Fase 3 - Na sleuteloverdracht",
        status: "todo",
        icon: <Key className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "buy-parking-2",
        title: "Parkeerplaats verzekering overwegen",
        category: "Financieel",
        description: "Overweeg extra verzekering voor je garage/parkeerplek.",
        deadline: addDays(movingDate, 14),
        deadlineLabel: "2 weken na verhuizing",
        phase: "Fase 8 - Binnen eerste maand",
        status: "todo",
        icon: <Shield className="w-4 h-4" />,
        priority: 3,
      }
    );
  }

  // Werkgever taken (alleen als iemand een baan heeft)
  if (householdInfo?.hasJob) {
    tasks.push(
      {
        id: "buy-job-1",
        title: "Adreswijziging doorgeven aan werkgever",
        category: "Administratie",
        description: "Meld je nieuwe adres bij je werkgever voor salarisadministratie.",
        deadline: addDays(movingDate, -7),
        deadlineLabel: "1 week voor verhuizing",
        phase: "Fase 4 - Voor verhuisdag",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "buy-job-2",
        title: "Reiskostenvergoeding aanpassen",
        category: "Financieel",
        description: "Vraag aangepaste reiskostenvergoeding aan bij je werkgever.",
        deadline: addDays(movingDate, 14),
        deadlineLabel: "2 weken na verhuizing",
        phase: "Fase 8 - Binnen eerste maand",
        status: "todo",
        icon: <Euro className="w-4 h-4" />,
        priority: 2,
      }
    );
  }

  // FASE 8 – Binnen eerste maand
  tasks.push(
    {
      id: "buy-phase8-4",
      title: "Hypotheekrenteaftrek instellen",
      category: "Financieel",
      description: "Stel hypotheekrenteaftrek in bij de Belastingdienst.",
      deadline: adjustDeadline(addDays(movingDate, 30), 'normal'),
      deadlineLabel: "Binnen 1 maand",
      phase: "Fase 8 - Binnen eerste maand",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-phase8-5",
      title: "Maandlasten controleren",
      category: "Financieel",
      description: "Controleer je maandelijkse lasten en budget.",
      deadline: adjustDeadline(addDays(movingDate, 30), 'normal'),
      deadlineLabel: "Binnen 1 maand",
      phase: "Fase 8 - Binnen eerste maand",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-phase8-12",
      title: "Kennismaken met buren",
      category: "Sociaal",
      description: "Maak kennis met je nieuwe buren.",
      deadline: adjustDeadline(addDays(movingDate, 14), 'later'),
      deadlineLabel: "Binnen 2 weken",
      phase: "Fase 8 - Binnen eerste maand",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    }
  );

  // Verbouwing taken toevoegen indien van toepassing
  if (movingInfo.renovationType && movingInfo.renovationType !== "none") {
    if (movingInfo.renovationType === "small") {
      tasks.push(
        {
          id: "buy-reno-small-1",
          title: "Verfkleuren uitkiezen",
          category: "Verbouwing",
          description: "Kies verfkleuren voor de kamers die je wilt schilderen.",
          deadline: addDays(keyHandoverDate, 3),
          deadlineLabel: "Eerste week na levering",
          phase: "Fase 3 - Na sleuteloverdracht",
          status: "todo",
          icon: <PaintBucket className="w-4 h-4" />,
          priority: 2,
        },
        {
          id: "buy-reno-small-2",
          title: "Verf en materiaal inkopen",
          category: "Verbouwing",
          description: "Koop verf, kwasten en ander benodigd materiaal.",
          deadline: addDays(keyHandoverDate, 5),
          deadlineLabel: "Eerste week na levering",
          phase: "Fase 3 - Na sleuteloverdracht",
          status: "todo",
          icon: <Package className="w-4 h-4" />,
          priority: 2,
          affiliateLink: "https://www.praxis.nl/",
        },
        {
          id: "buy-reno-small-3",
          title: "Schilder- en kluswerk uitvoeren",
          category: "Verbouwing",
          description: "Voer schilder- en kluswerk uit voor de verhuizing.",
          deadline: addDays(movingDate, -5),
          deadlineLabel: "Voor verhuisdag",
          phase: "Fase 4 - Voor verhuisdag",
          status: "todo",
          icon: <Hammer className="w-4 h-4" />,
          priority: 1,
        }
      );
    }

    if (movingInfo.renovationType === "large") {
      tasks.push({
        id: "buy-reno-large-1",
        title: "Verbouwingsplan maken",
        category: "Verbouwing",
        description: "Maak een gedetailleerd plan van wat er verbouwd moet worden.",
        deadline: adjustDeadline(addDays(movingDate, -60), 'urgent'),
        deadlineLabel: "60 dagen voor verhuizing",
        phase: "Fase 1 - Na akkoord nieuwe koopwoning",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 1,
      });

      if (movingInfo.needsContractorHelp) {
        tasks.push(
          {
            id: "buy-reno-large-2",
            title: "Aannemers vergelijken en selecteren",
            category: "Verbouwing",
            description: "Haal offertes op bij minimaal 3 aannemers.",
            deadline: adjustDeadline(addDays(movingDate, -50), 'urgent'),
            deadlineLabel: "50 dagen voor verhuizing",
            phase: "Fase 1 - Na akkoord nieuwe koopwoning",
            status: "todo",
            icon: <Users className="w-4 h-4" />,
            priority: 1,
            affiliateLink: "https://www.werkspot.nl/",
          },
          {
            id: "buy-reno-large-3",
            title: "Contract met aannemer tekenen",
            category: "Verbouwing",
            description: "Onderteken het contract met de gekozen aannemer.",
            deadline: adjustDeadline(addDays(movingDate, -40), 'urgent'),
            deadlineLabel: "40 dagen voor verhuizing",
            phase: "Fase 2 - Voor sleuteloverdracht",
            status: "todo",
            icon: <FileText className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "buy-reno-large-4",
            title: "Start verbouwing",
            category: "Verbouwing",
            description: "Start de verbouwing direct na sleuteloverdracht.",
            deadline: addDays(keyHandoverDate, 2),
            deadlineLabel: "Direct na sleuteloverdracht",
            phase: "Fase 3 - Na sleuteloverdracht",
            status: "todo",
            icon: <Hammer className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "buy-reno-large-5",
            title: "Verbouwing controleren en afronden",
            category: "Verbouwing",
            description: "Controleer de voortgang en rond de verbouwing af.",
            deadline: addDays(movingDate, -7),
            deadlineLabel: "1 week voor verhuizing",
            phase: "Fase 4 - Voor verhuisdag",
            status: "todo",
            icon: <ClipboardCheck className="w-4 h-4" />,
            priority: 1,
          }
        );
      } else {
        tasks.push(
          {
            id: "buy-reno-large-diy-1",
            title: "Materialen voor verbouwing inkopen",
            category: "Verbouwing",
            description: "Koop alle benodigde materialen voor de verbouwing.",
            deadline: addDays(keyHandoverDate, 3),
            deadlineLabel: "Direct na sleuteloverdracht",
            phase: "Fase 3 - Na sleuteloverdracht",
            status: "todo",
            icon: <Package className="w-4 h-4" />,
            priority: 1,
            affiliateLink: "https://www.praxis.nl/",
          },
          {
            id: "buy-reno-large-diy-2",
            title: "Verbouwing uitvoeren",
            category: "Verbouwing",
            description: "Voer de verbouwing stap voor stap uit.",
            deadline: addDays(movingDate, -7),
            deadlineLabel: "1 week voor verhuizing",
            phase: "Fase 4 - Voor verhuisdag",
            status: "todo",
            icon: <Hammer className="w-4 h-4" />,
            priority: 1,
          }
        );
      }
    }
  }

  // Kinderen taken
  if (householdInfo && householdInfo.children > 0) {
    tasks.push(
      {
        id: "buy-children-1",
        title: "School/kinderopvang informeren",
        category: "Sociaal",
        description: "Meld adreswijziging of zoek nieuwe school/opvang.",
        deadline: adjustDeadline(addDays(movingDate, -21), 'normal'),
        deadlineLabel: "3 weken voor verhuizing",
        phase: "Fase 4 - Voor verhuisdag",
        status: "todo",
        icon: <Users className="w-4 h-4" />,
        priority: 2,
      }
    );
  }

  return tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
};
