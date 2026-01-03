import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  taskTitle: string;
  assignedToPhone: string;
  assignerName?: string;
}

const formatPhoneForWhatsApp = (phone: string): string => {
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
    cleaned = "+31" + cleaned.slice(1);
  }
  
  if (!cleaned.startsWith("+")) {
    cleaned = "+31" + cleaned;
  }
  
  return cleaned.replace("+", "");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { taskTitle, assignedToPhone, assignerName }: NotifyRequest = await req.json();

    if (!taskTitle || !assignedToPhone) {
      throw new Error("Task title and phone are required");
    }

    console.log(`[notify-task-assignment] Notifying ${assignedToPhone} about task: ${taskTitle}`);

    const whatsappNumber = formatPhoneForWhatsApp(assignedToPhone);
    
    const message = `📋 Nieuwe taak voor jou!

${assignerName ? `${assignerName} heeft` : "Je huisgenoot heeft"} een taak aan jou toegewezen:

"${taskTitle}"

Open Lua om de details te bekijken en de taak af te ronden. 💪`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const twilioBody = new URLSearchParams({
      To: `whatsapp:+${whatsappNumber}`,
      From: `whatsapp:${twilioPhoneNumber}`,
      Body: message,
    });

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
      console.error("[notify-task-assignment] Twilio error:", twilioResult);
      return new Response(
        JSON.stringify({ success: false, error: twilioResult.message }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[notify-task-assignment] WhatsApp sent: ${twilioResult.sid}`);

    return new Response(
      JSON.stringify({ success: true, messageSid: twilioResult.sid }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[notify-task-assignment] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
