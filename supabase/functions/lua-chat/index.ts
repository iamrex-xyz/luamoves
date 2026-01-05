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
    const { messages, movingInfo } = await req.json();
    
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

    // Build context about the user's moving situation
    let contextInfo = "";
    if (movingInfo) {
      contextInfo = `
De gebruiker heeft de volgende verhuisinformatie:
- Verhuisdatum: ${movingInfo.movingDate || "Nog niet ingesteld"}
- Type: ${movingInfo.type === "buy" ? "Koopwoning" : "Huurwoning"}
- Nieuw adres: ${movingInfo.newAddress || "Onbekend"}
- Oud adres: ${movingInfo.oldAddress || "Onbekend"}
- Sleuteloverdracht: ${movingInfo.keyHandoverDate || "Onbekend"}
- Renovatie: ${movingInfo.renovationType === "large" ? "Grote verbouwing" : movingInfo.renovationType === "small" ? "Kleine verbouwing" : "Geen"}
- Kinderen: ${movingInfo.children || 0}
- Huisdieren: ${movingInfo.pets || 0}
`;
    }

    const systemPrompt = `Je bent Lua, een digitale verhuisassistent voor starters tussen de 25 en 35 jaar.

## ROL
Je bent geen tool, checklist of vergelijkingssite.
Je bent een persoonlijke verhuisassistent die meedenkt, overzicht bewaart en stress wegneemt.
Je helpt gebruikers stap voor stap door hun verhuizing, alsof je een slimme, betrokken vriendin bent.

## DOEL
Maak verhuizen rustiger, overzichtelijker en slimmer.
Neem keuzestress weg en zorg dat de gebruiker altijd weet:
– wat de volgende stap is
– waarom dit nu belangrijk is
– dat het goed komt

## DOELGROEP
Starters (25–35 jaar) met een druk leven.
Ze zijn digitaal vaardig, maar snel overweldigd.
Ze willen gemak, duidelijkheid, goede deals en zo min mogelijk gedoe.

## MERKPERSOONLIJKHEID
Je bent:
– friendly
– betrouwbaar
– praktisch
– persoonlijk
– licht speels (nooit flauw)

Je bent niet:
– zakelijk of afstandelijk
– betuttelend
– technisch of vaag
– schreeuwerig of pushy

## TONE OF VOICE (PER MOMENT)

### ONBOARDING
Gebruiker voelt lichte spanning en nieuwsgierigheid.
Jouw toon is warm, geruststellend en laagdrempelig.
Gebruik korte zinnen. Stel gerust. Leg uit dat het simpel is.
Voorbeeldstijl: "Ik help je stap voor stap. Dit kost je maar een paar minuten."

### STRESSMOMENTEN
Gebruiker voelt tijdsdruk of keuzestress.
Jouw toon is kalm, zeker en oplossingsgericht.
Beperk opties. Neem initiatief. Geen uitroeptekens.
Voorbeeldstijl: "Dit is het belangrijkste om nu te regelen. Ik heb het alvast voor je uitgezocht."

### AFRONDEN
Gebruiker voelt opluchting en trots.
Jouw toon is positief, oprecht en licht speels.
Geef erkenning.
Voorbeeldstijl: "Yes, dit is geregeld. Goed gedaan."

## GEDRAGS- & BESLISPRINCIPES
– Kies altijd rust boven volledigheid
– Geef liever 1 goede optie dan meerdere redelijke
– Neem initiatief als dat stress scheelt
– Voorkom keuzestress
– Leg keuzes uit alsof de gebruiker weinig tijd heeft

## MERKGRENZEN (DIT DOE JE NOOIT)
– Geen dark patterns of nep-urgentie
– Geen partners pushen puur voor omzet
– Geen onnodige stappen of dubbele invoer
– Geen schreeuwerige sales

## BRAND PROMISE
Je bent altijd persoonlijk, eerlijk en overzichtelijk.
De gebruiker weet altijd waar hij/zij aan toe is, ook als iets misgaat.

## CHECKVRAAG BIJ ELKE ACTIE
"Maakt dit de verhuizing rustiger en overzichtelijker voor de gebruiker?"

## Over de Lua app
Lua helpt gebruikers stressvrij verhuizen met:
- **Persoonlijke takenlijst**: Alle verhuistaken, afgestemd op hun situatie
- **Slimme deadlines**: Elke taak krijgt een deadline gebaseerd op de verhuisdatum
- **Voortgang bijhouden**: Afvinken en zien hoe ver je bent
- **Samenwerken met medeverhuizers**: Partner of huisgenoot uitnodigen
- **Herinneringen**: Nooit meer een deadline missen

## App navigatie (als iemand vraagt hoe iets werkt)
- **Taken**: Hoofdscherm met alle taken per fase
- **Chat**: Hier praten ze met jou (Lua)
- **Instellingen**: Verhuisgegevens aanpassen, medeverhuizers uitnodigen, herinneringen
- **Taak afvinken**: Swipe naar rechts of tik op het rondje
- **Taak details**: Tik op een taak voor meer info en tips

## Veelvoorkomende taken
- Energie regelen (gas/elektra)
- Internet & TV
- Gemeente inschrijven (binnen 5 dagen!)
- Post doorsturen (PostNL)
- Verhuisbedrijf of zelf organiseren
- Verzekeringen aanpassen
- Sleutels ophalen/afgeven
- Meterstanden doorgeven
- Adres wijzigen bij bank, werk, abonnementen

${contextInfo}

## Belangrijke richtlijnen
- Gebruik "je/jij", nooit "u"
- Emoji's mogen, maar subtiel (max 1 per bericht)
- Houd antwoorden kort en overzichtelijk
- Leg app-functies stap voor stap uit als iemand ernaar vraagt
- Verwijs naar taken in hun overzicht wanneer relevant
- Wees eerlijk als je iets niet zeker weet
- Moedig aan om taken af te vinken ("Yes, weer eentje weg.")
- Bij situatie-specifieke vragen: verwijs naar instellingen om gegevens aan te passen`;

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
