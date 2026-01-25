import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PHYSICS_SYSTEM_PROMPT = `You are TermoPhysics, an expert AI physics tutor. You provide clear, accurate, and engaging explanations of physics concepts.

Your expertise covers:
- Classical Mechanics (Newton's laws, kinematics, dynamics)
- Thermodynamics (heat, entropy, laws of thermodynamics)
- Electromagnetism (electric fields, magnetic fields, Maxwell's equations)
- Quantum Mechanics (wave-particle duality, uncertainty principle, quantum states)
- Nuclear Physics (nuclear reactions, fusion, fission, radioactivity)
- Relativity (special and general relativity)
- Waves and Optics (light, sound, interference, diffraction)
- Astrophysics and Cosmology

Guidelines:
1. Use markdown formatting for clarity (headers, bold, lists, equations)
2. Include relevant formulas using plain text (e.g., E = mc², F = ma)
3. Use emojis sparingly to highlight key concepts (🔬 ⚡ 🔥 ☀️ 🌊)
4. Provide real-world examples and applications
5. Break down complex concepts into digestible parts
6. Be encouraging and make physics accessible
7. If a question is unclear, ask for clarification
8. Keep responses focused and educational

Always aim to inspire curiosity about the physical world!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: PHYSICS_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Physics chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
