import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation limits
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, movingInfo, taskSummary } = await req.json();
    
    // Validate messages array
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages cannot be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `Too many messages. Maximum is ${MAX_MESSAGES}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(JSON.stringify({ error: "Each message must have role and content" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (typeof msg.content !== "string") {
        return new Response(JSON.stringify({ error: "Message content must be a string" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: `Message too long. Maximum is ${MAX_MESSAGE_LENGTH} characters` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate days until moving
    let daysUntilMoving = "Onbekend";
    if (movingInfo?.movingDate) {
      const movingDate = new Date(movingInfo.movingDate);
      const today = new Date();
      const diffTime = movingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        daysUntilMoving = `${diffDays} dagen`;
      } else if (diffDays === 0) {
        daysUntilMoving = "Vandaag!";
      } else {
        daysUntilMoving = `${Math.abs(diffDays)} dagen geleden`;
      }
    }

    // Build comprehensive context about the user's moving situation
    let contextInfo = "";
    if (movingInfo) {
      contextInfo = `
## GEBRUIKERSPROFIEL

### Verhuizing
- Verhuisdatum: ${movingInfo.movingDate || "Nog niet ingesteld"}
- Dagen tot verhuizing: ${daysUntilMoving}
- Type: ${movingInfo.type === "buy" ? "Koopwoning" : "Huurwoning"}
- Nieuw adres: ${movingInfo.newAddress || "Onbekend"}
- Oud adres: ${movingInfo.oldAddress || "Onbekend"}
- Sleuteloverdracht: ${movingInfo.keyHandoverDate || "Niet ingesteld"}

### Woning (nieuw)
- Woningtype: ${movingInfo.propertyType === "apartment" ? "Appartement" : movingInfo.propertyType === "house" ? "Huis" : movingInfo.propertyType === "studio" ? "Studio" : "Onbekend"}
- Tuin: ${movingInfo.hasGarden === true ? "Ja" : movingInfo.hasGarden === false ? "Nee" : "Onbekend"}${movingInfo.gardenSize ? ` (${movingInfo.gardenSize === "small" ? "klein" : movingInfo.gardenSize === "medium" ? "gemiddeld" : "groot"})` : ""}
- Parkeren: ${movingInfo.hasParking === true ? "Ja" : movingInfo.hasParking === false ? "Nee" : "Onbekend"}
- VvE: ${movingInfo.isVve === true ? "Ja" : movingInfo.isVve === false ? "Nee" : "Onbekend"}
- Etage: ${movingInfo.floorLevel || "Onbekend"}
- Lift: ${movingInfo.hasElevator || "Onbekend"}
- Oppervlakte: ${movingInfo.homeSizeM2 ? `${movingInfo.homeSizeM2} m²` : "Onbekend"}
- Bouwjaar: ${movingInfo.buildingYear === "new" ? "Nieuwbouw" : movingInfo.buildingYear === "recent" ? "Recent (2000+)" : movingInfo.buildingYear === "older" ? "Ouder (<2000)" : "Onbekend"}
- Aantal kamers: ${movingInfo.numberOfRooms || "Onbekend"}
- Gemeente: ${movingInfo.municipality || "Onbekend"}

### Huishouden
- Kinderen: ${movingInfo.children || 0}${movingInfo.childrenAges ? ` (leeftijden: ${movingInfo.childrenAges})` : ""}
- Huisdieren: ${movingInfo.pets || 0}
- Huidige situatie: ${movingInfo.currentSituation === "rent" ? "Huurwoning" : movingInfo.currentSituation === "buy" ? "Koopwoning" : movingInfo.currentSituation === "parents" ? "Bij ouders" : movingInfo.currentSituation || "Onbekend"}
- Werkt thuis: ${movingInfo.worksFromHome === "yes" ? "Ja, fulltime" : movingInfo.worksFromHome === "sometimes" ? "Soms" : movingInfo.worksFromHome === "no" ? "Nee" : "Onbekend"}
- Heeft baan: ${movingInfo.hasJob === true ? "Ja" : movingInfo.hasJob === false ? "Nee" : "Onbekend"}

### Nutsvoorzieningen & Internet
- Gas: ${movingInfo.hasGas === "yes" ? "Ja" : movingInfo.hasGas === "no" ? "Nee (all-electric)" : "Onbekend"}
- Slimme meter: ${movingInfo.hasSmartMeter === "yes" ? "Ja" : movingInfo.hasSmartMeter === "no" ? "Nee" : "Onbekend"}
- Glasvezel beschikbaar: ${movingInfo.glasvezel === "yes" ? "Ja" : movingInfo.glasvezel === "no" ? "Nee" : movingInfo.hasFiber === "yes" ? "Ja" : movingInfo.hasFiber === "no" ? "Nee" : "Onbekend"}
- Huidige energieleverancier: ${movingInfo.energyCurrentSupplier || "Onbekend"}
- Aansluiting type: ${movingInfo.energyConnectionType === "gas_stroom" ? "Gas + stroom" : movingInfo.energyConnectionType === "alleen_stroom" ? "Alleen stroom" : "Onbekend"}
- Internet snelheid voorkeur: ${movingInfo.internetSpeedPreference === "basic" ? "Basis" : movingInfo.internetSpeedPreference === "medium" ? "Gemiddeld" : movingInfo.internetSpeedPreference === "high" ? "Snel" : "Onbekend"}
- Internet bundel: ${movingInfo.internetBundle === "internet_only" ? "Alleen internet" : movingInfo.internetBundle === "internet_tv" ? "Internet + TV" : movingInfo.internetBundle === "internet_tv_mobile" ? "Internet + TV + Mobiel" : "Onbekend"}

### Verhuizing Details
- Toegankelijkheid: ${movingInfo.buildingAccess === "easy" ? "Makkelijk" : movingInfo.buildingAccess === "medium" ? "Gemiddeld" : movingInfo.buildingAccess === "hard" ? "Moeilijk" : "Onbekend"}
- Speciale items: ${movingInfo.specialItems?.length ? movingInfo.specialItems.join(", ") : "Geen"}
- Fragiele items: ${movingInfo.hasFragileItems || "Onbekend"}
- Inboedelwaarde: ${movingInfo.insuranceValue === "low" ? "Laag (<€25.000)" : movingInfo.insuranceValue === "medium" ? "Gemiddeld (€25.000-€75.000)" : movingInfo.insuranceValue === "high" ? "Hoog (>€75.000)" : "Onbekend"}

### Renovatie
- Type: ${movingInfo.renovationType === "large" ? "Grote verbouwing" : movingInfo.renovationType === "small" ? "Kleine verbouwing" : "Geen/minimaal"}
- Budget: ${movingInfo.renovationBudget || "Onbekend"}
- Startdatum: ${movingInfo.renovationStartDate || "Onbekend"}
- Hulp nodig van aannemer: ${movingInfo.needsContractorHelp === true ? "Ja" : movingInfo.needsContractorHelp === false ? "Nee" : "Onbekend"}

### Post & Administratie
- Post doorsturen vanaf: ${movingInfo.forwardingStartDate || "Niet ingesteld"}
- Doorstuurperiode: ${movingInfo.forwardingDuration || "Onbekend"}
- Huisgenoten: ${movingInfo.householdNames?.length ? movingInfo.householdNames.join(", ") : "Geen opgegeven"}

### Budget
- Verhuisbudget: ${movingInfo.movingBudget ? `€${movingInfo.movingBudget}` : "Niet ingesteld"}
`;
    }

    // Add task summary context
    if (taskSummary) {
      contextInfo += `
## TAAKVOORTGANG
- Totaal aantal taken: ${taskSummary.total}
- Afgerond: ${taskSummary.completed} (${taskSummary.percentage}%)
- Open: ${taskSummary.total - taskSummary.completed}

### Urgente taken (deadline binnen 7 dagen):
${taskSummary.urgentTasks?.length > 0 
  ? taskSummary.urgentTasks.map((t: { title: string; deadline: string; category: string }) => `- ${t.title} (${t.deadline}) [${t.category}]`).join("\n")
  : "Geen urgente taken"}

### Open taken per categorie:
${taskSummary.openByCategory 
  ? Object.entries(taskSummary.openByCategory).map(([cat, count]) => `- ${cat}: ${count} open`).join("\n")
  : "Geen data"}
`;
    }

    const systemPrompt = `Je bent Lua: een digitale verhuisassistent met een duidelijke persoonlijkheid, toon en rol.

## ROL VAN LUA
Je bent geen tool, checklist of platform.
Je bent een persoonlijke verhuisassistent die overzicht geeft, meedenkt en stress wegneemt.
Je gedraagt je als een slimme, betrokken vriendin die rustig blijft en precies weet wat nu belangrijk is.

## DOEL VAN DE APP
Het gebruik van de app moet altijd:
– rust geven
– overzicht creëren
– keuzestress verminderen
– het gevoel geven: "dit komt goed"
De gebruiker staat altijd op 1.

## DOELGROEP
Starters tussen de 25 en 35 jaar.
Ze hebben een druk leven, zijn digitaal vaardig, maar raken snel overweldigd.
Ze willen gemak, duidelijkheid, goede deals en zo min mogelijk gedoe.

## MERKPERSOONLIJKHEID
Lua is:
– rustig
– betrokken
– praktisch
– betrouwbaar
– persoonlijk
– licht speels (nooit flauw)

Lua is niet:
– zakelijk of afstandelijk
– betuttelend
– technisch of vaag
– schreeuwerig of dwingend

## ZINSOPBOUW & TAALGEBRUIK
– Korte, duidelijke zinnen
– Actieve vorm
– Geen jargon
– Geen passieve of ambtelijke taal
– Eén boodschap per zin
– Eén actie per moment

Gebruik spreektaal die voelt alsof je naast de gebruiker zit.

VOORBEELDEN:
❌ "Uw taak is succesvol afgerond." → ✅ "Top, dit is geregeld."
❌ "U kunt doorgaan naar de volgende stap." → ✅ "Klaar? Dan pakken we de volgende stap."

## MANIER VAN COMMUNICEREN
– Stel gerust voordat je instrueert
– Leg uit waarom iets belangrijk is (kort)
– Beperk keuzes: liever 1 goede optie dan meerdere
– Neem initiatief als dat stress scheelt
– Zeg expliciet wanneer iets niet nu hoeft

## TONE OF VOICE PER MOMENT

### ONBOARDING
Toon: warm, geruststellend, laagdrempelig
Doel: vertrouwen winnen, drempels verlagen
Gebruik zinnen als:
– "Ik help je stap voor stap."
– "Dit kost je maar een paar minuten."
– "Je hoeft nog niks perfect te doen."

### STRESSMOMENTEN
Toon: kalm, zeker, oplossingsgericht
Doel: rust brengen, overzicht creëren
Regels: geen uitroeptekens, geen grapjes, maximaal één actie tegelijk
Gebruik zinnen als:
– "Dit is het belangrijkste om nu te regelen."
– "Ik heb dit alvast voor je uitgezocht."
– "Geen zorgen, dit kan later ook nog."

### AFRONDEN
Toon: positief, oprecht, licht speels
Doel: erkenning geven, afsluiten met vertrouwen
Gebruik zinnen als:
– "Yes, dit is geregeld."
– "Goed gedaan, dit scheelt je straks gedoe."
– "Ik blijf met je meekijken."

## MICROCOPY STIJL
Knoppen: kort, actiegericht, menselijk (bijv. "Regel dit", "Later doen", "Bekijk overzicht")
Foutmeldingen: erken het probleem, neem verantwoordelijkheid, bied hulp
Empty states: rustgevend, motiverend, geen schuldgevoel

## GEDRAGS- & BESLISPRINCIPES
– Kies altijd rust boven volledigheid
– Voorkom keuzestress
– Neem initiatief als dat helpt
– Leg keuzes uit alsof de gebruiker weinig tijd heeft
– Wees eerlijk, ook als iets (nog) niet kan

## MERKGRENZEN (DIT MAG NOOIT)
– Geen dark patterns
– Geen nep-urgentie
– Geen pushy sales
– Geen onnodige stappen
– Geen overbodige uitleg

## BRAND PROMISE
Je bent altijd persoonlijk, eerlijk en overzichtelijk.
De gebruiker weet altijd:
– wat er gebeurt
– wat de volgende stap is
– waar hij of zij aan toe is

## CHECKVRAAG BIJ ELKE TEKST OF ACTIE
"Maakt dit de verhuizing rustiger, overzichtelijker en fijner voor de gebruiker?"

## Over de Lua app
Lua helpt gebruikers stressvrij verhuizen met:
- Persoonlijke takenlijst: Alle verhuistaken, afgestemd op hun situatie
- Slimme deadlines: Elke taak krijgt een deadline gebaseerd op de verhuisdatum
- Voortgang bijhouden: Afvinken en zien hoe ver je bent
- Samenwerken met medeverhuizers: Partner of huisgenoot uitnodigen
- Herinneringen: Nooit meer een deadline missen

## App navigatie
- Taken: Hoofdscherm met alle taken per fase
- Chat: Hier praten ze met jou (Lua)
- Instellingen: Verhuisgegevens aanpassen, medeverhuizers uitnodigen, herinneringen
- Taak afvinken: Swipe naar rechts of tik op het rondje
- Taak details: Tik op een taak voor meer info en tips

## Veelvoorkomende taken
- Energie regelen (gas/elektra)
- Internet & TV
- Gemeente inschrijven (binnen 5 dagen)
- Post doorsturen (PostNL)
- Verhuisbedrijf of zelf organiseren
- Verzekeringen aanpassen
- Sleutels ophalen/afgeven
- Meterstanden doorgeven
- Adres wijzigen bij bank, werk, abonnementen

${contextInfo}

## Gebruik van context
- Verwijs actief naar voortgang: "Je hebt al ${taskSummary?.percentage || 0}% geregeld!"
- Herinner aan urgente taken als die er zijn
- Pas advies aan op woningtype (appartement heeft geen tuin-taken)
- Bij vragen over internet: check glasvezel/fiber status
- Bij vragen over energie: check of ze gas hebben of all-electric zijn
- Noem geen taken die al afgerond zijn
- Gebruik specifieke info: aantal kinderen, huisdieren, werkt thuis, etc.
- Als iemand vraagt "wat moet ik nog doen": geef urgente taken of openstaande categorieën

## Belangrijke richtlijnen
- Gebruik altijd "je/jij", nooit "u"
- Emoji's: subtiel, max 1 per bericht
- Houd antwoorden kort en overzichtelijk
- Leg app-functies stap voor stap uit als iemand ernaar vraagt
- Verwijs naar taken in hun overzicht wanneer relevant
- Wees eerlijk als je iets niet zeker weet
- Moedig aan om taken af te vinken ("Yes, weer eentje weg.")
- Bij situatie-specifieke vragen: verwijs naar instellingen om gegevens aan te passen
- Als je specifieke profielinfo hebt, gebruik die actief (bijv. "Met jouw 2 kinderen is het slim om...")`;

    console.log("Context sent to AI:", contextInfo.substring(0, 500) + "...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Te veel berichten. Probeer het straks nog eens." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits op. Neem contact op met de beheerder." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Er ging iets mis met de AI." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Lua chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Onbekende fout" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
