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
  Clock,
  Users,
  MapPin,
  Euro,
  ClipboardCheck,
  Sparkles,
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
  affiliateLink?: string;
  icon: React.ReactNode;
  priority: number; // 1 = hoogste prioriteit
};

export const generateTasksForRenter = (movingInfo: MovingInfo): Task[] => {
  const movingDate = new Date(movingInfo.movingDate);
  const keyHandoverDate = movingInfo.keyHandoverDate 
    ? new Date(movingInfo.keyHandoverDate) 
    : new Date(movingDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Default: 1 week voor verhuisdatum
  
  const now = new Date();
  const daysUntilMove = Math.ceil((movingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Helper functie om datum te berekenen
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const tasks: Task[] = [];

  // FASE 1: Lang voor verhuisdatum (>30 dagen)
  if (daysUntilMove > 30 || daysUntilMove < 0) {
    tasks.push(
      {
        id: "rent-1",
        title: "Huurcontract nieuwe woning tekenen",
        category: "Administratie",
        description: "Lees het contract grondig door en teken deze bij verhuurder of makelaar.",
        deadline: addDays(movingDate, -45),
        deadlineLabel: "45 dagen voor verhuizing",
        phase: "Voorbereiding",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 1,
      },
      {
        id: "rent-2",
        title: "Opzegging huidige huurwoning",
        category: "Administratie",
        description: "Geef schriftelijk opzegging aan je huidige verhuurder (let op opzegtermijn!).",
        deadline: addDays(movingDate, -60),
        deadlineLabel: "60 dagen voor verhuizing",
        phase: "Voorbereiding",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 1,
      },
      {
        id: "rent-3",
        title: "Borg betalen nieuwe woning",
        category: "Financieel",
        description: "Betaal de borgsom voor je nieuwe huurwoning (meestal 1-2 maanden huur).",
        deadline: addDays(movingDate, -30),
        deadlineLabel: "30 dagen voor verhuizing",
        phase: "Voorbereiding",
        status: "todo",
        icon: <Euro className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-4",
        title: "Verhuisbudget bepalen",
        category: "Financieel",
        description: "Maak een overzicht van alle verhuiskosten: borg, verhuisbedrijf, materialen, etc.",
        deadline: addDays(movingDate, -45),
        deadlineLabel: "45 dagen voor verhuizing",
        phase: "Voorbereiding",
        status: "todo",
        icon: <Euro className="w-4 h-4" />,
        priority: 3,
      }
    );
  }

  // FASE 2: 4-30 dagen voor verhuisdatum
  if (daysUntilMove <= 30 && daysUntilMove > 4) {
    tasks.push(
      {
        id: "rent-5",
        title: "Energiecontract afsluiten",
        category: "Nutsvoorzieningen",
        description: "Vergelijk energieleveranciers en sluit een contract af voor je nieuwe adres.",
        deadline: addDays(movingDate, -14),
        deadlineLabel: "2 weken voor verhuizing",
        phase: "Regelen",
        status: "todo",
        affiliateLink: "https://example.com/energie",
        icon: <Zap className="w-4 h-4" />,
        priority: 1,
      },
      {
        id: "rent-6",
        title: "Wateraansluiting regelen",
        category: "Nutsvoorzieningen",
        description: "Meld je nieuwe adres aan bij het waterbedrijf.",
        deadline: addDays(movingDate, -14),
        deadlineLabel: "2 weken voor verhuizing",
        phase: "Regelen",
        status: "todo",
        icon: <Home className="w-4 h-4" />,
        priority: 1,
      },
      {
        id: "rent-7",
        title: "Internet en TV regelen",
        category: "Diensten",
        description: "Kies een internetprovider en plan de installatie voor na de verhuizing.",
        deadline: addDays(movingDate, -21),
        deadlineLabel: "3 weken voor verhuizing",
        phase: "Regelen",
        status: "todo",
        affiliateLink: "https://example.com/internet",
        icon: <Wifi className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-8",
        title: "Inboedelverzekering checken",
        category: "Verzekeringen",
        description: "Update je verzekering met het nieuwe adres en controleer of de dekking voldoende is.",
        deadline: addDays(movingDate, -14),
        deadlineLabel: "2 weken voor verhuizing",
        phase: "Regelen",
        status: "todo",
        affiliateLink: "https://example.com/verzekering",
        icon: <Shield className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-9",
        title: "PostNL doorstuurservice activeren",
        category: "Post",
        description: "Laat je post automatisch doorsturen naar je nieuwe adres voor 6-12 maanden.",
        deadline: addDays(movingDate, -7),
        deadlineLabel: "1 week voor verhuizing",
        phase: "Regelen",
        status: "todo",
        affiliateLink: "https://example.com/postnl",
        icon: <Mail className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-10",
        title: "Verhuisdozen bestellen",
        category: "Verhuizing",
        description: "Bestel voldoende verhuisdozen, tape, bubbelfolie en markers.",
        deadline: addDays(movingDate, -21),
        deadlineLabel: "3 weken voor verhuizing",
        phase: "Regelen",
        status: "todo",
        affiliateLink: "https://example.com/dozen",
        icon: <Package className="w-4 h-4" />,
        priority: 3,
      },
      {
        id: "rent-11",
        title: "Verhuisbedrijf of helpers regelen",
        category: "Verhuizing",
        description: "Boek een verhuisbedrijf of vraag vrienden/familie om te helpen.",
        deadline: addDays(movingDate, -28),
        deadlineLabel: "4 weken voor verhuizing",
        phase: "Regelen",
        status: "todo",
        affiliateLink: "https://example.com/verhuizers",
        icon: <Truck className="w-4 h-4" />,
        priority: 1,
      }
    );
  }

  // FASE 3: 2 weken voor verhuisdatum
  if (daysUntilMove <= 14 && daysUntilMove > 4) {
    tasks.push(
      {
        id: "rent-12",
        title: "Abonnementen aanpassen",
        category: "Administratie",
        description: "Update je adres bij: sportschool, streamingdiensten, vakbladen, etc.",
        deadline: addDays(movingDate, -10),
        deadlineLabel: "10 dagen voor verhuizing",
        phase: "Voorbereiden",
        status: "todo",
        icon: <ClipboardCheck className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-13",
        title: "Beginnen met inpakken",
        category: "Verhuizing",
        description: "Start met het inpakken van spullen die je niet dagelijks nodig hebt.",
        deadline: addDays(movingDate, -14),
        deadlineLabel: "2 weken voor verhuizing",
        phase: "Voorbereiden",
        status: "todo",
        icon: <Package className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-14",
        title: "Sleuteloverdracht oude woning plannen",
        category: "Administratie",
        description: "Maak een afspraak met verhuurder voor eindopname en sleutelinlevering.",
        deadline: keyHandoverDate,
        deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
        phase: "Voorbereiden",
        status: "todo",
        icon: <Key className="w-4 h-4" />,
        priority: 1,
      }
    );
  }

  // FASE 4: 1 week voor verhuisdatum
  if (daysUntilMove <= 7 && daysUntilMove >= 0) {
    tasks.push(
      {
        id: "rent-15",
        title: "Belangrijke documenten verzamelen",
        category: "Administratie",
        description: "Leg paspoorten, rijbewijzen, contracten en andere documenten apart.",
        deadline: addDays(movingDate, -3),
        deadlineLabel: "3 dagen voor verhuizing",
        phase: "Laatste voorbereidingen",
        status: "todo",
        icon: <FileText className="w-4 h-4" />,
        priority: 1,
      },
      {
        id: "rent-16",
        title: "Koelkast en diepvries leegruimen",
        category: "Huishouden",
        description: "Gebruik restjes op en ontdooi de vriezer 24 uur voor de verhuizing.",
        deadline: addDays(movingDate, -2),
        deadlineLabel: "2 dagen voor verhuizing",
        phase: "Laatste voorbereidingen",
        status: "todo",
        icon: <Home className="w-4 h-4" />,
        priority: 2,
      },
      {
        id: "rent-17",
        title: "Kleine reparaties uitvoeren",
        category: "Huishouden",
        description: "Vul gaatjes in muren, repareer eventuele schade in oude woning.",
        deadline: addDays(movingDate, -5),
        deadlineLabel: "5 dagen voor verhuizing",
        phase: "Laatste voorbereidingen",
        status: "todo",
        icon: <Home className="w-4 h-4" />,
        priority: 3,
      },
      {
        id: "rent-18",
        title: "Schoonmaak voorbereiden",
        category: "Schoonmaak",
        description: "Koop schoonmaakmiddelen of boek schoonmaakdienst voor oude woning.",
        deadline: addDays(movingDate, -7),
        deadlineLabel: "1 week voor verhuizing",
        phase: "Laatste voorbereidingen",
        status: "todo",
        affiliateLink: "https://example.com/schoonmaak",
        icon: <Sparkles className="w-4 h-4" />,
        priority: 2,
      }
    );
  }

  // FASE 5: Sleuteloverdracht (meestal voor verhuisdag)
  tasks.push({
    id: "rent-19",
    title: "Oude woning eindopname",
    category: "Administratie",
    description: "Loop met verhuurder door de woning en maak foto's van de staat.",
    deadline: keyHandoverDate,
    deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
    phase: "Sleuteloverdracht",
    status: "todo",
    icon: <ClipboardCheck className="w-4 h-4" />,
    priority: 1,
  });

  tasks.push({
    id: "rent-20",
    title: "Meterstanden opnemen oude woning",
    category: "Nutsvoorzieningen",
    description: "Noteer meterstanden van gas, water en elektra en maak foto's.",
    deadline: keyHandoverDate,
    deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
    phase: "Sleuteloverdracht",
    status: "todo",
    icon: <Zap className="w-4 h-4" />,
    priority: 1,
  });

  tasks.push({
    id: "rent-21",
    title: "Sleutels inleveren oude woning",
    category: "Administratie",
    description: "Lever alle sleutels in bij verhuurder en ontvang bevestiging.",
    deadline: keyHandoverDate,
    deadlineLabel: `Op ${keyHandoverDate.toLocaleDateString("nl-NL")}`,
    phase: "Sleuteloverdracht",
    status: "todo",
    icon: <Key className="w-4 h-4" />,
    priority: 1,
  });

  // FASE 6: Verhuisdag
  tasks.push(
    {
      id: "rent-22",
      title: "Verhuizen",
      category: "Verhuizing",
      description: "Verhuizen van meubels en dozen naar nieuwe woning.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Truck className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-23",
      title: "Meterstanden opnemen nieuwe woning",
      category: "Nutsvoorzieningen",
      description: "Noteer meterstanden van gas, water en elektra in je nieuwe woning.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-24",
      title: "Basisschoonmaak nieuwe woning",
      category: "Schoonmaak",
      description: "Doe een snelle schoonmaak voordat je meubels neerzet.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-25",
      title: "Belangrijke spullen apart houden",
      category: "Huishouden",
      description: "Houd essentials bij de hand: telefoonlader, toiletspullen, koffie/thee, etc.",
      deadline: movingDate,
      deadlineLabel: `Op ${movingDate.toLocaleDateString("nl-NL")}`,
      phase: "Verhuisdag",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    }
  );

  // FASE 7: Eerste week na verhuisdag
  tasks.push(
    {
      id: "rent-26",
      title: "Nutsvoorzieningen controleren",
      category: "Nutsvoorzieningen",
      description: "Test of gas, water, elektra en internet werken zoals verwacht.",
      deadline: addDays(movingDate, 2),
      deadlineLabel: "2 dagen na verhuizing",
      phase: "Settelen",
      status: "todo",
      icon: <Zap className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-27",
      title: "Adreswijziging gemeente",
      category: "Administratie",
      description: "Geef je nieuwe adres door aan gemeente binnen 5 dagen na verhuizing.",
      deadline: addDays(movingDate, 5),
      deadlineLabel: "Binnen 5 dagen na verhuizing",
      phase: "Settelen",
      status: "todo",
      icon: <MapPin className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-28",
      title: "Belangrijke instanties informeren",
      category: "Administratie",
      description: "Update je adres bij: werkgever, bank, zorgverzekeraar, belastingdienst.",
      deadline: addDays(movingDate, 7),
      deadlineLabel: "Binnen 1 week na verhuizing",
      phase: "Settelen",
      status: "todo",
      icon: <FileText className="w-4 h-4" />,
      priority: 1,
    },
    {
      id: "rent-29",
      title: "Basismeubels neerzetten",
      category: "Inrichten",
      description: "Zet bed, bank, tafel en andere essentiële meubels op hun plek.",
      deadline: addDays(movingDate, 2),
      deadlineLabel: "2 dagen na verhuizing",
      phase: "Settelen",
      status: "todo",
      icon: <Home className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-30",
      title: "Dozen uitpakken starten",
      category: "Inrichten",
      description: "Begin met het uitpakken van dozen, start met de meest gebruikte kamers.",
      deadline: addDays(movingDate, 3),
      deadlineLabel: "3 dagen na verhuizing",
      phase: "Settelen",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 3,
    }
  );

  // FASE 8: Binnen eerste maand
  tasks.push(
    {
      id: "rent-31",
      title: "Alle dozen uitpakken",
      category: "Inrichten",
      description: "Pak alle resterende dozen uit en ruim alles op zijn plek.",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Binnen 2 weken na verhuizing",
      phase: "Afronden",
      status: "todo",
      icon: <Package className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-32",
      title: "Administratie afronden",
      category: "Administratie",
      description: "Check of alle adreswijzigingen zijn doorgevoerd en contracten zijn getekend.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Afronden",
      status: "todo",
      icon: <ClipboardCheck className="w-4 h-4" />,
      priority: 2,
    },
    {
      id: "rent-33",
      title: "Buren ontmoeten",
      category: "Sociaal",
      description: "Stel je voor bij je nieuwe buren, dit bevordert een goede buurt.",
      deadline: addDays(movingDate, 14),
      deadlineLabel: "Binnen 2 weken na verhuizing",
      phase: "Afronden",
      status: "todo",
      icon: <Users className="w-4 h-4" />,
      priority: 3,
    },
    {
      id: "rent-34",
      title: "Woning definitief inrichten",
      category: "Inrichten",
      description: "Hang schilderijen, plaats decoraties en maak het echt van jou.",
      deadline: addDays(movingDate, 30),
      deadlineLabel: "Binnen 1 maand na verhuizing",
      phase: "Afronden",
      status: "todo",
      icon: <Sparkles className="w-4 h-4" />,
      priority: 3,
    }
  );

  // Sorteer taken op deadline
  return tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
};
