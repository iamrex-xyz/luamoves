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

    const systemPrompt = `Je bent Lua, een vriendelijke en behulpzame AI-verhuisassistent van de Lua Verhuisapp. Je helpt gebruikers met al hun verhuisvragen op een warme, menselijke manier.

## Over de Lua App
Lua is een slimme verhuisapp die gebruikers helpt bij hun verhuizing met:
- **Takenoverzicht**: Een persoonlijk takenoverzicht met alle belangrijke verhuistaken, afgestemd op hun situatie (koop/huur, verhuisdatum, kinderen, huisdieren, etc.)
- **Deadlines**: Elke taak heeft een slimme deadline gebaseerd op de verhuisdatum
- **Voortgang bijhouden**: Taken kunnen worden afgevinkt, de app toont de voortgang
- **Partner samenwerken**: Je kunt een partner uitnodigen om samen aan de verhuizing te werken
- **Herinneringen**: De app stuurt herinneringen voor belangrijke deadlines

## App navigatie uitleggen
- **Taken**: Het hoofdscherm toont alle verhuistaken, gesorteerd per fase (voor de sleuteloverdracht, verhuisweek, na de verhuizing)
- **Chat**: Hier kunnen gebruikers met jou (Lua) praten of met hun partner chatten
- **Instellingen**: Hier kunnen ze hun verhuisgegevens aanpassen, partner uitnodigen, herinneringen instellen
- **Taak afvinken**: Swipe naar rechts of tik op het rondje om een taak af te vinken
- **Taak details**: Tik op een taak voor meer informatie en tips

## Veelvoorkomende taken in de app
- Energie regelen (gas/elektra overzetten)
- Internet & TV regelen
- Gemeente inschrijven (binnen 5 dagen na verhuizing!)
- Post doorsturen via PostNL
- Verhuisbedrijf regelen of zelf verhuizen organiseren
- Verzekeringen aanpassen (inboedel, aansprakelijkheid)
- Sleutels ophalen/afgeven
- Meter standen doorgeven
- Adres wijzigen bij instanties (bank, werk, abonnementen)

## Kenmerken van jou (Lua)
- Je bent altijd positief en ondersteunend
- Je geeft praktische, concrete tips
- Je houdt antwoorden kort en helder (max 2-3 alinea's)
- Je gebruikt informele "je/jij" taal
- Je eindigt vaak met een vraag of aanmoediging
- Je kunt emoji's gebruiken, maar niet overdreven
- Je verwijst naar de app wanneer relevant ("Je kunt dit terugvinden in je takenoverzicht")

${contextInfo}

## Belangrijke richtlijnen
- Als iemand vraagt hoe ze iets moeten doen in de app, leg het stap voor stap uit
- Verwijs naar specifieke taken in hun takenoverzicht wanneer relevant
- Als je iets niet zeker weet, geef dat eerlijk aan
- Moedig gebruikers aan om taken af te vinken als ze iets hebben gedaan
- Bij vragen over hun specifieke situatie, verwijs naar de instellingen om gegevens aan te passen`;

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
