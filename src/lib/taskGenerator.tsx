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

  // FASE 1 – Na akkoord nieuwe huurwoning
  tasks.push(
    {
      id: "rent-phase1-1",
      title: "Bevestig nieuwe huurwoning (contract tekenen, borg betalen)",
      category: "Administratie",
      description: "Teken het huurcontract en betaal de borg voor je nieuwe woning.",
      deadline: adjustDeadline(addDays(movingDate, -45), 'urgent'),
      deadlineLabel: "Zo snel mogelijk",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase1-2",
      title: "Controleer huidige huurcontract en opzegtermijn",
      category: "Administratie",
      description: "Check je huidige huurcontract voor de juiste opzegtermijn.",
      deadline: adjustDeadline(addDays(movingDate, -60), 'urgent'),
      deadlineLabel: "Zo snel mogelijk",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase1-3",
      title: "Bepaal verhuisbudget",
      category: "Financieel",
      description: "Maak een overzicht van alle verhuiskosten.",
      deadline: adjustDeadline(addDays(movingDate, -45), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase1-4",
      title: "Inventariseer spullen: wat neem je mee, verkoop of geef weg",
      category: "Huishouden",
      description: "Maak een lijst van wat je meeneemt, verkoopt of weggeeft.",
      deadline: adjustDeadline(addDays(movingDate, -40), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase1-5",
      title: "Vergelijk en kies energieleverancier",
      category: "Nutsvoorzieningen",
      description: "Vergelijk prijzen en voorwaarden van energieleveranciers en sluit een contract af.",
      deadline: adjustDeadline(addDays(movingDate, -30), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/energie/intro.aspx",
    },
    {
      id: "rent-phase1-6",
      title: "Regel verhuisbedrijf of helpers",
      category: "Verhuizing",
      description: "Boek een verhuisbedrijf of organiseer helpers.",
      deadline: adjustDeadline(addDays(movingDate, -30), 'urgent'),
      deadlineLabel: "Zo snel mogelijk",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.verhuisofferte.nl/",
    },
    {
      id: "rent-phase1-7",
      title: "Bestel verhuisdozen en verpakkingsmateriaal",
      category: "Verhuizing",
      description: "Bestel voldoende dozen, tape, bubbelfolie en markers.",
      deadline: adjustDeadline(addDays(movingDate, -28), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuisdozen.nl/",
    },
    {
      id: "rent-phase1-9",
      title: "Controleer inboedelverzekering; pas aan voor nieuwe woning",
      category: "Financieel",
      description: "Update je verzekeringen met het nieuwe adres.",
      deadline: adjustDeadline(addDays(movingDate, -30), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.independer.nl/inboedelverzekering/intro.aspx",
    },
    {
      id: "rent-phase1-10",
      title: "Controleer aansprakelijkheidsverzekering",
      category: "Financieel",
      description: "Zorg dat je aansprakelijkheidsverzekering ook geldt tijdens de verhuizing.",
      deadline: adjustDeadline(addDays(movingDate, -21), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 - Je nieuwe thuis is bevestigd",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 3,
      affiliateLink: "https://www.independer.nl/aansprakelijkheidsverzekering/intro.aspx",
    }
  );

  // FASE 2 – Voor sleuteloverdracht
  tasks.push(
    {
      id: "rent-phase2-1",
      title: "Zeg huidige huur schriftelijk op",
      category: "Administratie",
      description: "Stuur een opzegtermijn brief naar je huidige verhuurder.",
      deadline: adjustDeadline(addDays(movingDate, -60), 'urgent'),
      deadlineLabel: "Zo snel mogelijk",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase2-2",
      title: "Plan sleuteloverdracht en eindinspectie oude woning",
      category: "Administratie",
      description: "Maak een afspraak met je verhuurder voor de eindopname.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'urgent'),
      deadlineLabel: "Spoedig regelen",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase2-3",
      title: "Meld verhuizing bij gemeente",
      category: "Administratie",
      description: "Geef je nieuwe adres door aan de gemeente (verplicht binnen 5 dagen na verhuizing).",
      deadline: adjustDeadline(addDays(movingDate, -7), 'urgent'),
      deadlineLabel: "Voor verhuizing",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.rijksoverheid.nl/onderwerpen/verhuizen/vraag-en-antwoord/verhuizing-doorgeven-aan-gemeente",
    },
    {
      id: "rent-phase2-4",
      title: "Vraag PostNL doorstuurservice aan",
      category: "Administratie",
      description: "Activeer postdoorsturen naar je nieuwe adres.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://doorzenden.postnl.nl/van-naar#/van-naar",
    },
    {
      id: "rent-phase2-5",
      title: "Meld adreswijziging bij belangrijke instanties",
      category: "Administratie",
      description: "Update je adres bij belastingdienst, bank(en), zorgverzekering en overige verzekeringen.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://doorzenden.postnl.nl/van-naar#/van-naar",
    },
    {
      id: "rent-phase2-9",
      title: "Regel internet en telefoon voor nieuwe adres",
      category: "Nutsvoorzieningen",
      description: "Regel overzetten van internet en telefoon naar nieuwe adres.",
      deadline: adjustDeadline(addDays(movingDate, -21), 'urgent'),
      deadlineLabel: "Spoedig regelen",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <Wifi className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.independer.nl/internet/intro.aspx",
    },
    {
      id: "rent-phase2-12",
      title: "Informeer huisarts, tandarts, apotheek",
      category: "Administratie",
      description: "Meld adreswijziging bij medische instanties.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    }
  );

  // Alleen toevoegen als er kinderen zijn
  if (householdInfo && householdInfo.children > 0) {
    tasks.push({
      id: "rent-phase2-13",
      title: "Informeer school/kinderopvang",
      category: "Sociaal",
      description: "Meld adreswijziging bij school en kinderopvang.",
      deadline: addDays(movingDate, -21),
      deadlineLabel: "3 weken voor verhuizing",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 2,
    });
  }

  // Alleen toevoegen als er huisdieren zijn
  if (householdInfo && householdInfo.pets > 0) {
    tasks.push({
      id: "rent-phase2-13-pets",
      title: "Informeer dierenarts over verhuizing",
      category: "Administratie",
      description: "Meld je nieuwe adres bij de dierenarts.",
      deadline: addDays(movingDate, -14),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    });
  }

  tasks.push(
    {
      id: "rent-phase2-14",
      title: "Check afvalinzameling nieuw adres",
      category: "Huishouden",
      description: "Check de afvalregels in je nieuwe buurt.",
      deadline: addDays(movingDate, -14),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <Trash2 className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase2-15",
      title: "Regel parkeervergunning of verhuislift indien nodig",
      category: "Verhuizing",
      description: "Vraag parkeervergunning aan voor verhuiswagen of huur een verhuislift.",
      deadline: addDays(movingDate, -14),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.verhuislift-huren.nl/",
    },
    {
      id: "rent-phase2-16",
      title: "Vraag verhuisverlof aan bij werkgever",
      category: "Administratie",
      description: "Veel werkgevers geven bijzonder verlof voor verhuizing. Vraag dit op tijd aan.",
      deadline: addDays(movingDate, -14),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    }
  );

  // FASE 3 – Na sleuteloverdracht / voor verhuisdag
  tasks.push(
    {
      id: "rent-phase3-1",
      title: "Inspecteer nieuwe woning en maak foto's",
      category: "Huishouden",
      description: "Controleer de staat van muren, vloeren, ramen en deuren en maak foto's.",
      deadline: keyHandoverDate,
      deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 3 - Sleutels in handen",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase3-2",
      title: "Meet ruimtes voor meubels en indeling",
      category: "Inrichten",
      description: "Meet alle kamers op om te weten waar meubels passen.",
      deadline: addDays(keyHandoverDate, 2),
      deadlineLabel: "Direct na sleuteloverdracht",
      phase: "Fase 3 - Sleutels in handen",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase3-6",
      title: "Test elektra, water en verlichting",
      category: "Nutsvoorzieningen",
      description: "Test of alle voorzieningen werken in de nieuwe woning.",
      deadline: addDays(keyHandoverDate, 2),
      deadlineLabel: "Direct na sleuteloverdracht",
      phase: "Fase 3 - Sleutels in handen",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase3-7",
      title: "Plan schoonmaak of schilderwerk voor verhuisdag",
      category: "Schoonmaak",
      description: "Plan schoonmaak of schilderwerk voordat je verhuist.",
      deadline: addDays(movingDate, -5),
      deadlineLabel: "Voor verhuisdag",
      phase: "Fase 3 - Sleutels in handen",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.zoofy.nl/schoonmaak",
    },
    {
      id: "rent-phase3-9",
      title: "Bevestig verhuisbedrijf of helpers",
      category: "Verhuizing",
      description: "Bevestig de afspraak met je verhuisbedrijf of helpers.",
      deadline: addDays(movingDate, -3),
      deadlineLabel: "3 dagen voor verhuizing",
      phase: "Fase 3 - Sleutels in handen",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    }
  );

  // FASE 4 – Voor verhuisdag
  tasks.push(
    {
      id: "rent-phase4-1",
      title: "Ruim koelkast en diepvries leeg",
      category: "Huishouden",
      description: "Gebruik restjes op en ontdooi de vriezer.",
      deadline: addDays(movingDate, -2),
      deadlineLabel: "2 dagen voor verhuizing",
      phase: "Fase 4 - De laatste voorbereidingen",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase4-2",
      title: "Maak oude woning schoon",
      category: "Schoonmaak",
      description: "Maak keuken, badkamer en alle ruimtes schoon voor eindopname.",
      deadline: addDays(movingDate, -1),
      deadlineLabel: "1 dag voor verhuizing",
      phase: "Fase 4 - De laatste voorbereidingen",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://www.zoofy.nl/schoonmaak",
    },
    {
      id: "rent-phase4-5",
      title: "Pak laatste spullen in",
      category: "Huishouden",
      description: "Pak de laatste spullen in die je tot het laatst nodig had.",
      deadline: addDays(movingDate, -1),
      deadlineLabel: "1 dag voor verhuizing",
      phase: "Fase 4 - De laatste voorbereidingen",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 1,
    }
  );

  // FASE 5 – Sleuteloverdracht oude woning
  tasks.push(
    {
      id: "rent-phase5-1",
      title: "Sleuteloverdracht oude woning",
      category: "Administratie",
      description: "Lever de sleutels in bij je oude verhuurder.",
      deadline: keyHandoverDate,
      deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 5 - Afscheid van je oude plek",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase5-2",
      title: "Noteer meterstanden gas, water, elektra",
      category: "Nutsvoorzieningen",
      description: "Noteer alle meterstanden en maak foto's.",
      deadline: keyHandoverDate,
      deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 5 - Afscheid van je oude plek",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    }
  );

  // FASE 6 – Verhuisdag
  tasks.push(
    {
      id: "rent-phase6-1",
      title: "Transport naar nieuwe woning",
      category: "Verhuizing",
      description: "Verhuizen van meubels en dozen naar nieuwe woning.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 6 - De verhuisdag zelf",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase6-3",
      title: "Belangrijke spullen apart houden",
      category: "Huishouden",
      description: "Houd documenten, medicijnen en kleding bij de hand tijdens de verhuizing.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 6 - De verhuisdag zelf",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase6-4",
      title: "Controleer werking energie, water, internet",
      category: "Nutsvoorzieningen",
      description: "Test of alle voorzieningen werken in je nieuwe woning.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 6 - De verhuisdag zelf",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    }
  );

  // FASE 7 – Eerste week na verhuizing
  tasks.push(
    {
      id: "rent-phase7-3",
      title: "Zet basismeubels neer",
      category: "Inrichten",
      description: "Plaats bed, bank en tafel op hun plek.",
      deadline: addDays(movingDate, 1),
      deadlineLabel: "Direct na verhuizing",
      phase: "Fase 7 - Aankomen in je nieuwe thuis",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase7-4",
      title: "Pak dozen uit en organiseer spullen",
      category: "Huishouden",
      description: "Begin met het uitpakken van dozen.",
      deadline: addDays(movingDate, 3),
      deadlineLabel: "Paar dagen na verhuizing",
      phase: "Fase 7 - Aankomen in je nieuwe thuis",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase7-7",
      title: "Controleer rookmelders en veiligheidsvoorzieningen",
      category: "Huishouden",
      description: "Test alle veiligheidsvoorzieningen in je nieuwe woning.",
      deadline: addDays(movingDate, 3),
      deadlineLabel: "Paar dagen na verhuizing",
      phase: "Fase 7 - Aankomen in je nieuwe thuis",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=rookmelder",
    },
    {
      id: "rent-phase7-8",
      title: "Test huishoudelijke apparaten",
      category: "Huishouden",
      description: "Test of alle apparaten werken in de nieuwe woning.",
      deadline: addDays(movingDate, 2),
      deadlineLabel: "Paar dagen na verhuizing",
      phase: "Fase 7 - Aankomen in je nieuwe thuis",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    }
  );

  // VvE taken (alleen voor appartementen met VvE)
  if (householdInfo?.propertyType === "apartment" && householdInfo?.isVve) {
    tasks.push(
      {
        id: "rent-vve-1",
        title: "Meld verhuizing bij VvE",
        category: "Administratie",
        description: "Informeer de VvE over je verhuizing en nieuwe bewoning.",
        deadline: addDays(movingDate, -14),
        deadlineLabel: "2 weken voor verhuizing",
        phase: "Fase 2 - De voorbereidingen beginnen",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-vve-2",
        title: "VvE reglement opvragen en lezen",
        category: "Administratie",
        description: "Vraag het VvE reglement op en lees de huisregels.",
        deadline: addDays(keyHandoverDate, 7),
        deadlineLabel: "Eerste week",
        phase: "Fase 7 - Aankomen in je nieuwe thuis",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 3,
      }
    );
  }

  // Tuin taken (alleen als er een tuin is)
  if (householdInfo?.hasGarden) {
    tasks.push(
      {
        id: "rent-garden-1",
        title: "Plan tuinonderhoud voor nieuwe woning",
        category: "Huishouden",
        description: "Inventariseer wat er in de tuin moet gebeuren (snoeien, maaien, opruimen).",
        deadline: addDays(keyHandoverDate, 7),
        deadlineLabel: "Eerste week",
        phase: "Fase 7 - Aankomen in je nieuwe thuis",
        status: "todo",
        icon: <Home className="w-4 h-4" />,
        priority: 3,
      },
      {
        id: "rent-garden-2",
        title: "Tuingereedschap checken of aanschaffen",
        category: "Huishouden",
        description: "Controleer of je tuingereedschap hebt of koop wat je nodig hebt.",
        deadline: addDays(movingDate, 14),
        deadlineLabel: "2 weken na verhuizing",
        phase: "Fase 8 - Alles op orde",
        status: "todo",
        icon: <Home className="w-4 h-4" />,
        priority: 3,
        affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=tuingereedschap",
      }
    );
  }

  // Parkeren taken (alleen als er een parkeerplek is)
  if (householdInfo?.hasParking) {
    tasks.push({
      id: "rent-parking-1",
      title: "Parkeerplaats/garage sleutels ophalen",
      category: "Administratie",
      description: "Haal de sleutels of toegangspas voor je parkeerplek op.",
      deadline: keyHandoverDate,
      deadlineLabel: "Bij sleuteloverdracht",
      phase: "Fase 3 - Sleutels in handen",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 2,
    });
  }

  // Werkgever taken (alleen als iemand een baan heeft)
  if (householdInfo?.hasJob) {
    tasks.push({
      id: "rent-job-1",
      title: "Adreswijziging doorgeven aan werkgever",
      category: "Administratie",
      description: "Meld je nieuwe adres bij je werkgever voor salarisadministratie.",
      deadline: addDays(movingDate, -7),
      deadlineLabel: "1 week voor verhuizing",
      phase: "Fase 2 - De voorbereidingen beginnen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    });
  }

  // FASE 8 – Binnen eerste maand
  tasks.push(
    {
      id: "rent-phase8-1",
      title: "Betaal verhuisbedrijf en geef feedback",
      category: "Financieel",
      description: "Betaal de verhuizers en geef feedback over hun service.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 8 - Alles op orde",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-4",
      title: "Controleer gemeentelijke belastingen",
      category: "Financieel",
      description: "Check afvalstoffenheffing en waterbelasting.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Fase 8 - Alles op orde",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-6",
      title: "Meld adres bij overige instanties (pensioenfonds, RDW)",
      category: "Administratie",
      description: "Update je adres bij alle overige instanties.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Fase 8 - Alles op orde",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-7",
      title: "Ontmoet nieuwe buren",
      category: "Sociaal",
      description: "Maak kennis met je nieuwe buren.",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Binnen 2 weken na verhuizing",
      phase: "Fase 8 - Alles op orde",
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
          id: "reno-small-1",
          title: "Verfkleuren uitkiezen",
          category: "Verbouwing",
          description: "Kies verfkleuren voor de kamers die je wilt schilderen.",
          deadline: addDays(movingDate, -21),
          deadlineLabel: "3 weken voor verhuizing",
          phase: "Fase 1 - Je nieuwe thuis is bevestigd",
          status: "todo",
          icon: <PaintBucket className="w-4 h-4" />,
          priority: 2,
        },
        {
          id: "reno-small-2",
          title: "Materiaal inkopen voor klussen",
          category: "Verbouwing",
          description: "Koop verf, kwasten, afplaktape en ander benodigd materiaal.",
          deadline: addDays(movingDate, -14),
          deadlineLabel: "2 weken voor verhuizing",
          phase: "Fase 2 - De voorbereidingen beginnen",
          status: "todo",
          icon: <Package className="w-4 h-4" />,
          priority: 2,
          affiliateLink: "https://www.praxis.nl/",
        },
        {
          id: "reno-small-3",
          title: "Voer kleine klussen uit",
          category: "Verbouwing",
          description: "Schilder en voer andere kleine klussen uit.",
          deadline: addDays(keyHandoverDate, 5),
          deadlineLabel: "Week na sleuteloverdracht",
          phase: "Fase 3 - Sleutels in handen",
          status: "todo",
          icon: <Hammer className="w-4 h-4" />,
          priority: 1,
        }
      );
    }

    if (movingInfo.renovationType === "large") {
      tasks.push({
        id: "reno-large-1",
        title: "Verbouwingsplan maken",
        category: "Verbouwing",
        description: "Maak een gedetailleerd plan van wat er verbouwd moet worden.",
        deadline: addDays(movingDate, -90),
        deadlineLabel: "90 dagen voor verhuizing",
        phase: "Fase 1 - Je nieuwe thuis is bevestigd",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 1,
      });

      if (movingInfo.needsContractorHelp) {
        tasks.push(
          {
            id: "reno-large-2",
            title: "Aannemers vergelijken en selecteren",
            category: "Verbouwing",
            description: "Haal offertes op bij minimaal 3 aannemers en selecteer de beste optie.",
            deadline: addDays(movingDate, -75),
            deadlineLabel: "75 dagen voor verhuizing",
            phase: "Fase 1 - Je nieuwe thuis is bevestigd",
            status: "todo",
            icon: <Users className="w-4 h-4" />,
            priority: 1,
            affiliateLink: "https://www.werkspot.nl/",
          },
          {
            id: "reno-large-3",
            title: "Contract met aannemer tekenen",
            category: "Verbouwing",
            description: "Onderteken het contract met de gekozen aannemer.",
            deadline: addDays(movingDate, -60),
            deadlineLabel: "60 dagen voor verhuizing",
            phase: "Fase 1 - Je nieuwe thuis is bevestigd",
            status: "todo",
            icon: <FileText className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "reno-large-4",
            title: "Start verbouwing en houd contact met aannemer",
            category: "Verbouwing",
            description: "Start de verbouwing en volg de voortgang.",
            deadline: addDays(keyHandoverDate, 7),
            deadlineLabel: "1 week na sleuteloverdracht",
            phase: "Fase 3 - Sleutels in handen",
            status: "todo",
            icon: <Hammer className="w-4 h-4" />,
            priority: 1,
          }
        );
      } else {
        tasks.push(
          {
            id: "reno-large-diy-1",
            title: "Materialen voor grote verbouwing inkopen",
            category: "Verbouwing",
            description: "Koop alle benodigde materialen voor de verbouwing.",
            deadline: addDays(movingDate, -30),
            deadlineLabel: "30 dagen voor verhuizing",
            phase: "Fase 2 - De voorbereidingen beginnen",
            status: "todo",
            icon: <Package className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "reno-large-diy-2",
            title: "Voer verbouwing uit",
            category: "Verbouwing",
            description: "Voer de verbouwing stap voor stap uit.",
            deadline: addDays(keyHandoverDate, 14),
            deadlineLabel: "2 weken na sleuteloverdracht",
            phase: "Fase 3 - Sleutels in handen",
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
