import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  userId: string;
  userEmail: string;
  taskTitle: string;
  deadline: string;
  reminderType: "email_7_days" | "email_2_days";
  appUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-reminder-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { userId, userEmail, taskTitle, deadline, reminderType, appUrl }: ReminderEmailRequest = await req.json();

    console.log(`Sending reminder email to ${userEmail} for task "${taskTitle}"`);

    // Create hashed user ID for privacy
    const hashedUserId = btoa(userId).slice(0, 12);

    const daysText = reminderType === "email_7_days" ? "7 dagen" : "2 dagen";
    const deadlineFormatted = new Date(deadline).toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
              <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">📋 Verhuistaak herinnering</h1>
            </div>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; color: #0369a1; font-weight: 600; font-size: 18px;">${taskTitle}</p>
            </div>
            
            <p style="color: #525252; line-height: 1.6; margin-bottom: 8px;">
              <strong>Deadline:</strong> ${deadlineFormatted}
            </p>
            <p style="color: #525252; line-height: 1.6; margin-bottom: 24px;">
              Nog <strong>${daysText}</strong> om deze taak af te ronden.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}" style="display: inline-block; background-color: #0ea5e9; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Open checklist
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
            
            <div style="background-color: #fafafa; padding: 16px; border-radius: 8px;">
              <p style="color: #737373; font-size: 13px; margin: 0 0 8px 0;">
                <strong>Waarom krijg ik dit?</strong>
              </p>
              <p style="color: #737373; font-size: 13px; margin: 0; line-height: 1.5;">
                Je hebt herinneringen ingeschakeld in Charly. Je kunt deze op elk moment uitschakelen via Instellingen → Herinneringen.
              </p>
            </div>
            
            <p style="color: #a3a3a3; font-size: 11px; text-align: center; margin-top: 24px;">
              Ref: ${hashedUserId}
            </p>
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
        from: "Charly <onboarding@resend.dev>",
        to: [userEmail],
        subject: `⏰ Nog ${daysText}: ${taskTitle}`,
        html: htmlContent,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-reminder-email:", error);
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
