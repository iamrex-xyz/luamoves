import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  phone: string;
  name?: string;
}

const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // If starts with 00, replace with +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  
  // If starts with 0 (Dutch local), add +31
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
    cleaned = "+31" + cleaned.slice(1);
  }
  
  // If doesn't start with +, assume +31
  if (!cleaned.startsWith("+")) {
    cleaned = "+31" + cleaned;
  }
  
  // Remove + for WhatsApp API (they just want the number)
  return cleaned.replace("+", "");
};

const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Must be at least 10 digits
  return cleaned.replace(/\D/g, "").length >= 10;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

    // Get the user from the auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { phone, name }: InviteRequest = await req.json();

    if (!phone) {
      throw new Error("Phone number is required");
    }

    if (!validatePhone(phone)) {
      throw new Error("Invalid phone number format");
    }

    console.log(`[send-household-invite] User ${user.id} inviting phone: ${phone}`);

    // Check if already invited
    const { data: existing } = await supabase
      .from("household_members")
      .select("id, status")
      .eq("owner_user_id", user.id)
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      if (existing.status === "active") {
        return new Response(
          JSON.stringify({ error: "Dit nummer is al een actief lid van je huishouden" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      // Already invited but not active - we'll resend the invite
      console.log(`[send-household-invite] Resending invite to existing member ${existing.id}`);
    }

    // Create or update the household member
    const { data: member, error: memberError } = await supabase
      .from("household_members")
      .upsert({
        owner_user_id: user.id,
        phone,
        name: name || null,
        status: "invited",
        invite_token: crypto.randomUUID(),
        invited_at: new Date().toISOString(),
      }, {
        onConflict: "owner_user_id,phone",
      })
      .select()
      .single();

    if (memberError) {
      console.error("[send-household-invite] Error creating member:", memberError);
      throw new Error("Kon mede-verhuizer niet toevoegen");
    }

    console.log(`[send-household-invite] Created/updated member: ${member.id}`);

    // Build the invite URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://luaverhuisapp.lovable.app";
    const inviteUrl = `${baseUrl}/?invite=${member.invite_token}`;

    // Send WhatsApp message via Twilio
    const whatsappNumber = formatPhoneForWhatsApp(phone);
    const message = `🏠 Je bent uitgenodigd als mede-verhuizer!

${name ? `Hoi ${name}! ` : ""}Iemand gebruikt Lua, de slimme verhuisassistent, en nodigt je uit om samen te verhuizen!

Met Lua kun je:
✅ Taken verdelen
✅ Samen chatten
✅ Niets vergeten

Maak nu je account aan en start direct:
${inviteUrl}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const twilioBody = new URLSearchParams({
      To: `whatsapp:+${whatsappNumber}`,
      From: `whatsapp:${twilioPhoneNumber}`,
      Body: message,
    });

    console.log(`[send-household-invite] Sending WhatsApp to: whatsapp:+${whatsappNumber}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioBody.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("[send-household-invite] Twilio error:", twilioResult);
      // Don't fail the whole request - member is created, just WhatsApp failed
      return new Response(
        JSON.stringify({ 
          success: true, 
          member,
          whatsappSent: false,
          whatsappError: twilioResult.message || "WhatsApp kon niet worden verstuurd"
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[send-household-invite] WhatsApp sent successfully: ${twilioResult.sid}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        member,
        whatsappSent: true,
        messageSid: twilioResult.sid 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[send-household-invite] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
