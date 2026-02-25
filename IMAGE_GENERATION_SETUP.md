# Physics Image Generation Feature - Setup Guide

## Overview
Your physics chat app now includes an integrated image generation feature that lets users:
- Select from multiple AI image generation models
- Generate visual representations of physics concepts
- Download and manage generated images
- Integrate images directly into conversations

## Architecture

### Frontend Components
- **`ImageGenerator.tsx`**: Dialog component for image generation UI with model selection
- **`GeneratedImageDisplay.tsx`**: Displays generated images with download/copy functionality
- **`image-generation.ts`**: Service layer for image generation API calls

### Backend
- **`supabase/functions/generate-image/index.ts`**: Deno function that handles image generation with three models

## Supported Models

1. **DALL-E 3** (Premium)
   - Advanced image generation
   - Excellent for complex physics visualizations
   - Supports HD quality output
   
2. **Stable Diffusion 3** (Economical)
   - Fast generation
   - Good for quick physics concept visuals
   - Cost-effective
   
3. **Flux Pro** (Advanced)
   - High-quality detailed illustrations
   - Best for professional physics diagrams
   - Latest generation model

## Setup Instructions

### 1. Install API Keys
Add the following environment variables to your Supabase project:

```bash
# In Supabase Dashboard > Project Settings > Secrets

# For DALL-E 3
OPENAI_API_KEY=sk-...

# For Stable Diffusion 3
STABILITYAI_API_KEY=sk-...

# For Flux Pro (uses Replicate)
REPLICATE_API_KEY=...
```

### 2. Get API Keys

**OpenAI API Key** (DALL-E 3):
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and save securely

**Stability AI API Key** (Stable Diffusion):
1. Go to https://api.stability.ai
2. Sign up or log in
3. Generate API key from dashboard

**Replicate API Key** (Flux Pro):
1. Go to https://replicate.com
2. Sign up or log in
3. Create API token from account settings

### 3. Deploy Supabase Function

```bash
supabase functions deploy generate-image
```

### 4. Update Environment Variables

Add to `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Usage

### For Users
1. Click "Generate Image" button in chat interface
2. Select preferred AI model
3. Enter a physics concept or term (e.g., "Quantum Entanglement", "Newton's Laws")
4. Click "Generate Image"
5. Download or copy the generated image

### For Developers

**Using the Image Generator Component:**
```tsx
import { ImageGenerator } from "@/components/ImageGenerator";

<ImageGenerator 
  disabled={isLoading}
  onImageGenerated={(imageUrl, prompt) => {
    // Handle generated image
  }}
/>
```

**Using the Service Directly:**
```tsx
import { generatePhysicsImage } from "@/lib/image-generation";

const result = await generatePhysicsImage({
  prompt: "Explain photosynthesis visually",
  model: "dall-e-3",
  size: "1024x1024",
  onProgress: (status) => console.log(status),
  onError: (error) => console.error(error),
});
```

## Features

### Model Selection
Users can choose between three different models based on:
- **Quality**: DALL-E 3 (high) → Flux Pro → Stable Diffusion (good)
- **Speed**: Stable Diffusion (fastest) → DALL-E 3 → Flux Pro
- **Cost**: Stable Diffusion (lowest) → DALL-E 3 → Flux Pro (highest)

### Image Management
- Download images as PNG files
- Copy generation prompts to clipboard
- View generation metadata
- Integration with conversation history

### Prompt Enhancement
Prompts are automatically enhanced to:
- Request scientific visualization style
- Ensure educational clarity
- Maintain professional appearance
- Focus on physics concepts

## Rate Limiting & Error Handling

The system handles:
- **Rate limits** (HTTP 429): Graceful retry suggestions
- **Credit limits** (HTTP 402): User-friendly quota messages
- **API errors**: Detailed error messages and logging
- **Timeouts**: Configurable polling with backoff

## Database Integration

For authenticated users, generated images can be saved to your Supabase database. Consider adding:

```sql
CREATE TABLE generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  conversation_id UUID,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

## Troubleshooting

### Image generation not working
1. Verify all API keys are correctly set in Supabase secrets
2. Check function logs: `supabase functions get-logs generate-image`
3. Test API keys directly with curl/Postman

### Slow generation
- Stable Diffusion is fastest (3-5 seconds)
- DALL-E 3 takes 15-30 seconds
- Flux Pro takes 20-60 seconds

### API quota exceeded
- Check your API provider dashboard for usage
- Increase quota limits or add billing method
- Switch to economical models (Stable Diffusion)

## Future Enhancements

- [ ] Image history per conversation
- [ ] Custom aspect ratios
- [ ] Style presets for physics concepts
- [ ] Image editing/refinement
- [ ] Batch generation
- [ ] Custom model fine-tuning
- [ ] Multi-language prompt support
- [ ] Image caching/deduplication

## Cost Estimation

Approximate costs per image:
- **DALL-E 3**: $0.04-0.10
- **Stable Diffusion 3**: $0.01-0.03
- **Flux Pro**: $0.03-0.10

Consider implementing usage tracking and quotas for your users.
