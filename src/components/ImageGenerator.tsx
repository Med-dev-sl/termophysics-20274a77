import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generatePhysicsImage, ImageModel, MODEL_CONFIGS } from "@/lib/image-generation";

interface ImageGeneratorProps {
  disabled?: boolean;
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
}

export function ImageGenerator({ disabled = false, onImageGenerated }: ImageGeneratorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ImageModel>("dall-e-3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: t("chat.error"),
        description: t("chat.promptRequired") || "Please enter a physics concept or term",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    const enhancedPrompt = `Scientific illustration of: ${prompt}. Make it educational, clear, and suitable for learning physics concepts. Use professional scientific visualization style.`;

    const result = await generatePhysicsImage({
      prompt: enhancedPrompt,
      model: selectedModel,
      onProgress: (status) => {
        toast({
          title: "Generation Progress",
          description: status,
        });
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description: error,
          variant: "destructive",
        });
      },
    });

    if (result) {
      setGeneratedImage(result.url);
      setCurrentPrompt(prompt);
      onImageGenerated?.(result.url, prompt);
    }

    setIsGenerating(false);
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `physics-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: t("chat.downloaded") || "Downloaded",
        description: t("chat.imageSaved") || "Image saved successfully",
      });
    } catch (error) {
      toast({
        title: t("chat.downloadFailed") || "Download Failed",
        description: t("chat.downloadError") || "Could not download image",
        variant: "destructive",
      });
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt);
    toast({
      title: t("chat.copied") || "Copied",
      description: t("chat.promptCopied") || "Prompt copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2 text-xs sm:text-sm"
        >
          <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Generate Image</span>
          <span className="sm:hidden">Image</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{t("chat.generateImage")}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t("chat.generateDescription") || "Generate visual representations of physics concepts and terms"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Model Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base">{t("chat.selectModel")}</Label>
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as ImageModel)}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(MODEL_CONFIGS) as Array<[ImageModel, (typeof MODEL_CONFIGS)[ImageModel]]>).map(
                  ([model, config]) => (
                    <SelectItem key={model} value={model}>
                      <div className="flex flex-col text-xs sm:text-sm">
                        <span className="font-semibold">{config.name}</span>
                        <span className="text-muted-foreground text-xs">{config.description}</span>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {MODEL_CONFIGS[selectedModel] && (
              <Card className="mt-2">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm">{MODEL_CONFIGS[selectedModel].name}</CardTitle>
                  <CardDescription className="text-xs">
                    {MODEL_CONFIGS[selectedModel].description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="prompt" className="text-sm sm:text-base">{t("chat.concept") || "Physics Concept or Term"}</Label>
            <Input
              id="prompt"
              placeholder={t("chat.conceptExample") || "e.g., Quantum entanglement, Newton's laws..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="h-9 sm:h-10 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t("chat.describePhysics") || "Describe the physics concept you want visualized"}
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full text-sm sm:text-base"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                {t("chat.generating")}
              </>
            ) : (
              <>
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {t("chat.generateImage")}
              </>
            )}
          </Button>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-muted rounded-lg overflow-hidden border">
                <img
                  src={generatedImage}
                  alt={currentPrompt}
                  className="w-full h-auto max-h-60 sm:max-h-96"
                />
              </div>

              {/* Image Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {t("chat.copy")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {t("chat.download")}
                </Button>
              </div>

              {/* Metadata */}
              <Card className="bg-muted/50">
                <CardContent className="pt-3 sm:pt-4 space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold">Model:</span> {MODEL_CONFIGS[selectedModel].name}
                  </div>
                  <div>
                    <span className="font-semibold">Prompt:</span> {currentPrompt}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
