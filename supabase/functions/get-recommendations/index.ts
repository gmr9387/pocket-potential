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

    const { profile } = await req.json();

    // Fetch all active programs
    const { data: programs, error: programsError } = await supabase
      .from("programs")
      .select("*")
      .eq("is_active", true);

    if (programsError) throw programsError;

    // Use Lovable AI to generate personalized recommendations
    const prompt = `Based on this user profile:
${JSON.stringify(profile, null, 2)}

And these available programs:
${JSON.stringify(programs, null, 2)}

Analyze which programs would be most beneficial for this user. Consider:
1. User's demographics and needs
2. Program eligibility criteria
3. Potential benefit amount and timeline
4. Program category relevance

Return a JSON array of program IDs ranked by relevance (most relevant first), with a match_score (0-100) for each.
Format: [{"id": "program-id", "match_score": 95, "reason": "why this matches"}]`;

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
    const recommendationsText = aiData.choices[0].message.content;
    
    // Parse AI response
    const recommendedIds = JSON.parse(recommendationsText);

    // Match with actual programs and add match scores
    const recommendations = recommendedIds
      .map((rec: any) => {
        const program = programs.find((p: any) => p.id === rec.id);
        if (!program) return null;
        return { ...program, match_score: rec.match_score };
      })
      .filter(Boolean)
      .slice(0, 10);

    return new Response(
      JSON.stringify({ recommendations }),
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
