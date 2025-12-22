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

  // =====================================================
  // FASE 1 — Even landen (4-3 weken voor verhuizing)
  // KOOP-SPECIFIEK: Koopcontract, hypotheek, bouwkundige keuring
  // =====================================================
  tasks.push(
    {
      id: "buy-fase1-koopcontract",
      title: "Voorlopig koopcontract tekenen",
      category: "Administratie",
      description: "Onderteken het voorlopig koopcontract. Vanaf nu gaat de bedenktijd in.",
      deadline: adjustDeadline(addDays(movingDate, -28), 'urgent'),
      deadlineLabel: "4 weken voor verhuizing",
      phase: "Even landen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-fase1-roerende-zaken",
      title: "Roerende zaken doornemen",
      category: "Administratie",
      description: "Wat blijft achter en wat neem je over? Denk aan gordijnen, lampen en inbouwapparatuur.",
      deadline: adjustDeadline(addDays(movingDate, -28), 'urgent'),
      deadlineLabel: "4 weken voor verhuizing",
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
      deadline: adjustDeadline(addDays(movingDate, -28), 'urgent'),
      deadlineLabel: "4 weken voor verhuizing",
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
      deadline: adjustDeadline(addDays(movingDate, -25), 'urgent'),
      deadlineLabel: "3-4 weken voor verhuizing",
      phase: "Even landen",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.bouwkundigekeuring.com/",
    },
    {
      id: "buy-fase1-verhuisbudget",
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
      id: "buy-fase1-inventariseer-spullen",
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
  // GEDEELDE TAKEN + KOOP-SPECIFIEK
  // =====================================================
  tasks.push(
    {
      id: "buy-fase2-verhuisbedrijf",
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
      id: "buy-fase2-energie",
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
      id: "buy-fase2-internet",
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
      id: "buy-fase2-verhuisdozen",
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
  // KOOP-SPECIFIEK: Notaris, taxatie, waarborgsom, opstal
  // =====================================================
  tasks.push(
    {
      id: "buy-fase3-notaris",
      title: "Notaris kiezen",
      category: "Administratie",
      description: "Kies een notaris voor de levering van je nieuwe woning.",
      deadline: adjustDeadline(addDays(movingDate, -21), 'normal'),
      deadlineLabel: "3 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.degoedkoopstenotaris.nl/",
    },
    {
      id: "buy-fase3-hypotheekdocs",
      title: "Benodigde hypotheekdocumenten uploaden",
      category: "Administratie",
      description: "Upload loonstroken, ID-bewijzen en andere documenten naar je documenten.",
      deadline: adjustDeadline(addDays(movingDate, -18), 'urgent'),
      deadlineLabel: "2-3 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-fase3-waarborgsom",
      title: "Waarborgsom of bankgarantie regelen",
      category: "Financieel",
      description: "Regel de waarborgsom of bankgarantie zoals afgesproken in het contract.",
      deadline: adjustDeadline(addDays(movingDate, -18), 'urgent'),
      deadlineLabel: "2-3 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-fase3-taxatie",
      title: "Taxatie laten uitvoeren",
      category: "Administratie",
      description: "Plan een taxatie van de woning in voor de hypotheekverstrekker.",
      deadline: adjustDeadline(addDays(movingDate, -18), 'urgent'),
      deadlineLabel: "2-3 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.taxatiewijzer.nl/",
    },
    {
      id: "buy-fase3-opstal",
      title: "Opstalverzekering afsluiten",
      category: "Financieel",
      description: "Sluit een opstalverzekering af. Dit is verplicht bij een hypotheek.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'urgent'),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/woonverzekering/intro.aspx",
    },
    {
      id: "buy-fase3-inboedelverzekering",
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
      id: "buy-fase3-aansprakelijkheid",
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
      id: "buy-fase3-conceptaktes",
      title: "Conceptaktes van de notaris doornemen",
      category: "Administratie",
      description: "Geen paniek, dit is standaard. Lees de leveringsakte en hypotheekakte door.",
      deadline: adjustDeadline(addDays(movingDate, -10), 'urgent'),
      deadlineLabel: "1-2 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    }
  );

  // VvE documenten (alleen bij appartement)
  if (householdInfo?.propertyType === "apartment" && householdInfo?.isVve) {
    tasks.push({
      id: "buy-fase3-vve-docs",
      title: "VvE-documenten opvragen en bekijken",
      category: "Administratie",
      description: "Vraag notulen, jaarrekening en meerjarenplan op bij de VvE. Zo weet je waar je aan toe bent.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Papier & zekerheid",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    });
  }

  // =====================================================
  // FASE 4 — De praktische puzzel (2-1 weken voor verhuizing)
  // GEDEELDE TAKEN
  // =====================================================
  tasks.push(
    {
      id: "buy-fase4-gemeente",
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
      id: "buy-fase4-postnl",
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
      id: "buy-fase4-parkeren",
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
      id: "buy-fase4-afval",
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
      id: "buy-fase4-huisarts",
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
      id: "buy-fase4-werkgever",
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
      id: "buy-fase4-school",
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
      id: "buy-fase4-dierenarts",
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
  // KOOP-SPECIFIEK: Notaris passeren, slotcilinders, rookmelders
  // =====================================================
  tasks.push(
    {
      id: "buy-fase5-notaris-levering",
      title: "Notaris: levering van de woning",
      category: "Administratie",
      description: "Dit is het officiële overdrachtsmoment. Gefeliciteerd, je wordt eigenaar!",
      deadline: keyHandoverDate,
      deadlineLabel: "Bij sleuteloverdracht",
      phase: "Bijna daar",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "buy-fase5-inspectie",
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
      id: "buy-fase5-slotcilinders",
      title: "Slotcilinders vervangen",
      category: "Veiligheid",
      description: "Dan weet je zeker dat jij de enige bent met een sleutel.",
      deadline: addDays(keyHandoverDate, 2),
      deadlineLabel: "Eerste dagen na sleuteloverdracht",
      phase: "Bijna daar",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=slotcilinder",
    },
    {
      id: "buy-fase5-rookmelders",
      title: "Rookmelders checken (verplicht)",
      category: "Veiligheid",
      description: "Controleer of alle rookmelders aanwezig en werkend zijn. Dit is verplicht!",
      deadline: addDays(keyHandoverDate, 1),
      deadlineLabel: "Direct na sleuteloverdracht",
      phase: "Bijna daar",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=rookmelder",
    },
    {
      id: "buy-fase5-schoonmaak",
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
      id: "buy-fase5-bevestig-verhuizers",
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
  // GEDEELDE TAKEN
  // =====================================================
  tasks.push(
    {
      id: "buy-fase6-meterstanden",
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
      id: "buy-fase6-belangrijke-spullen",
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
      id: "buy-fase6-verhuizing",
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
  // GEDEELDE TAKEN + KOOP-SPECIFIEK
  // =====================================================
  tasks.push(
    {
      id: "buy-fase7-check-voorzieningen",
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
      id: "buy-fase7-uitpakken",
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
      id: "buy-fase7-instanties",
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
      id: "buy-fase7-buren",
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
      id: "buy-fase7-feedback-verhuizers",
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
      id: "buy-fase7-maandlasten",
      title: "Maandlasten overzicht maken",
      category: "Financieel",
      description: "Zo weet je precies waar je maandelijks aan toe bent. Hypotheek, verzekeringen, energie, en meer.",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Eerste 2 weken",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "buy-fase7-hypotheekrenteaftrek",
      title: "Hypotheekrenteaftrek instellen",
      category: "Financieel",
      description: "Stel hypotheekrenteaftrek in bij de Belastingdienst.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand",
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
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Eerste 2 weken",
      phase: "Welkom thuis",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    });
  }

  // =====================================================
  // CONDITIONELE TAKEN
  // =====================================================

  // Tuin taken (alleen als er een tuin is)
  if (householdInfo?.hasGarden) {
    tasks.push({
      id: "buy-tuin-onderhoud",
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
          id: "buy-reno-small-verfkleuren",
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
          id: "buy-reno-small-materiaal",
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
          id: "buy-reno-small-uitvoeren",
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
        id: "buy-reno-large-plan",
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
            id: "buy-reno-large-aannemer",
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
            id: "buy-reno-large-start",
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
            id: "buy-reno-large-diy-materiaal",
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
            id: "buy-reno-large-diy-uitvoeren",
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
