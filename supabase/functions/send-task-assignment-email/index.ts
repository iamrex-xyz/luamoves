import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TaskAssignmentRequest {
  recipientEmail: string;
  taskTitle: string;
  taskDescription?: string;
  assignerName?: string;
  appUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[send-task-assignment-email] Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("[send-task-assignment-email] Auth error:", userError);
      throw new Error("Invalid user token");
    }

    const { recipientEmail, taskTitle, taskDescription, assignerName, appUrl }: TaskAssignmentRequest = await req.json();

    if (!recipientEmail || !taskTitle) {
      throw new Error("recipientEmail and taskTitle are required");
    }

    console.log(`[send-task-assignment-email] Sending email to ${recipientEmail} for task "${taskTitle}"`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">📋 Nieuwe taak voor jou!</h1>
            </div>
            
            <p style="color: #525252; line-height: 1.6; margin-bottom: 16px;">
              ${assignerName ? `<strong>${assignerName}</strong> heeft` : "Iemand heeft"} een verhuistaak aan jou toegewezen:
            </p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; color: #0369a1; font-weight: 600; font-size: 18px;">${taskTitle}</p>
              ${taskDescription ? `<p style="margin: 8px 0 0 0; color: #0369a1; font-size: 14px;">${taskDescription}</p>` : ""}
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}" style="display: inline-block; background-color: #0ea5e9; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Bekijk de taak
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
            
            <div style="background-color: #fafafa; padding: 16px; border-radius: 8px;">
              <p style="color: #737373; font-size: 13px; margin: 0; line-height: 1.5;">
                Deze e-mail is verzonden via Lua, jouw verhuisassistent. Je ontvangt dit bericht omdat iemand je heeft toegevoegd aan een verhuistaak.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Lua <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `📋 Nieuwe taak: ${taskTitle}`,
        html: htmlContent,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("[send-task-assignment-email] Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("[send-task-assignment-email] Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, result: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-task-assignment-email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
