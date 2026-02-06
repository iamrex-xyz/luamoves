import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-anonymous-user-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VERSION = "v1.0.2";
const DEV_MODE = Deno.env.get("OTP_DEV_MODE") === "true";

interface SendOTPRequest {
  phone: string;
  anonymousUserId?: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

Deno.serve(async (req: Request): Promise<Response> => {
  console.log(`[send-otp][${VERSION}] Request received, DEV_MODE=${DEV_MODE}`);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const messagebirdApiKey = Deno.env.get("MESSAGEBIRD_API_KEY");
    const messagebirdChannelId = Deno.env.get("MESSAGEBIRD_CHANNEL_ID");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[send-otp] Missing Supabase credentials");
      throw new Error("Server configuration error");
    }

    if (!DEV_MODE && !messagebirdApiKey) {
      console.error("[send-otp] Missing MESSAGEBIRD_API_KEY (not in dev mode)");
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`[send-otp] Sending OTP to ${formattedPhone}`);

    let messageSent = false;
    let sendMethod = "unknown";

    // DEV MODE: Use fixed OTP code 000000
    if (DEV_MODE) {
      const devOtp = "000000";
      console.log(`[send-otp][DEV] Using fixed OTP: ${devOtp} for ${formattedPhone}`);
      
      // Store the fixed OTP instead of the random one
      const { error: otpError } = await supabase
        .from("otp_codes")
        .upsert({
          phone: formattedPhone,
          code: devOtp,
          expires_at: expiresAt.toISOString(),
          anonymous_user_id: anonymousUserId || null,
          created_at: new Date().toISOString(),
        }, {
          onConflict: "phone",
        });

      if (otpError) {
        console.error("[send-otp][DEV] Error storing OTP:", otpError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          method: "dev_mode",
          phone: formattedPhone,
          expiresAt: expiresAt.toISOString(),
          _version: VERSION,
          _dev: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Try WhatsApp first (only if not dev mode)
    if (!messageSent && messagebirdChannelId) {
      try {
        console.log("[send-otp] Attempting WhatsApp via channel:", messagebirdChannelId);
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
          console.log("[send-otp] WhatsApp failed:", errorText);
        }
      } catch (e) {
        console.log("[send-otp] WhatsApp error:", e);
      }
    } else {
      console.log("[send-otp] No WhatsApp channel configured, using SMS");
    }

    // Fallback to SMS (skip in dev mode)
    if (!messageSent && !DEV_MODE) {
      console.log("[send-otp] Sending SMS...");
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
        const errorData = await smsResponse.text();
        console.error("[send-otp] SMS failed:", errorData);
        throw new Error("Kon verificatiecode niet versturen. Probeer het opnieuw.");
      }
    }

    // Store OTP in database
    const { error: otpError } = await supabase
      .from("otp_codes")
      .upsert({
        phone: formattedPhone,
        code: otp,
        expires_at: expiresAt.toISOString(),
        anonymous_user_id: anonymousUserId || null,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "phone",
      });

    if (otpError) {
      console.error("[send-otp] Error storing OTP:", otpError);
    }

    console.log(`[send-otp] Success - method: ${sendMethod}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        method: sendMethod,
        phone: formattedPhone,
        expiresAt: expiresAt.toISOString(),
        _version: VERSION,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-otp] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, _version: VERSION }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
