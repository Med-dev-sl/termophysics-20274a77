import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Torus } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

interface GeneratedImageDisplayProps {
  imageUrl: string;
  prompt: string;
  model: string;
  onCopyPrompt?: () => void;
}

export function GeneratedImageDisplay({
  imageUrl,
  prompt,
  model,
  onCopyPrompt,
}: GeneratedImageDisplayProps) {
  // Map model to shape for 3D visualization
  const getShapeComponent = (modelType: string) => {
    const lowerModel = modelType.toLowerCase();
    if (lowerModel.includes("sphere") || lowerModel.includes("atom")) return Sphere;
    if (lowerModel.includes("cube") || lowerModel.includes("box")) return Box;
    if (lowerModel.includes("torus") || lowerModel.includes("orbit")) return Torus;
    return Sphere; // default
  };

  const getColor = (modelType: string) => {
    const lowerModel = modelType.toLowerCase();
    if (lowerModel.includes("red")) return "#ef4444";
    if (lowerModel.includes("blue")) return "#3b82f6";
    if (lowerModel.includes("green")) return "#10b981";
    if (lowerModel.includes("purple")) return "#8b5cf6";
    return "#3b82f6"; // default blue
  };

  const ShapeComponent = getShapeComponent(model);
  const color = getColor(model);
  const shapeArgs = ShapeComponent === Sphere ? [1, 64, 64] : ShapeComponent === Box ? [1, 1, 1] : [1, 0.4, 64, 100];

  return (
    <Card className="mt-4 bg-gradient-to-b from-muted/50 to-muted">
      <CardContent className="pt-4 space-y-3">
        <div className="space-y-2">
          <Badge variant="secondary">{model}</Badge>
          <p className="text-sm font-medium text-muted-foreground">3D Visualization</p>
        </div>

        <motion.div
          className="bg-muted/50 rounded-lg overflow-hidden border border-border h-72"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <group>
              <ShapeComponent args={shapeArgs as any}>
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.4}
                  metalness={0.6}
                  roughness={0.2}
                />
              </ShapeComponent>
            </group>
            <OrbitControls autoRotate autoRotateSpeed={3} />
          </Canvas>
        </motion.div>

        <div className="bg-background rounded p-3 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Concept:</p>
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
        </div>
      </CardContent>
    </Card>
  );
}
