import type { ChatMessage } from "@/components/WhatsAppChat";

export type LuaExample = {
  label: string;
  desc: string;
  persona?: string;
  messages: ChatMessage[];
};

export type LuaExampleCategory = {
  id: string;
  title: string;
  intro: string;
  examples: LuaExample[];
};

export const luaExampleCategories: LuaExampleCategory[] = [
  {
    id: "verhuizen",
    title: "Verhuizen",
    intro: "Offertes, verhuislift, parkeervergunning en alles eromheen.",
    examples: [
      {
        label: "Verhuisbedrijf boeken",
        desc: "Drie offertes vergeleken, jij kiest.",
        persona: "Gezin met kinderen, 4 weken voor verhuizing",
        messages: [
          { from: "user", text: "Kun je een verhuisbedrijf regelen voor de 12e?", time: "14:02" },
          { from: "lua", text: "Zeker! 3 betrouwbare verhuizers beschikbaar. Goedkoopste: €495 incl. inpakken.", time: "14:03" },
          { from: "user", text: "Boek die maar", time: "14:04" },
          { from: "lua", text: "Geboekt ✅ Ze bellen je woensdag om alles af te stemmen.", time: "14:04" },
        ],
      },
      {
        label: "Verhuislift aanvragen",
        desc: "Voor de 3e etage zonder gedoe met trappen.",
        messages: [
          { from: "lua", text: "Je nieuwe huis zit op de 3e zonder lift. Zal ik een verhuislift regelen voor 12 juli?", time: "10:20" },
          { from: "user", text: "Ja graag", time: "10:21" },
          { from: "lua", text: "Geboekt ✅ Lift staat klaar van 09:00 tot 13:00.", time: "10:21" },
        ],
      },
      {
        label: "Parkeervergunning verhuisdag",
        desc: "Plek voor de verhuiswagen aangevraagd bij de gemeente.",
        messages: [
          { from: "lua", text: "Voor de verhuisdag heb je een parkeerontheffing nodig in Amsterdam. Zal ik 'm aanvragen?", time: "09:15" },
          { from: "user", text: "Top, doe maar", time: "09:16" },
          { from: "lua", text: "Aangevraagd ✅ Goedgekeurd binnen 5 werkdagen, ik laat het je weten.", time: "09:17" },
        ],
      },
      {
        label: "Verhuisdozen bestellen",
        desc: "Genoeg dozen, tape en stickers, op tijd thuisbezorgd.",
        messages: [
          { from: "user", text: "Hoeveel dozen heb ik nodig?", time: "20:11" },
          { from: "lua", text: "Voor jullie 3-kamerappartement: ±35 dozen. Zal ik een pakket bestellen?", time: "20:12" },
          { from: "user", text: "Ja", time: "20:12" },
          { from: "lua", text: "Besteld ✅ Morgen voor 12:00 bezorgd.", time: "20:13" },
        ],
      },
      {
        label: "Eindschoonmaak oude huis",
        desc: "Opleverklaar zonder zelf te boenen.",
        messages: [
          { from: "lua", text: "Voor de oplevering moet je oude huis bezemschoon. Zal ik een schoonmaker boeken voor 11 juli?", time: "11:00" },
          { from: "user", text: "Graag, dat scheelt me een dag", time: "11:01" },
          { from: "lua", text: "Geregeld ✅ €145, ze maken ook de ramen.", time: "11:02" },
        ],
      },
      {
        label: "Opslag voor 2 weken",
        desc: "Tussen oud en nieuw huis een box geregeld.",
        messages: [
          { from: "user", text: "Mijn nieuwe huis is pas 2 weken later vrij 😩", time: "13:40" },
          { from: "lua", text: "Geen probleem. Ik heb een opslagbox van 6m³ in Utrecht: €89 voor 2 weken. Boeken?", time: "13:41" },
          { from: "user", text: "Ja!", time: "13:41" },
          { from: "lua", text: "Geboekt ✅ Code en adres staan in je documenten.", time: "13:42" },
        ],
      },
    ],
  },
  {
    id: "energie-internet",
    title: "Energie & internet",
    intro: "Contracten vergelijken, opzeggen en overzetten zonder dubbele kosten.",
    examples: [
      {
        label: "Energiecontract afsluiten",
        desc: "Nieuwe deal op je nieuwe adres.",
        messages: [
          { from: "lua", text: "Je oude energiecontract loopt af. Zal ik op je nieuwe adres een goede deal regelen?", time: "10:12" },
          { from: "user", text: "Doen 👍", time: "10:13" },
          { from: "lua", text: "Geregeld ✅ Je nieuwe contract gaat in vanaf 12 juli. Bespaart €312/jaar.", time: "10:13" },
        ],
      },
      {
        label: "Internet & wifi overzetten",
        desc: "Beste provider voor jouw nieuwe adres.",
        messages: [
          { from: "lua", text: "Wil je dat ik internet regel voor je nieuwe adres? Ik vergelijk de beste providers.", time: "11:02" },
          { from: "user", text: "Graag!", time: "11:03" },
          { from: "lua", text: "Top ✅ Internet staat klaar vanaf 12 juli, geen overlap met je oude abonnement.", time: "11:03" },
        ],
      },
      {
        label: "Meterstanden doorgeven",
        desc: "Op de verhuisdag automatisch verstuurd.",
        messages: [
          { from: "lua", text: "Vandaag is verhuisdag! Geef je me de meterstanden? Foto is genoeg.", time: "08:30" },
          { from: "user", text: "[foto meter]", time: "08:35" },
          { from: "lua", text: "Bedankt ✅ Doorgegeven aan je oude en nieuwe leverancier.", time: "08:36" },
        ],
      },
      {
        label: "Slim termijnbedrag",
        desc: "Niet te veel betalen, niet bijbetalen.",
        messages: [
          { from: "user", text: "Mijn termijnbedrag voelt te hoog", time: "21:14" },
          { from: "lua", text: "Op basis van je verbruik kan het naar €112. Aanpassen?", time: "21:15" },
          { from: "user", text: "Ja graag", time: "21:15" },
          { from: "lua", text: "Aangepast ✅ Gaat in vanaf volgende maand.", time: "21:16" },
        ],
      },
      {
        label: "Tv-pakket opzeggen",
        desc: "Geen dubbele kosten na de verhuisdag.",
        messages: [
          { from: "lua", text: "Je tv-pakket loopt nog door op je oude adres. Opzeggen per 12 juli?", time: "15:10" },
          { from: "user", text: "Ja", time: "15:10" },
          { from: "lua", text: "Opgezegd ✅ Bevestiging staat in je inbox.", time: "15:11" },
        ],
      },
    ],
  },
  {
    id: "verzekeringen",
    title: "Verzekeringen & financieel",
    intro: "Polissen, hypotheek en abonnementen die meeverhuizen.",
    examples: [
      {
        label: "Inboedelverzekering aanpassen",
        desc: "Dekking afgestemd op je nieuwe huis.",
        messages: [
          { from: "lua", text: "Wil je dat ik je inboedelverzekering aanpas op je nieuwe adres?", time: "15:10" },
          { from: "user", text: "Ja, en check de aansprakelijkheid ook", time: "15:11" },
          { from: "lua", text: "Allebei geregeld ✅ Je bent vanaf de verhuisdatum gedekt.", time: "15:12" },
        ],
      },
      {
        label: "Opstalverzekering koophuis",
        desc: "Verplichte dekking goed geregeld vóór de sleutel.",
        messages: [
          { from: "user", text: "Heb ik opstal nodig?", time: "19:20" },
          { from: "lua", text: "Ja, verplicht bij je hypotheek. Ik heb 3 opties: vanaf €18/m. Wil je vergelijken?", time: "19:21" },
          { from: "user", text: "Ja graag", time: "19:21" },
          { from: "lua", text: "Stuur ik nu naar je toe 📩", time: "19:22" },
        ],
      },
      {
        label: "Zorgverzekering check",
        desc: "Past je polis nog bij je nieuwe situatie?",
        messages: [
          { from: "lua", text: "Je gaat samenwonen. Zal ik checken of een gezamenlijke zorgverzekering goedkoper is?", time: "12:00" },
          { from: "user", text: "Ja!", time: "12:01" },
          { from: "lua", text: "Je bespaart €23/m als jullie naar dezelfde verzekeraar gaan.", time: "12:02" },
        ],
      },
      {
        label: "Hypotheekadvies inplannen",
        desc: "Direct een adviseur in je agenda.",
        messages: [
          { from: "user", text: "Ik wil een huis kopen, waar begin ik?", time: "10:00" },
          { from: "lua", text: "Begin met een oriëntatiegesprek. Donderdag 19:00 vrij bij een onafhankelijk adviseur?", time: "10:01" },
          { from: "user", text: "Ja", time: "10:01" },
          { from: "lua", text: "Gepland ✅ Link voor het videogesprek staat in je agenda.", time: "10:02" },
        ],
      },
      {
        label: "Abonnementen scannen",
        desc: "Wat je vergat op te zeggen, vindt Lua wel.",
        messages: [
          { from: "lua", text: "Ik zie 4 abonnementen die je waarschijnlijk niet meer gebruikt. Samen €37/m. Doorlopen?", time: "22:10" },
          { from: "user", text: "Ja, laat zien", time: "22:11" },
          { from: "lua", text: "Sportschool, twee streamingdiensten en een tijdschrift. Opzeggen?", time: "22:11" },
          { from: "user", text: "Allemaal", time: "22:12" },
          { from: "lua", text: "Opgezegd ✅", time: "22:12" },
        ],
      },
    ],
  },
  {
    id: "post-adres",
    title: "Post & adres doorgeven",
    intro: "Iedereen die jouw adres nodig heeft, krijgt het op tijd.",
    examples: [
      {
        label: "Post doorsturen",
        desc: "3 maanden alles via PostNL naar je nieuwe adres.",
        messages: [
          { from: "lua", text: "Zal ik je post 3 maanden laten doorsturen via PostNL?", time: "16:00" },
          { from: "user", text: "Ja, doen", time: "16:01" },
          { from: "lua", text: "Aangevraagd ✅ Vanaf 12 juli komt alles op je nieuwe adres binnen.", time: "16:01" },
        ],
      },
      {
        label: "Adreswijziging instanties",
        desc: "Gemeente, bank, verzekeraar in één keer.",
        messages: [
          { from: "lua", text: "Zal ik je adres doorgeven aan gemeente, bank en verzekeraar?", time: "16:30" },
          { from: "user", text: "Ja, allemaal graag", time: "16:31" },
          { from: "lua", text: "Doorgegeven ✅ Je hoeft er zelf niks meer aan te doen.", time: "16:31" },
        ],
      },
      {
        label: "Inschrijven gemeente",
        desc: "Afspraak op het stadhuis ingepland.",
        messages: [
          { from: "user", text: "Wanneer moet ik me inschrijven in Amsterdam?", time: "09:00" },
          { from: "lua", text: "Binnen 5 dagen na je verhuizing. Maandag 15 juli 10:30 is vrij. Boeken?", time: "09:01" },
          { from: "user", text: "Ja", time: "09:01" },
          { from: "lua", text: "Geboekt ✅ Neem je ID en huurcontract mee.", time: "09:02" },
        ],
      },
      {
        label: "Werkgever & belastingdienst",
        desc: "Salaris, toeslagen en pensioen geüpdatet.",
        messages: [
          { from: "lua", text: "Ik geef je nieuwe adres door aan je werkgever en de Belastingdienst. Akkoord?", time: "13:30" },
          { from: "user", text: "Ja prima", time: "13:31" },
          { from: "lua", text: "Doorgegeven ✅ Je toeslagen blijven gewoon doorlopen.", time: "13:32" },
        ],
      },
    ],
  },
  {
    id: "klussen-inrichten",
    title: "Klussen & inrichten",
    intro: "Van slotenmaker tot schilder: een vakman is zo geregeld.",
    examples: [
      {
        label: "Sloten vervangen",
        desc: "Veilig je nieuwe huis in.",
        messages: [
          { from: "lua", text: "Net verhuisd? Slim om de sloten te vervangen. Zal ik een slotenmaker boeken?", time: "10:45" },
          { from: "user", text: "Goed idee, ja", time: "10:46" },
          { from: "lua", text: "Geboekt ✅ Dinsdag 14:00 — €165 incl. 2 sets sleutels.", time: "10:47" },
        ],
      },
      {
        label: "Schilder voor de woonkamer",
        desc: "Drie offertes binnen 24 uur.",
        messages: [
          { from: "user", text: "Ik wil m'n woonkamer laten schilderen", time: "18:20" },
          { from: "lua", text: "Welke kleur en hoeveel m²? Of stuur een foto, dan schat ik het.", time: "18:21" },
          { from: "user", text: "[foto] warm wit", time: "18:22" },
          { from: "lua", text: "Top, ik vraag 3 offertes aan. Morgen heb je ze 📩", time: "18:23" },
        ],
      },
      {
        label: "Cv-ketel onderhoud",
        desc: "Veiligheid en lager verbruik.",
        messages: [
          { from: "lua", text: "De ketel van je nieuwe huis is 4 jaar niet onderhouden. Beurt inplannen?", time: "11:30" },
          { from: "user", text: "Ja, regel maar", time: "11:31" },
          { from: "lua", text: "Geboekt ✅ Donderdag tussen 09–12.", time: "11:32" },
        ],
      },
      {
        label: "IKEA-meubels in elkaar",
        desc: "Een klusser die er wél zin in heeft.",
        messages: [
          { from: "user", text: "Ik zie er tegenop al die meubels…", time: "21:00" },
          { from: "lua", text: "Ik regel een klusser. 2 uur werk: €85. Morgenavond 19:00?", time: "21:01" },
          { from: "user", text: "Ja please", time: "21:01" },
          { from: "lua", text: "Geboekt ✅", time: "21:02" },
        ],
      },
      {
        label: "Rolgordijnen op maat",
        desc: "Opmeten, bestellen en monteren geregeld.",
        messages: [
          { from: "user", text: "Heb je tip voor rolgordijnen?", time: "19:00" },
          { from: "lua", text: "Ik stuur een opmeetservice langs (gratis) en regel daarna de montage. Donderdag 10:00?", time: "19:01" },
          { from: "user", text: "Top", time: "19:01" },
          { from: "lua", text: "Geregeld ✅", time: "19:02" },
        ],
      },
    ],
  },
  {
    id: "gezin-huisdieren",
    title: "Gezin & huisdieren",
    intro: "Kinderen, school en huisdieren — niemand wordt vergeten.",
    examples: [
      {
        label: "School inschrijven",
        desc: "Beschikbare scholen in je nieuwe wijk.",
        messages: [
          { from: "user", text: "Welke basisscholen zijn er in Amsterdam-Noord?", time: "20:10" },
          { from: "lua", text: "Ik vond er 6 binnen 1 km. 3 hebben nog plek in groep 4. Wil je de lijst?", time: "20:11" },
          { from: "user", text: "Ja graag", time: "20:11" },
          { from: "lua", text: "Stuur ik nu 📩 Inschrijven kan ik ook voor je doen.", time: "20:12" },
        ],
      },
      {
        label: "Kinderopvang regelen",
        desc: "Plekken vergeleken, wachtlijsten gecheckt.",
        messages: [
          { from: "lua", text: "Lily start in september bij de opvang. Zal ik 3 opties in je nieuwe buurt vergelijken?", time: "12:30" },
          { from: "user", text: "Ja, kosten en openingstijden zijn belangrijk", time: "12:31" },
          { from: "lua", text: "Komt eraan 📩 Ik regel ook de aanmelding voor kinderopvangtoeslag.", time: "12:32" },
        ],
      },
      {
        label: "Hond verhuizen",
        desc: "Chip omzetten, nieuwe dierenarts gevonden.",
        messages: [
          { from: "lua", text: "Vergeet Max niet: chip overzetten en nieuwe dierenarts. Doe ik dat voor je?", time: "17:00" },
          { from: "user", text: "Ja graag", time: "17:01" },
          { from: "lua", text: "Geregeld ✅ Nieuwe dierenarts op 600m, eerste check-up over 2 weken.", time: "17:02" },
        ],
      },
      {
        label: "Babbelmoment buren",
        desc: "Een kaartje voor de nieuwe buren.",
        messages: [
          { from: "lua", text: "Leuke start: kennismakingskaartje sturen naar je nieuwe buren?", time: "10:00" },
          { from: "user", text: "Ja, leuk idee", time: "10:01" },
          { from: "lua", text: "Ik heb 3 ontwerpen, kies je favoriet 📩", time: "10:02" },
        ],
      },
    ],
  },
  {
    id: "auto-mobiliteit",
    title: "Auto & mobiliteit",
    intro: "Parkeren, OV en alles wat met vervoer te maken heeft.",
    examples: [
      {
        label: "Parkeervergunning nieuwe adres",
        desc: "Aangevraagd zodra je staat ingeschreven.",
        messages: [
          { from: "lua", text: "Zodra je ingeschreven staat, vraag ik je parkeervergunning aan in Amsterdam.", time: "09:00" },
          { from: "user", text: "Top, dank", time: "09:01" },
          { from: "lua", text: "Aangevraagd ✅ Tijdelijke vergunning is meteen actief.", time: "16:20" },
        ],
      },
      {
        label: "Kenteken nieuw adres",
        desc: "RDW automatisch geüpdatet.",
        messages: [
          { from: "lua", text: "Je kenteken staat nog op je oude adres. Doorgeven aan de RDW?", time: "14:00" },
          { from: "user", text: "Ja", time: "14:00" },
          { from: "lua", text: "Doorgegeven ✅", time: "14:01" },
        ],
      },
      {
        label: "OV-abonnement aanpassen",
        desc: "Goedkoopste route op nieuwe reisafstand.",
        messages: [
          { from: "user", text: "Welk OV-abonnement is nu slimmer?", time: "08:40" },
          { from: "lua", text: "Met je nieuwe reisafstand: NS Flex Dal — bespaart €42/m. Aanvragen?", time: "08:41" },
          { from: "user", text: "Ja", time: "08:41" },
          { from: "lua", text: "Aangevraagd ✅", time: "08:42" },
        ],
      },
    ],
  },
  {
    id: "tuin-buiten",
    title: "Tuin & buitenruimte",
    intro: "Een frisse start, ook buiten.",
    examples: [
      {
        label: "Tuinman voor onderhoud",
        desc: "Snoeien, maaien en opruimen geregeld.",
        messages: [
          { from: "user", text: "De tuin is een jungle 🌿", time: "11:11" },
          { from: "lua", text: "Ik stuur een tuinman voor een opfrisbeurt. Zaterdag 09:00, €120?", time: "11:12" },
          { from: "user", text: "Ja!", time: "11:12" },
          { from: "lua", text: "Geboekt ✅", time: "11:13" },
        ],
      },
      {
        label: "Container voor grof tuinafval",
        desc: "Een dag op de stoep, alles weg.",
        messages: [
          { from: "lua", text: "Veel snoeiafval? Ik regel een 6m³ container voor zaterdag.", time: "10:00" },
          { from: "user", text: "Doen, dank", time: "10:01" },
          { from: "lua", text: "Geboekt ✅ Vergunning bij de gemeente regel ik ook.", time: "10:02" },
        ],
      },
    ],
  },
];

export const allLuaExamples = luaExampleCategories.flatMap((c) => c.examples);
