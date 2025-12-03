import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("process-reminders cron job started");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0];
    console.log(`Processing reminders for date: ${today}`);

    // Get pending reminders for today
    const { data: pendingReminders, error: fetchError } = await supabase
      .from("scheduled_reminders")
      .select("*")
      .eq("scheduled_for", today)
      .eq("status", "pending");

    if (fetchError) {
      console.error("Error fetching reminders:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingReminders?.length || 0} pending reminders`);

    const results = {
      processed: 0,
      sent: 0,
      cancelled: 0,
      failed: 0,
    };

    for (const reminder of pendingReminders || []) {
      results.processed++;
      console.log(`Processing reminder ${reminder.id} for user ${reminder.user_id}`);

      try {
        // Check if task reminder is disabled for this task
        const { data: disabledReminder } = await supabase
          .from("task_reminder_disabled")
          .select("id")
          .eq("user_id", reminder.user_id)
          .eq("task_id", reminder.task_id)
          .single();

        if (disabledReminder) {
          console.log(`Reminder disabled for task ${reminder.task_id}`);
          await supabase
            .from("scheduled_reminders")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.cancelled++;
          continue;
        }

        // Check if task is already completed
        const { data: taskStatus } = await supabase
          .from("tasks")
          .select("status")
          .eq("user_id", reminder.user_id)
          .eq("task_id", reminder.task_id)
          .single();

        if (taskStatus?.status === "done") {
          console.log(`Task ${reminder.task_id} already completed`);
          await supabase
            .from("scheduled_reminders")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.cancelled++;
          continue;
        }

        // Check user reminder preferences
        const { data: preferences } = await supabase
          .from("reminder_preferences")
          .select("*")
          .eq("user_id", reminder.user_id)
          .single();

        // Get user email from auth
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        const user = users?.find(u => u.id === reminder.user_id);
        
        if (!user?.email) {
          console.error(`No email found for user ${reminder.user_id}`);
          await supabase
            .from("scheduled_reminders")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.failed++;
          continue;
        }

        // Send email reminder if enabled
        if ((reminder.reminder_type === "email_7_days" || reminder.reminder_type === "email_2_days") && 
            (preferences?.email_enabled !== false)) {
          
          // Get task details - check both custom_tasks and task_deadlines
          let taskTitle = "Verhuistaak";
          let deadline = reminder.scheduled_for;

          const { data: customTask } = await supabase
            .from("custom_tasks")
            .select("title, deadline")
            .eq("user_id", reminder.user_id)
            .eq("task_id", reminder.task_id)
            .single();

          if (customTask) {
            taskTitle = customTask.title;
            deadline = customTask.deadline;
          } else {
            const { data: taskDeadline } = await supabase
              .from("task_deadlines")
              .select("deadline")
              .eq("user_id", reminder.user_id)
              .eq("task_id", reminder.task_id)
              .single();
            
            if (taskDeadline) {
              deadline = taskDeadline.deadline;
            }
          }

          // Call send-reminder-email function
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-reminder-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              userId: reminder.user_id,
              userEmail: user.email,
              taskTitle,
              deadline,
              reminderType: reminder.reminder_type,
              appUrl: "https://vxflfyrwituvxhtjcwqg.lovableproject.com",
            }),
          });

          if (emailResponse.ok) {
            console.log(`Email sent for reminder ${reminder.id}`);
          } else {
            console.error(`Failed to send email for reminder ${reminder.id}`);
          }
        }

        // Mark reminder as sent
        await supabase
          .from("scheduled_reminders")
          .update({ 
            status: "sent", 
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq("id", reminder.id);

        results.sent++;
        console.log(`Reminder ${reminder.id} processed successfully`);

      } catch (reminderError) {
        console.error(`Error processing reminder ${reminder.id}:`, reminderError);
        await supabase
          .from("scheduled_reminders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", reminder.id);
        results.failed++;
      }
    }

    console.log("Processing complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in process-reminders:", error);
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
