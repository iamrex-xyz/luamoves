import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const hashOTP = async (otp: string, phone: string): Promise<string> => {
  const data = new TextEncoder().encode(otp + phone);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer));
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-anonymous-user-id",
};

interface VerifyOTPRequest {
  phone: string;
  code: string;
  anonymousUserId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, code, anonymousUserId }: VerifyOTPRequest = await req.json();

    if (!phone || !code) {
      throw new Error("Telefoonnummer en code zijn verplicht");
    }

    // Format phone to E.164
    let formattedPhone = phone.replace(/[^\\d+]/g, "");
    if (formattedPhone.startsWith("00")) {
      formattedPhone = "+" + formattedPhone.slice(2);
    }
    if (formattedPhone.startsWith("0") && !formattedPhone.startsWith("00")) {
      formattedPhone = "+31" + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+31" + formattedPhone;
    }

    console.log(`[verify-otp] Verifying code for ${formattedPhone}`);

    // Get stored OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", formattedPhone)
      .single();

    if (otpError || !otpRecord) {
      console.error("[verify-otp] OTP not found:", otpError);
      throw new Error("Geen verificatiecode gevonden. Vraag een nieuwe aan.");
    }

    // Check expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Delete expired OTP
      await supabase.from("otp_codes").delete().eq("phone", formattedPhone);
      throw new Error("Verificatiecode is verlopen. Vraag een nieuwe aan.");
    }

    // Verify code (hash provided code and compare)
    const hashedCode = await hashOTP(code, formattedPhone);
    if (otpRecord.code !== hashedCode) {
      // Track attempts (optional - for rate limiting)
      const attempts = (otpRecord.attempts || 0) + 1;
      if (attempts >= 5) {
        await supabase.from("otp_codes").delete().eq("phone", formattedPhone);
        throw new Error("Te veel pogingen. Vraag een nieuwe code aan.");
      }
      await supabase
        .from("otp_codes")
        .update({ attempts })
        .eq("phone", formattedPhone);
      throw new Error("Ongeldige code. Probeer opnieuw.");
    }

    // OTP is valid - delete it
    await supabase.from("otp_codes").delete().eq("phone", formattedPhone);

    // Check if user exists with this phone
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", formattedPhone)
      .not("user_id", "is", null)
      .maybeSingle();

    let userId: string;
    let isNewUser = false;

    if (existingProfile?.user_id) {
      // Existing user - sign them in
      userId = existingProfile.user_id;
      console.log(`[verify-otp] Existing user found: ${userId}`);

      // Merge anonymous data if provided
      if (anonymousUserId) {
        console.log(`[verify-otp] Merging anonymous data from ${anonymousUserId}`);
        await supabase.rpc("merge_anonymous_to_user", {
          p_anonymous_user_id: anonymousUserId,
          p_user_id: userId,
        });
      }
    } else {
      // New user - create account
      isNewUser = true;
      
      // Create user in auth.users with phone (email is optional later)
      // We use a placeholder email since Supabase requires email
      const placeholderEmail = `${formattedPhone.replace(/\+/g, "")}@phone.lua.nl`;
      const randomPassword = crypto.randomUUID(); // They'll never use this - OTP only

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: placeholderEmail,
        phone: formattedPhone,
        password: randomPassword,
        email_confirm: true, // Auto-confirm since we verified phone
        phone_confirm: true,
      });

      if (authError) {
        console.error("[verify-otp] Error creating user:", authError);
        throw new Error("Kon account niet aanmaken. Probeer opnieuw.");
      }

      userId = authData.user.id;
      console.log(`[verify-otp] New user created: ${userId}`);

      // Update profile with phone
      await supabase
        .from("profiles")
        .upsert({
          user_id: userId,
          phone: formattedPhone,
        }, { onConflict: "user_id" });

      // Merge anonymous data if provided
      if (anonymousUserId) {
        console.log(`[verify-otp] Merging anonymous data for new user from ${anonymousUserId}`);
        await supabase.rpc("merge_anonymous_to_user", {
          p_anonymous_user_id: anonymousUserId,
          p_user_id: userId,
        });
      }
    }

    // Generate a session token for the user
    // Use admin.generateLink to create a magic link, or sign in directly
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: existingProfile?.user_id 
        ? (await supabase.auth.admin.getUserById(userId)).data.user?.email || `${formattedPhone.replace(/\+/g, "")}@phone.lua.nl`
        : `${formattedPhone.replace(/\+/g, "")}@phone.lua.nl`,
      options: {
        redirectTo: Deno.env.get("SITE_URL") || "https://luamoves.lovable.app",
      }
    });

    if (sessionError) {
      console.error("[verify-otp] Error generating session:", sessionError);
      throw new Error("Kon sessie niet aanmaken. Probeer opnieuw.");
    }

    // Extract token from the hashed_token property
    const token = sessionData.properties?.hashed_token;
    const actionLink = sessionData.properties?.action_link;

    console.log(`[verify-otp] Session created for user ${userId}, isNew: ${isNewUser}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        isNewUser,
        userId,
        // Return the action link that the frontend can use to complete sign-in
        actionLink,
        // Also return a flag to indicate the user should be redirected
        redirectUrl: actionLink,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[verify-otp] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
