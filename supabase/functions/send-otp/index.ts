import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-anonymous-user-id",
};

interface SendOTPRequest {
  phone: string;
  anonymousUserId?: string;
}

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone for MessageBird (E.164 format)
const formatPhoneE164 = (phone: string): string => {
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
  
  return cleaned;
};

const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.replace(/\D/g, "").length >= 10;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const messagebirdApiKey = Deno.env.get("MESSAGEBIRD_API_KEY");
    const messagebirdChannelId = Deno.env.get("MESSAGEBIRD_CHANNEL_ID");

    if (!messagebirdApiKey) {
      throw new Error("MESSAGEBIRD_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, anonymousUserId }: SendOTPRequest = await req.json();

    if (!phone) {
      throw new Error("Telefoonnummer is verplicht");
    }

    if (!validatePhone(phone)) {
      throw new Error("Ongeldig telefoonnummer formaat");
    }

    const formattedPhone = formatPhoneE164(phone);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[send-otp] Sending OTP to ${formattedPhone}`);

    // Store OTP in database (create a simple otp_verifications table if not exists)
    // For now, we'll use a simple approach with the profiles table
    // In production, you'd want a dedicated otp_codes table with expiration
    
    // Try to send via WhatsApp first, fallback to SMS
    let messageSent = false;
    let sendMethod = "unknown";

    // Try WhatsApp via MessageBird Conversations API
    if (messagebirdChannelId) {
      try {
        const whatsappResponse = await fetch("https://conversations.messagebird.com/v1/send", {
          method: "POST",
          headers: {
            "Authorization": `AccessKey ${messagebirdApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: formattedPhone,
            from: messagebirdChannelId,
            type: "text",
            content: {
              text: `🔐 Je Lua verificatiecode is: ${otp}\n\nDeze code is 10 minuten geldig. Deel deze code met niemand.`
            }
          }),
        });

        if (whatsappResponse.ok) {
          messageSent = true;
          sendMethod = "whatsapp";
          console.log("[send-otp] WhatsApp sent successfully");
        } else {
          const errorText = await whatsappResponse.text();
          console.log("[send-otp] WhatsApp failed, trying SMS:", errorText);
        }
      } catch (e) {
        console.log("[send-otp] WhatsApp error, trying SMS:", e);
      }
    }

    // Fallback to SMS via MessageBird
    if (!messageSent) {
      const smsResponse = await fetch("https://rest.messagebird.com/messages", {
        method: "POST",
        headers: {
          "Authorization": `AccessKey ${messagebirdApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originator: "Lua",
          recipients: [formattedPhone.replace("+", "")],
          body: `Je Lua verificatiecode is: ${otp}. Geldig voor 10 minuten.`,
        }),
      });

      if (smsResponse.ok) {
        messageSent = true;
        sendMethod = "sms";
        console.log("[send-otp] SMS sent successfully");
      } else {
        const errorData = await smsResponse.json();
        console.error("[send-otp] SMS failed:", errorData);
        throw new Error("Kon verificatiecode niet versturen. Probeer het opnieuw.");
      }
    }

    // Store OTP hash in a temporary storage (we'll create a simple in-memory cache or use Supabase)
    // For security, we store a hashed version. For MVP, we'll store it directly but with short expiry.
    // Create an otp_codes entry
    const { error: otpError } = await supabase
      .from("otp_codes")
      .upsert({
        phone: formattedPhone,
        code: otp, // In production, hash this
        expires_at: expiresAt.toISOString(),
        anonymous_user_id: anonymousUserId || null,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "phone",
      });

    if (otpError) {
      console.error("[send-otp] Error storing OTP:", otpError);
      // Don't fail - OTP was sent, just storage failed
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        method: sendMethod,
        phone: formattedPhone,
        expiresAt: expiresAt.toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[send-otp] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
