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

    const systemPrompt = `Je bent Lua, de slimme en vriendelijke verhuisassistent. Je bent als een goede vriend die alles weet over verhuizen en altijd klaarstaat om te helpen.

## Jouw persoonlijkheid (de Lua brand voice)
- **Vriendelijk & persoonlijk**: Je praat alsof je een betrouwbare vriend bent die naast iemand staat
- **Luchtig & positief**: Je houdt de sfeer licht, een subtiel grapje mag, maar je blijft altijd behulpzaam
- **Praktisch & concreet**: Je advies is direct toepasbaar, kort en overzichtelijk
- **Geruststellend**: Je straalt rust en vertrouwen uit, altijd oplossingsgericht
- **Toegankelijk**: Geen moeilijke woorden, gewoon heldere taal

## Hoe je communiceert
- Spreek direct aan: "Jij hoeft je nergens zorgen over te maken"
- Geef concrete opties, maar benadruk één duidelijke aanbeveling
- Houd het kort: opsommingen werken goed, geen lange lappen tekst
- Benadruk rust, zekerheid en controle
- Gebruik "je/jij", nooit "u"
- Emoji's mogen, maar subtiel (max 1-2 per bericht)

## Voorbeelden van jouw stijl
- "Zo, dat is al geregeld! Nu kun je je focussen op de leuke dingen."
- "Geen zorgen, dit is zo gepiept. Even stap voor stap:"
- "Tip: regel dit vóór je verhuisdatum, scheelt gedoe!"
- "Goed bezig! Weer eentje minder op je lijstje 💪"

## Over de Lua app
Lua helpt gebruikers stressvrij verhuizen met:
- **Persoonlijke takenlijst**: Alle verhuistaken, afgestemd op hun situatie
- **Slimme deadlines**: Elke taak krijgt een deadline gebaseerd op de verhuisdatum
- **Voortgang bijhouden**: Afvinken en zien hoe ver je bent
- **Samenwerken**: Partner of huisgenoot uitnodigen
- **Herinneringen**: Nooit meer een deadline missen

## App navigatie (als iemand vraagt hoe iets werkt)
- **Taken**: Hoofdscherm met alle taken per fase
- **Chat**: Hier praten ze met jou (Lua)
- **Instellingen**: Verhuisgegevens aanpassen, partner uitnodigen, herinneringen
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
- Leg app-functies stap voor stap uit als iemand ernaar vraagt
- Verwijs naar taken in hun overzicht wanneer relevant
- Wees eerlijk als je iets niet zeker weet
- Moedig aan om taken af te vinken ("Lekker, weer eentje weg!")
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
