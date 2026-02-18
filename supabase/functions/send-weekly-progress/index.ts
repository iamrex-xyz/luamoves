import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-weekly-progress function started");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify cron secret to prevent unauthorized access
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || providedSecret !== cronSecret) {
    console.error("Unauthorized: Invalid or missing cron secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users with email reminders enabled
    const { data: usersWithPrefs, error: prefsError } = await supabase
      .from("reminder_preferences")
      .select("user_id")
      .eq("email_enabled", true);

    if (prefsError) throw prefsError;

    console.log(`Found ${usersWithPrefs?.length || 0} users with email enabled`);

    const results = { sent: 0, failed: 0 };

    for (const { user_id } of usersWithPrefs || []) {
      try {
        // Get user email
        const { data: { user } } = await supabase.auth.admin.getUserById(user_id);
        if (!user?.email) continue;

        // Get user's moving date
        const { data: profile } = await supabase
          .from("profiles")
          .select("moving_date, new_address")
          .eq("user_id", user_id)
          .single();

        if (!profile?.moving_date) continue;

        const movingDate = new Date(profile.moving_date);
        const today = new Date();
        const daysUntilMove = Math.ceil((movingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Skip if moving date has passed
        if (daysUntilMove < 0) continue;

        // Get task stats
        const { data: tasks } = await supabase
          .from("tasks")
          .select("status")
          .eq("user_id", user_id);

        const { data: customTasks } = await supabase
          .from("custom_tasks")
          .select("task_id")
          .eq("user_id", user_id);

        // Calculate totals (rough estimate - actual total depends on generated tasks)
        const completedTasks = tasks?.filter(t => t.status === "done").length || 0;
        const totalCustomTasks = customTasks?.length || 0;
        const estimatedTotal = Math.max(20, completedTasks + totalCustomTasks + 10); // Rough estimate
        const percentage = Math.round((completedTasks / estimatedTotal) * 100);

        // Calculate potential savings
        let potentialSavings = 0;
        const openTaskKeywords = ["energie", "internet", "verzekering"];
        // Simple check - in production you'd check actual open tasks
        if (completedTasks < estimatedTotal * 0.5) {
          potentialSavings = 400; // Energy + internet savings estimate
        }

        const movingDateFormatted = movingDate.toLocaleDateString("nl-NL", {
          weekday: "long",
          day: "numeric",
          month: "long",
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
                  <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">📊 Je wekelijkse verhuisupdate</h1>
                </div>
                
                <!-- Progress Section -->
                <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-weight: 600; color: #0369a1;">Je voortgang</span>
                    <span style="font-weight: 700; color: #0369a1; font-size: 24px;">${percentage}%</span>
                  </div>
                  <div style="background-color: #e0f2fe; border-radius: 999px; height: 12px; overflow: hidden;">
                    <div style="background-color: #0ea5e9; height: 100%; width: ${percentage}%; border-radius: 999px;"></div>
                  </div>
                  <p style="color: #0369a1; font-size: 14px; margin-top: 12px; margin-bottom: 0;">
                    ${completedTasks} taken afgerond
                  </p>
                </div>
                
                <!-- Countdown -->
                <div style="text-align: center; margin-bottom: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    📅 Nog <strong>${daysUntilMove} dagen</strong> tot je verhuizing
                  </p>
                  <p style="margin: 4px 0 0; color: #b45309; font-size: 12px;">
                    ${movingDateFormatted}
                  </p>
                </div>
                
                ${potentialSavings > 0 ? `
                <!-- Savings CTA -->
                <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #a7f3d0;">
                  <p style="margin: 0 0 8px; color: #065f46; font-weight: 600;">
                    💸 Bespaar tot €${potentialSavings}
                  </p>
                  <p style="margin: 0; color: #047857; font-size: 14px;">
                    Vergelijk nu energie en internet voor je nieuwe adres
                  </p>
                </div>
                ` : ""}
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://vxflfyrwituvxhtjcwqg.lovableproject.com" style="display: inline-block; background-color: #0ea5e9; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Bekijk je checklist
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
                
                <div style="background-color: #fafafa; padding: 16px; border-radius: 8px;">
                  <p style="color: #737373; font-size: 13px; margin: 0 0 8px 0;">
                    <strong>Waarom krijg ik dit?</strong>
                  </p>
                  <p style="color: #737373; font-size: 13px; margin: 0; line-height: 1.5;">
                    Je ontvangt wekelijks een voortgangsupdate. Uitschakelen kan via Instellingen → Herinneringen.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send email
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Charly <onboarding@resend.dev>",
            to: [user.email],
            subject: `📊 ${percentage}% klaar - Nog ${daysUntilMove} dagen tot je verhuizing`,
            html: htmlContent,
          }),
        });

        if (emailResponse.ok) {
          results.sent++;
          console.log(`Weekly progress sent to ${user.email}`);
        } else {
          results.failed++;
          const error = await emailResponse.json();
          console.error(`Failed to send to ${user.email}:`, error);
        }

      } catch (userError) {
        console.error(`Error processing user ${user_id}:`, userError);
        results.failed++;
      }
    }

    console.log("Weekly progress complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-weekly-progress:", error);
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
