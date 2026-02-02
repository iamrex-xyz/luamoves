import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BIRD_WORKSPACE_ID = "65485fd5-fbad-4d0b-b51a-dccf866fe97d";
const BIRD_API_URL = `https://api.bird.com/workspaces/${BIRD_WORKSPACE_ID}`;

interface ContactPayload {
  email: string;
  phone?: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BIRD_CONTACTS_API_KEY = Deno.env.get("BIRD_CONTACTS_API_KEY");
    if (!BIRD_CONTACTS_API_KEY) {
      console.error("BIRD_CONTACTS_API_KEY is not configured");
      throw new Error("BIRD_CONTACTS_API_KEY is not configured");
    }

    // Parse the incoming request
    const { email, phone, userId }: ContactPayload = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Bird CRM] Creating contact for user ${userId}: ${email}, phone: ${phone || 'not provided'}`);

    // Build the contact payload for Bird Contacts API
    // Bird API uses identifiers array for contact channels
    const identifiers: Array<{ key: string; value: string }> = [
      { key: "emailaddress", value: email }
    ];

    // Add phone if provided (format: +31612345678)
    if (phone) {
      // Normalize phone number - ensure it has country code
      let normalizedPhone = phone.replace(/\s/g, "").replace(/-/g, "");
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "+31" + normalizedPhone.substring(1);
      } else if (!normalizedPhone.startsWith("+")) {
        normalizedPhone = "+31" + normalizedPhone;
      }
      identifiers.push({ key: "phonenumber", value: normalizedPhone });
    }

    const contactPayload = {
      displayName: email.split("@")[0], // Use email prefix as display name
      identifiers,
      attributes: {
        source: "lua-app",
        userId: userId,
        createdAt: new Date().toISOString(),
      }
    };

    // Create contact in Bird CRM using workspace-specific endpoint
    console.log(`[Bird CRM] Using workspace: ${BIRD_WORKSPACE_ID}`);
    const response = await fetch(`${BIRD_API_URL}/contacts`, {
      method: "POST",
      headers: {
        "Authorization": `AccessKey ${BIRD_CONTACTS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactPayload),
    });

    const responseText = await response.text();
    console.log(`[Bird CRM] Response status: ${response.status}`);
    console.log(`[Bird CRM] Response body: ${responseText}`);

    if (!response.ok) {
      // Log the error but don't fail the signup flow
      console.error(`[Bird CRM] Failed to create contact: ${response.status} - ${responseText}`);
      
      // Return success anyway - we don't want to block user signup
      return new Response(
        JSON.stringify({ 
          success: false, 
          warning: "Contact sync failed but user registration continues",
          error: responseText 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let contactData;
    try {
      contactData = JSON.parse(responseText);
    } catch {
      contactData = { raw: responseText };
    }

    console.log(`[Bird CRM] Contact created successfully for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact synced to Bird CRM",
        contactId: contactData.id || null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Bird CRM] Error:", error);
    
    // Return success anyway - we don't want to block user flows
    return new Response(
      JSON.stringify({ 
        success: false, 
        warning: "Contact sync encountered an error",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
