type ImageModel = "stable-diffusion-free" | "dreamshaper-free" | "photorealistic-free";

interface ImageGenerationRequest {
  prompt: string;
  model: ImageModel;
}

// Free Hugging Face models - no API key needed
const HF_MODELS = {
  "stable-diffusion-free": "stabilityai/stable-diffusion-2-1",
  "dreamshaper-free": "Lykon/dreamshaper-7",
  "photorealistic-free": "emilianJR/epiCRealism",
};

async function generateWithHuggingFace(
  prompt: string,
  modelId: string
): Promise<string> {
  try {
    // Use Hugging Face Inference API - completely free, no auth needed
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt, parameters: { height: 512, width: 512 } }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Hugging Face error: ${error.error || "Unknown error"}`);
    }

    // Response is a blob (image)
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Image generation error: ${errorMessage}`);
  }
}

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Parse request
    const body: ImageGenerationRequest = await req.json();
    const { prompt, model } = body;

    if (!prompt || !model) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: prompt, model",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Validate model
    const validModels = Object.keys(HF_MODELS);
    if (!validModels.includes(model)) {
      return new Response(
        JSON.stringify({
          error: `Invalid model. Supported: ${validModels.join(", ")}`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Generate image using Hugging Face free API
    const imageUrl = await generateWithHuggingFace(
      prompt,
      HF_MODELS[model as ImageModel]
    );

    return new Response(
      JSON.stringify({
        url: imageUrl,
        model,
        prompt,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in image generation:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
