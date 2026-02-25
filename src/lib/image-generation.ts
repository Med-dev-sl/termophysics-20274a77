export type ImageModel = "stable-diffusion-free" | "dreamshaper-free" | "photorealistic-free";

interface ImageGenerationParams {
  prompt: string;
  model: ImageModel;
}

interface GeneratedImage {
  url: string;
  model: ImageModel;
  prompt: string;
  timestamp: number;
}

const IMAGE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

export async function generatePhysicsImage({
  prompt,
  model,
  onProgress,
  onError,
}: ImageGenerationParams & {
  onProgress?: (status: string) => void;
  onError?: (error: string) => void;
}): Promise<GeneratedImage | null> {
  try {
    onProgress?.("Generating image...");

    const response = await fetch(IMAGE_GEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        const error = "Rate limit exceeded. Please wait a moment and try again.";
        onError?.(error);
        throw new Error(error);
      }
      if (response.status === 402) {
        const error = "Image generation limit reached. Please add credits to continue.";
        onError?.(error);
        throw new Error(error);
      }
      
      const error = errorData.error || "Failed to generate image";
      onError?.(error);
      throw new Error(error);
    }

    const data = await response.json();
    
    if (!data.url) {
      const error = "No image URL received";
      onError?.(error);
      throw new Error(error);
    }

    onProgress?.("Image generated successfully!");

    return {
      url: data.url,
      model,
      prompt,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate image";
    onError?.(message);
    return null;
  }
}

export async function generateImageWithStreaming({
  prompt,
  model,
  onDelta,
  onDone,
  onError,
}: ImageGenerationParams & {
  onDelta: (deltaText: string) => void;
  onDone: (image: GeneratedImage) => void;
  onError: (error: string) => void;
}): Promise<void> {
  const result = await generatePhysicsImage({
    prompt,
    model,
    onProgress: onDelta,
    onError,
  });

  if (result) {
    onDone(result);
  }
}

export const MODEL_CONFIGS: Record<ImageModel, { name: string; description: string; speed: string }> = {
  "stable-diffusion-free": {
    name: "Stable Diffusion 2.1",
    description: "Fast, reliable image generation - completely free!",
    speed: "⚡ Fast (5-10s)",
  },
  "dreamshaper-free": {
    name: "DreamShaper 7",
    description: "Artistic and creative image generation - 100% free",
    speed: "⚡ Fast (5-10s)",
  },
  "photorealistic-free": {
    name: "Photorealistic epiCRealism",
    description: "Realistic physics diagrams and concepts - completely free",
    speed: "⚡ Fast (5-10s)",
  },
};
