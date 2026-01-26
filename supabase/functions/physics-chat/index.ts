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

const IMAGE_PROMPT_SYSTEM = `You are an expert at creating detailed, professional image prompts for physics illustrations.
Given a physics concept, create a prompt that will generate a clear, educational diagram or illustration.
Focus on visual elements that clearly represent the concept. Be specific about colors, labels, and visual style.
The image should be suitable for an educational platform with a professional scientific aesthetic.
Keep the prompt under 200 words. Return ONLY the prompt, no explanations.`;

// Always generate illustrations for physics explanations

async function generateImagePrompt(concept: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: IMAGE_PROMPT_SYSTEM },
        { role: "user", content: `Create an image prompt for: ${concept}` }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate image prompt");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || concept;
}

async function generateImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log("Generating image for:", prompt.substring(0, 100));
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { 
            role: "user", 
            content: `Create a professional, educational physics diagram illustrating: ${prompt}. 
            
Style requirements:
- Clean, scientific illustration
- Clear labels and annotations
- Blue and orange color scheme on white background
- Educational and easy to understand
- Show key concepts visually with arrows and labels
- Include relevant physics symbols and formulas if applicable` 
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image generation failed:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("Image response received");
    
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      console.log("Image generated successfully");
      return imageUrl;
    } else {
      console.log("No image URL in response");
      return null;
    }
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

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

    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()?.content || "";
    
    // Always generate image for physics explanations
    console.log("Starting image generation for:", lastUserMessage.substring(0, 50));
    const imagePromise = (async () => {
      try {
        const imagePrompt = await generateImagePrompt(lastUserMessage, LOVABLE_API_KEY);
        return await generateImage(imagePrompt, LOVABLE_API_KEY);
      } catch (error) {
        console.error("Image pipeline error:", error);
        return null;
      }
    })();

    // Get text response
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

    // Transform stream to inject image at the end

    // Transform stream to inject image at the end
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Pass through all text chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }

        // After text is done, wait for image and inject it
        try {
          const imageUrl = await imagePromise;
          if (imageUrl) {
            // Send image as a special SSE event
            const imageEvent = `data: ${JSON.stringify({ 
              choices: [{ 
                delta: { 
                  content: `\n\n![Physics Illustration](${imageUrl})` 
                } 
              }] 
            })}\n\n`;
            controller.enqueue(encoder.encode(imageEvent));
          }
        } catch (error) {
          console.error("Failed to inject image:", error);
        }

        // Send done signal
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    return new Response(stream, {
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
