import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  application_id: string;
  new_status: string;
  program_title: string;
}

const statusMessages: Record<string, { subject: string; message: string }> = {
  approved: {
    subject: "🎉 Great News! Your Application Has Been Approved",
    message: "Congratulations! Your application has been approved. Log in to FundFinder to see the next steps.",
  },
  denied: {
    subject: "Application Status Update",
    message: "We regret to inform you that your application was not approved. Please log in to FundFinder for more details and to explore other programs.",
  },
  in_review: {
    subject: "Your Application Is Under Review",
    message: "Good news! Your application is now being reviewed by our team. We'll notify you once a decision is made.",
  },
  submitted: {
    subject: "Application Submitted Successfully",
    message: "Your application has been submitted successfully. We'll review it and get back to you soon.",
  },
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, application_id, new_status, program_title }: NotificationRequest = await req.json();

    // Get user email from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user_id)
      .single();

    if (profileError || !profile?.email) {
      console.log("No email found for user:", user_id);
      return new Response(
        JSON.stringify({ success: false, message: "User email not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusInfo = statusMessages[new_status] || {
      subject: "Application Status Update",
      message: `Your application status has been updated to: ${new_status}`,
    };

    // Create in-app notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        title: statusInfo.subject,
        message: `${program_title}: ${statusInfo.message}`,
        type: "application_update",
        action_url: "/dashboard",
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    // Log the email that would be sent (in production, integrate with Resend)
    console.log("Email notification would be sent to:", profile.email);
    console.log("Subject:", statusInfo.subject);
    console.log("Message:", statusInfo.message);

    // For now, return success - in production, integrate with email service
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification created",
        email: profile.email,
        would_send: {
          to: profile.email,
          subject: statusInfo.subject,
          body: statusInfo.message,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-notification-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
