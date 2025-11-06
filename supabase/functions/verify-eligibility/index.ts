import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("VITE_SUPABASE_URL")!,
      Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!
    );

    const { programId, userProfile } = await req.json();

    // Fetch program details
    const { data: program, error: programError } = await supabase
      .from("programs")
      .select("*")
      .eq("id", programId)
      .single();

    if (programError) throw programError;

    // Use Lovable AI to verify eligibility
    const prompt = `Analyze if this user is eligible for this program:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Program:
${JSON.stringify(program, null, 2)}

Determine eligibility and provide specific reasons. Return JSON format:
{
  "eligible": true/false,
  "reasons": ["reason 1", "reason 2"],
  "confidence": 0-100
}`;

    const aiResponse = await fetch("https://api.lovable.app/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_AI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const eligibilityResult = JSON.parse(aiData.choices[0].message.content);

    return new Response(
      JSON.stringify(eligibilityResult),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
