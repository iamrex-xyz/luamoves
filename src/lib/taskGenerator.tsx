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
  
  // Smart deadline adjuster: geeft verlopen taken een realistische nieuwe deadline
  const adjustDeadline = (originalDeadline: Date, urgencyLevel: 'urgent' | 'normal' | 'later') => {
    // Als de deadline in de toekomst ligt, gebruik die gewoon
    if (originalDeadline >= today) {
      return originalDeadline;
    }
    
    // Als de deadline al voorbij is, pas aan op basis van urgentie
    switch (urgencyLevel) {
      case 'urgent':
        // Zeer dringende taken: binnen 2 dagen
        return addDays(today, 2);
      case 'normal':
        // Normale taken: binnen 5 dagen
        return addDays(today, 5);
      case 'later':
        // Minder urgente taken: binnen 7 dagen
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
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
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
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
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
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
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
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase1-5",
      title: "Selecteer wat je wilt weggeven (aan goede doelen)",
      category: "Huishouden",
      description: "Selecteer items om weg te geven aan goede doelen.",
      deadline: adjustDeadline(addDays(movingDate, -35), 'later'),
      deadlineLabel: "Volgende week",
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase1-6",
      title: "Regel verhuisbedrijf",
      category: "Verhuizing",
      description: "Boek een verhuisbedrijf of organiseer helpers.",
      deadline: adjustDeadline(addDays(movingDate, -30), 'urgent'),
      deadlineLabel: "Zo snel mogelijk",
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://example.com/verhuizers",
    },
    {
      id: "rent-phase1-7",
      title: "Bestel verhuisdozen en verpakkingsmateriaal",
      category: "Verhuizing",
      description: "Bestel voldoende dozen, tape, bubbelfolie en markers.",
      deadline: adjustDeadline(addDays(movingDate, -28), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://example.com/dozen",
    },
    {
      id: "rent-phase1-8",
      title: "Controleer meubels/apparatuur op bruikbaarheid/ verkoop of donatie",
      category: "Huishouden",
      description: "Check welke meubels en apparaten mee kunnen naar de nieuwe woning.",
      deadline: adjustDeadline(addDays(movingDate, -30), 'later'),
      deadlineLabel: "Volgende week",
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase1-9",
      title: "Controleer huurders- en inboedelverzekering; pas eventueel aan",
      category: "Financieel",
      description: "Update je verzekeringen met het nieuwe adres.",
      deadline: adjustDeadline(addDays(movingDate, -30), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 1 – Na akkoord nieuwe huurwoning",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://example.com/verzekering",
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
      phase: "Fase 2 – Voor sleuteloverdracht",
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
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase2-3",
      title: "Meld verhuizing bij gemeente",
      category: "Administratie",
      description: "Geef je nieuwe adres door aan de gemeente.",
      deadline: adjustDeadline(addDays(movingDate, -7), 'urgent'),
      deadlineLabel: "Voor verhuizing",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase2-4",
      title: "Vraag PostNL doorstuurservice aan",
      category: "Administratie",
      description: "Activeer postdoorsturen naar je nieuwe adres.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://example.com/postnl",
    },
    {
      id: "rent-phase2-5",
      title: "Meld adreswijziging bij belastingdienst",
      category: "Administratie",
      description: "Update je adres bij de belastingdienst.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase2-6",
      title: "Meld adreswijziging bij bank(en)",
      category: "Administratie",
      description: "Update je adres bij al je bankrekeningen.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase2-7",
      title: "Meld adreswijziging bij zorgverzekering",
      category: "Administratie",
      description: "Update je adres bij je zorgverzekeraar.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase2-8",
      title: "Meld adreswijziging bij overige verzekeringen",
      category: "Administratie",
      description: "Update adres bij auto-, reis- en aansprakelijkheidsverzekeringen.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase2-9",
      title: "Meld adreswijziging bij telefoon- en internetprovider",
      category: "Nutsvoorzieningen",
      description: "Regel overzetten van internet en telefoon naar nieuwe adres.",
      deadline: adjustDeadline(addDays(movingDate, -21), 'urgent'),
      deadlineLabel: "Spoedig regelen",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Wifi className="w-4 h-4" />,
      priority: 1,
      affiliateLink: "https://example.com/internet",
    },
    {
      id: "rent-phase2-10",
      title: "Informeer abonnementen en lidmaatschappen",
      category: "Administratie",
      description: "Update adres bij streamingdiensten, vakbladen, etc.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'later'),
      deadlineLabel: "Volgende week",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase2-11",
      title: "Informeer sportclubs/ sportabonnementen",
      category: "Sociaal",
      description: "Meld je nieuwe adres bij je sportschool of vereniging.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'later'),
      deadlineLabel: "Volgende week",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase2-12",
      title: "Informeer huisarts, tandarts, apotheek",
      category: "Administratie",
      description: "Meld adreswijziging bij medische instanties.",
      deadline: adjustDeadline(addDays(movingDate, -14), 'normal'),
      deadlineLabel: "Binnenkort",
      phase: "Fase 2 – Voor sleuteloverdracht",
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
      phase: "Fase 2 – Voor sleuteloverdracht",
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
      description: "Meld je nieuwe adres bij de dierenarts en vraag om overzetten van medisch dossier.",
      deadline: addDays(movingDate, -14),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    });
  }

  tasks.push(
    {
      id: "rent-phase2-14",
      title: "Controleer afvalinzameling/ gemeente afvalregels nieuw adres",
      category: "Sociaal",
      description: "Check de afvalregels in je nieuwe buurt.",
      deadline: addDays(movingDate, -14),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Trash2 className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase2-15",
      title: "Regel parkeervergunning of verhuislift indien nodig",
      category: "Verhuizing",
      description: "Vraag parkeervergunning aan voor verhuiswagen indien nodig.",
      deadline: addDays(movingDate, -14),
      deadlineLabel: "2 weken voor verhuizing",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase2-16",
      title: "Kleine reparaties uitvoeren in oude woning indien verhuurder vereist",
      category: "Huishouden",
      description: "Voer kleine reparaties uit die de verhuurder vraagt.",
      deadline: addDays(movingDate, -7),
      deadlineLabel: "1 week voor verhuizing",
      phase: "Fase 2 – Voor sleuteloverdracht",
      status: "todo",
      icon: <Hammer className="w-4 h-4" />,
      priority: 2,
    }
  );

  // FASE 3 – Na sleuteloverdracht / voor verhuisdag
  tasks.push(
    {
      id: "rent-phase3-1",
      title: "Controleer de staat van muren, vloeren, ramen en deuren",
      category: "Huishouden",
      description: "Inspecteer de nieuwe woning grondig en maak foto's.",
      deadline: keyHandoverDate,
      deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
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
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase3-3",
      title: "Bepaal verbouw- of aanpassingswerkzaamheden",
      category: "Inrichten / Huishouden",
      description: "Besluit welke aanpassingen je wilt maken voor de verhuizing.",
      deadline: addDays(keyHandoverDate, 3),
      deadlineLabel: "Paar dagen na sleuteloverdracht",
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
      status: "todo",
      icon: <Hammer className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase3-4",
      title: "Zoek aannemer of klusbedrijf voor eventuele verbouwing",
      category: "Inrichten / Verhuizing",
      description: "Vind een betrouwbare aannemer voor verbouwingen.",
      deadline: addDays(keyHandoverDate, 5),
      deadlineLabel: "Week na sleuteloverdracht",
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
      status: "todo",
      icon: <Hammer className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase3-5",
      title: "Plan en bespreek verbouwplannen met aannemer",
      category: "Inrichten / Verhuizing",
      description: "Maak concrete afspraken over de verbouwing.",
      deadline: addDays(keyHandoverDate, 7),
      deadlineLabel: "Week na sleuteloverdracht",
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase3-6",
      title: "Controleer elektra, waterpunten, stopcontacten en verlichting",
      category: "Nutsvoorzieningen",
      description: "Test of alle voorzieningen werken in de nieuwe woning.",
      deadline: addDays(keyHandoverDate, 2),
      deadlineLabel: "Direct na sleuteloverdracht",
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
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
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
      affiliateLink: "https://example.com/schoonmaak",
    },
    {
      id: "rent-phase3-8",
      title: "Bestel aanvullende materialen (verf, vloerbedekking, lampen, gordijnen)",
      category: "Inrichten",
      description: "Bestel alle benodigde materialen voor de inrichting.",
      deadline: addDays(movingDate, -10),
      deadlineLabel: "10 dagen voor verhuizing",
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
      status: "todo",
      icon: <PaintBucket className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase3-9",
      title: "Controleer dat verhuisbedrijf of helpers nog beschikbaar zijn",
      category: "Verhuizing",
      description: "Bevestig de afspraak met je verhuisbedrijf of helpers.",
      deadline: addDays(movingDate, -3),
      deadlineLabel: "3 dagen voor verhuizing",
      phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
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
      phase: "Fase 4 – Voor verhuisdag",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase4-2",
      title: "Schoonmaken van keukenapparatuur en kasten in oude woning",
      category: "Schoonmaak",
      description: "Maak de keuken grondig schoon in je oude woning.",
      deadline: addDays(movingDate, -1),
      deadlineLabel: "1 dag voor verhuizing",
      phase: "Fase 4 – Voor verhuisdag",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase4-3",
      title: "Schoonmaken badkamer, toilet en overige ruimtes in oude woning",
      category: "Schoonmaak",
      description: "Maak alle ruimtes schoon voor de eindopname.",
      deadline: addDays(movingDate, -1),
      deadlineLabel: "1 dag voor verhuizing",
      phase: "Fase 4 – Voor verhuisdag",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase4-4",
      title: "Bevestig verhuisafspraken met helpers of verhuisbedrijf",
      category: "Verhuizing",
      description: "Bevestig nog een keer de verhuisafspraak.",
      deadline: addDays(movingDate, -1),
      deadlineLabel: "1 dag voor verhuizing",
      phase: "Fase 4 – Voor verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase4-5",
      title: "Pak resterende spullen in",
      category: "Huishouden",
      description: "Pak de laatste spullen in die je tot het laatst nodig had.",
      deadline: addDays(movingDate, -1),
      deadlineLabel: "1 dag voor verhuizing",
      phase: "Fase 4 – Voor verhuisdag",
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
      phase: "Fase 5 – Sleuteloverdracht oude woning",
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
      phase: "Fase 5 – Sleuteloverdracht oude woning",
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
      phase: "Fase 6 – Verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase6-2",
      title: "Basis schoonmaak nieuwe woning",
      category: "Schoonmaak",
      description: "Doe een snelle schoonmaak voordat je meubels neerzet.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 6 – Verhuisdag",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase6-3",
      title: "Belangrijke spullen apart houden (documenten, medicijnen, kleding)",
      category: "Huishouden",
      description: "Houd essentials bij de hand tijdens de verhuizing.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Fase 6 – Verhuisdag",
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
      phase: "Fase 6 – Verhuisdag",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    }
  );

  // FASE 7 – Eerste week na verhuizing
  tasks.push(
    {
      id: "rent-phase7-1",
      title: "Controleer PostNL doorstuurservice en ontvang eerste post",
      category: "Administratie",
      description: "Check of de postdoorsturen goed werkt.",
      deadline: addDays(movingDate, 3),
      deadlineLabel: "Paar dagen na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase7-2",
      title: "Meld adreswijziging bij buren / vrienden / familie",
      category: "Sociaal",
      description: "Informeer je sociale kring over je nieuwe adres.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase7-3",
      title: "Zet basismeubels neer in nieuwe woning",
      category: "Inrichten",
      description: "Plaats bed, bank en tafel op hun plek.",
      deadline: addDays(movingDate, 1),
      deadlineLabel: "Direct na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
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
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase7-5",
      title: "Controleer dat alle abonnementen, lidmaatschappen en verzekeringen actief zijn op nieuw adres",
      category: "Administratie",
      description: "Verifieer dat alle diensten correct zijn overgezet.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase7-6",
      title: "Controleer openstaande rekeningen en nutsvoorzieningen",
      category: "Financieel",
      description: "Check of alle betalingen correct verlopen.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase7-7",
      title: "Controleer rookmelders, sloten en veiligheidsvoorzieningen",
      category: "Huishouden",
      description: "Test alle veiligheidsvoorzieningen in je nieuwe woning.",
      deadline: addDays(movingDate, 3),
      deadlineLabel: "Paar dagen na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-phase7-8",
      title: "Controleer werking huishoudelijke apparaten",
      category: "Huishouden",
      description: "Test of alle apparaten werken in de nieuwe woning.",
      deadline: addDays(movingDate, 2),
      deadlineLabel: "Paar dagen na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase7-9",
      title: "Controleer sloten en extra sleutels regelen indien nodig",
      category: "Huishouden",
      description: "Zorg ervoor dat je genoeg sleutels hebt en dat ze werken.",
      deadline: addDays(movingDate, 5),
      deadlineLabel: "Paar dagen na verhuizing",
      phase: "Fase 7 – Eerste week na verhuizing",
      status: "todo",
      icon: <Key className="w-4 h-4" />,
      priority: 2,
    }
  );

  // FASE 8 – Binnen eerste maand
  tasks.push(
    {
      id: "rent-phase8-1",
      title: "Finaliseer betalingen en feedback voor verhuisbedrijf",
      category: "Financieel",
      description: "Betaal de verhuizers en geef feedback over hun service.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-2",
      title: "Richt woning definitief in (meubels, decoratie, keuken, verlichting, accessoires)",
      category: "Inrichten",
      description: "Maak je woning helemaal af met decoratie en inrichting.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase8-3",
      title: "Controleer brievenbus / postvak / pakketvoorzieningen",
      category: "Administratie",
      description: "Zorg dat je weet hoe post en pakketten worden bezorgd.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Mail className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-4",
      title: "Controleer gemeentelijke belastingen / afvalstoffenheffing / waterbelasting",
      category: "Financieel",
      description: "Check welke gemeentelijke belastingen je moet betalen.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Euro className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-5",
      title: "Eventueel nieuwe verzekeringen afsluiten voor nieuwe situatie",
      category: "Financieel",
      description: "Overweeg of je extra verzekeringen nodig hebt.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Shield className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase8-6",
      title: "Meld nieuwe adres bij overige instanties zoals pensioenfonds, CAK, RDW (auto)",
      category: "Administratie",
      description: "Update je adres bij alle overige instanties.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-7",
      title: "Ontmoet nieuwe buren / leer buurtregels kennen",
      category: "Sociaal",
      description: "Maak kennis met je nieuwe buren.",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Binnen 2 weken na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase8-8",
      title: "Controleer wifi, smart-tv, smart home apparaten installeren",
      category: "Nutsvoorzieningen / Inrichten",
      description: "Installeer en configureer al je smart devices.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Wifi className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-phase8-9",
      title: "Controleer verlichting, gordijnen en zonwering",
      category: "Inrichten",
      description: "Hang gordijnen en zorg voor goede verlichting.",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Binnen 2 weken na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-phase8-10",
      title: "Controleer meubels en interieur op beschadigingen na verhuizing",
      category: "Inrichten",
      description: "Check of alles de verhuizing goed heeft doorstaan.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Fase 8 – Binnen eerste maand",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
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
          phase: "Fase 1 – Na akkoord nieuwe huurwoning",
          status: "todo",
          icon: <PaintBucket className="w-4 h-4" />,
          priority: 2,
        },
        {
          id: "reno-small-2",
          title: "Materiaal inkopen voor kleine klussen",
          category: "Verbouwing",
          description: "Koop verf, kwasten, afplaktape en ander benodigd materiaal.",
          deadline: addDays(movingDate, -14),
          deadlineLabel: "2 weken voor verhuizing",
          phase: "Fase 2 – Voor sleuteloverdracht",
          status: "todo",
          icon: <Package className="w-4 h-4" />,
          priority: 2,
        },
        {
          id: "reno-small-3",
          title: "Voer kleine klussen uit",
          category: "Verbouwing",
          description: "Schilder en voer andere kleine klussen uit na sleuteloverdracht.",
          deadline: addDays(keyHandoverDate, 5),
          deadlineLabel: "Week na sleuteloverdracht",
          phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
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
        phase: "Fase 1 – Na akkoord nieuwe huurwoning",
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
            phase: "Fase 1 – Na akkoord nieuwe huurwoning",
            status: "todo",
            icon: <Users className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "reno-large-3",
            title: "Contract met aannemer tekenen",
            category: "Verbouwing",
            description: "Onderteken het contract met de gekozen aannemer.",
            deadline: addDays(movingDate, -60),
            deadlineLabel: "60 dagen voor verhuizing",
            phase: "Fase 1 – Na akkoord nieuwe huurwoning",
            status: "todo",
            icon: <FileText className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "reno-large-4",
            title: "Start verbouwing met aannemer",
            category: "Verbouwing",
            description: "De aannemer start met de verbouwingswerkzaamheden.",
            deadline: addDays(keyHandoverDate, 1),
            deadlineLabel: "Na sleuteloverdracht",
            phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
            status: "todo",
            icon: <Hammer className="w-4 h-4" />,
            priority: 1,
          }
        );
      } else {
        tasks.push(
          {
            id: "reno-large-5",
            title: "Materialen en gereedschap organiseren",
            category: "Verbouwing",
            description: "Maak een lijst van alle benodigde materialen en gereedschap.",
            deadline: addDays(movingDate, -45),
            deadlineLabel: "45 dagen voor verhuizing",
            phase: "Fase 1 – Na akkoord nieuwe huurwoning",
            status: "todo",
            icon: <Package className="w-4 h-4" />,
            priority: 1,
          },
          {
            id: "reno-large-6",
            title: "Start verbouwing zelf",
            category: "Verbouwing",
            description: "Begin met de verbouwingswerkzaamheden volgens je plan.",
            deadline: addDays(keyHandoverDate, 1),
            deadlineLabel: "Na sleuteloverdracht",
            phase: "Fase 3 – Na sleuteloverdracht / voor verhuisdag",
            status: "todo",
            icon: <Hammer className="w-4 h-4" />,
            priority: 1,
          }
        );
      }

      tasks.push({
        id: "reno-large-7",
        title: "Verbouwing afronden",
        category: "Verbouwing",
        description: "Zorg dat de verbouwing afgerond is.",
        deadline: addDays(movingDate, 7),
        deadlineLabel: "1 week na verhuizing",
        phase: "Fase 7 – Eerste week na verhuizing",
        status: "todo",
        icon: <ClipboardCheck className="w-4 h-4" />,
        priority: 1,
      });
    }
  }

  return tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
};