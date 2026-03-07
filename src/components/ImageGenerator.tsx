import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap, Loader2, Copy, RotateCcw } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Torus, Icosahedron, Tetrahedron, Dodecahedron } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

interface ImageGeneratorProps {
  disabled?: boolean;
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
}

type Shape3D = "sphere" | "box" | "torus" | "icosahedron" | "tetrahedron" | "dodecahedron";

const SHAPE_OPTIONS: { value: Shape3D; label: string; description: string }[] = [
  { value: "sphere", label: "Sphere", description: "Perfect for atomic models" },
  { value: "box", label: "Cube", description: "Great for lattice structures" },
  { value: "torus", label: "Torus", description: "Ideal for orbital mechanics" },
  { value: "icosahedron", label: "Icosahedron", description: "Molecular structures" },
  { value: "tetrahedron", label: "Tetrahedron", description: "Crystal formations" },
  { value: "dodecahedron", label: "Dodecahedron", description: "Complex geometries" },
];

const COLORS = [
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#10b981", name: "Green" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#8b5cf6", name: "Purple" },
  { hex: "#ec4899", name: "Pink" },
];

function PhysicsVisualization({
  shape,
  color,
  rotation,
}: {
  shape: Shape3D;
  color: string;
  rotation: { x: number; y: number; z: number };
}) {
  const ShapeComponent = {
    sphere: Sphere,
    box: Box,
    torus: Torus,
    icosahedron: Icosahedron,
    tetrahedron: Tetrahedron,
    dodecahedron: Dodecahedron,
  }[shape];

  const shapeArgs = {
    sphere: [1, 64, 64],
    box: [1, 1, 1],
    torus: [1, 0.4, 64, 100],
    icosahedron: [1],
    tetrahedron: [1],
    dodecahedron: [1],
  }[shape] as any[];

  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 10]} intensity={0.5} color="#8b5cf6" />
      
      <motion.group
        animate={{
          rotateX: rotation.x ? [0, Math.PI * 2] : 0,
          rotateY: rotation.y ? [0, Math.PI * 2] : 0,
          rotateZ: rotation.z ? [0, Math.PI * 2] : 0,
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <ShapeComponent args={shapeArgs as any}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.2}
            wireframe={false}
          />
        </ShapeComponent>
      </motion.group>

      <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={true} />
    </Canvas>
  );
}

export function ImageGenerator({ disabled = false, onImageGenerated }: ImageGeneratorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedShape, setSelectedShape] = useState<Shape3D>("sphere");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [rotation, setRotation] = useState({ x: true, y: true, z: false });
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
    
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setShowVisualization(true);
    onImageGenerated?.(selectedShape, prompt);

    toast({
      title: "Visualization Created",
      description: `3D ${selectedShape} visualization for: ${prompt}`,
    });

    setIsGenerating(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(`${prompt} - ${selectedShape} visualization`);
    toast({
      title: t("chat.copied") || "Copied",
      description: "Visualization details copied to clipboard",
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
          <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">3D Visualize</span>
          <span className="sm:hidden">3D</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">3D Physics Visualization</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Create stunning 3D visualizations of physics concepts with motion effects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="prompt" className="text-sm sm:text-base">
              Physics Concept or Term
            </Label>
            <Input
              id="prompt"
              placeholder="e.g., Quantum entanglement, Atomic structure..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="h-9 sm:h-10 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Describe the physics concept you want to visualize
            </p>
          </div>

          {/* Shape Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base">3D Shape Model</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SHAPE_OPTIONS.map((shape) => (
                <motion.button
                  key={shape.value}
                  onClick={() => setSelectedShape(shape.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition text-xs sm:text-sm ${
                    selectedShape === shape.value
                      ? "border-termo-light-orange bg-termo-light-orange/10"
                      : "border-border hover:border-termo-light-orange/50"
                  }`}
                >
                  <div className="font-semibold">{shape.label}</div>
                  <div className="text-muted-foreground text-xs">{shape.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base">Color Scheme</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <motion.button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-lg border-2 transition ${
                    selectedColor === color.hex
                      ? "border-white scale-110"
                      : "border-gray-400"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base">Rotation Axes</Label>
            <div className="flex gap-3 flex-wrap">
              {["x", "y", "z"].map((axis) => (
                <motion.label
                  key={axis}
                  className="flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <input
                    type="checkbox"
                    checked={rotation[axis as keyof typeof rotation]}
                    onChange={(e) =>
                      setRotation((prev) => ({
                        ...prev,
                        [axis]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Rotate {axis.toUpperCase()}</span>
                </motion.label>
              ))}
            </div>
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
                Creating Visualization...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Generate 3D Visualization
              </>
            )}
          </Button>

          {/* 3D Visualization Display */}
          {showVisualization && (
            <motion.div
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-muted rounded-lg overflow-hidden border h-96">
                <PhysicsVisualization
                  shape={selectedShape}
                  color={selectedColor}
                  rotation={rotation}
                />
              </div>

              {/* Visualization Actions */}
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
                  onClick={() => setShowVisualization(false)}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Reset
                </Button>
              </div>

              {/* Metadata */}
              <Card className="bg-muted/50">
                <CardContent className="pt-3 sm:pt-4 space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold">Shape:</span> {selectedShape}
                  </div>
                  <div>
                    <span className="font-semibold">Color:</span> {selectedColor}
                  </div>
                  <div>
                    <span className="font-semibold">Concept:</span> {prompt}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
