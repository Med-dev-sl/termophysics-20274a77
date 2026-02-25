import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";

interface GeneratedImageDisplayProps {
  imageUrl: string;
  prompt: string;
  model: string;
  onDownload?: () => void;
  onCopyPrompt?: () => void;
}

export function GeneratedImageDisplay({
  imageUrl,
  prompt,
  model,
  onDownload,
  onCopyPrompt,
}: GeneratedImageDisplayProps) {
  return (
    <Card className="mt-4 bg-gradient-to-b from-muted/50 to-muted">
      <CardContent className="pt-4 space-y-3">
        <div className="space-y-2">
          <Badge variant="secondary">{model}</Badge>
          <p className="text-sm font-medium text-muted-foreground">Generated Image</p>
        </div>

        <div className="bg-background rounded-lg overflow-hidden border border-border">
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>

        <div className="bg-background rounded p-3 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Prompt:</p>
          <p className="text-sm line-clamp-2">{prompt}</p>
        </div>

        <div className="flex gap-2">
          {onCopyPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyPrompt}
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="flex-1"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
