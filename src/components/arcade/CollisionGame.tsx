import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: (score: number) => void;
}

export default function CollisionGame({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"predict" | "simulating" | "result">("predict");
  const [prediction, setPrediction] = useState<"left" | "right" | "both">("both");
  const [score, setScore] = useState(0);
  const [actual, setActual] = useState("");
  const animRef = useRef<number>();
  const balls = useRef({
    a: { x: 80, y: 150, vx: 3, r: 20, mass: 2 },
    b: { x: 320, y: 150, vx: -2, r: 14, mass: 1 },
    collided: false,
  });

  const W = 400, H = 300;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < W; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let i = 0; i < H; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

    // Direction arrows (pre-collision)
    const { a, b } = balls.current;

    // Ball A
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
    const ga = ctx.createRadialGradient(a.x - 4, a.y - 4, 3, a.x, a.y, a.r);
    ga.addColorStop(0, "#f87171");
    ga.addColorStop(1, "#dc2626");
    ctx.fillStyle = ga;
    ctx.fill();
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("2kg", a.x, a.y + 4);

    // Ball B
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    const gb = ctx.createRadialGradient(b.x - 3, b.y - 3, 2, b.x, b.y, b.r);
    gb.addColorStop(0, "#60a5fa");
    gb.addColorStop(1, "#2563eb");
    ctx.fillStyle = gb;
    ctx.fill();
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText("1kg", b.x, b.y + 4);

    // Velocity arrows
    if (!balls.current.collided) {
      drawArrow(ctx, a.x + a.r + 5, a.y, a.x + a.r + 30, a.y, "#f87171");
      drawArrow(ctx, b.x - b.r - 5, b.y, b.x - b.r - 30, b.y, "#60a5fa");
    }
  }, []);

  function drawArrow(ctx: CanvasRenderingContext2D, fx: number, fy: number, tx: number, ty: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    const angle = Math.atan2(ty - fy, tx - fx);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 8 * Math.cos(angle - 0.4), ty - 8 * Math.sin(angle - 0.4));
    ctx.lineTo(tx - 8 * Math.cos(angle + 0.4), ty - 8 * Math.sin(angle + 0.4));
    ctx.fillStyle = color;
    ctx.fill();
  }

  const simulate = () => {
    setPhase("simulating");
    balls.current = {
      a: { x: 80, y: 150, vx: 3, r: 20, mass: 2 },
      b: { x: 320, y: 150, vx: -2, r: 14, mass: 1 },
      collided: false,
    };

    let frames = 0;
    const animate = () => {
      const { a, b } = balls.current;
      frames++;

      // Move
      a.x += a.vx;
      b.x += b.vx;

      // Check collision
      if (!balls.current.collided && Math.abs(a.x - b.x) <= a.r + b.r) {
        balls.current.collided = true;
        // Elastic collision
        const v1 = ((a.mass - b.mass) * a.vx + 2 * b.mass * b.vx) / (a.mass + b.mass);
        const v2 = ((b.mass - a.mass) * b.vx + 2 * a.mass * a.vx) / (a.mass + b.mass);
        a.vx = v1;
        b.vx = v2;
      }

      draw();

      if (frames > 180) {
        // Determine result
        let result: string;
        if (a.vx > 0.3 && b.vx > 0.3) result = "both move right";
        else if (a.vx < -0.3 && b.vx < -0.3) result = "both move left";
        else if (a.vx < -0.3) result = "red bounces back";
        else result = "both move right";

        setActual(result);

        // Score based on prediction
        const correctMap: Record<string, string> = {
          left: "red bounces back",
          right: "both move right",
          both: "both move right",
        };
        // The correct answer for this mass ratio is: red continues right slowly, blue bounces right fast
        const isCorrect = prediction === "right";
        setScore(isCorrect ? 100 : 25);
        setPhase("result");
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold text-foreground">💥 Elastic Collision</h3>
      <div className="bg-card/60 border border-border rounded-lg p-3 max-w-sm text-center space-y-1">
        <p className="text-xs font-semibold text-primary">📖 Concept: Conservation of Momentum & Elastic Collisions</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In elastic collisions, both momentum and kinetic energy are conserved. Heavier objects transfer more momentum — explore <span className="font-medium text-foreground">p = mv and m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'</span>.
        </p>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Red (2kg) moves right, Blue (1kg) moves left. After collision, what happens?
      </p>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-border shadow-lg" />
      {phase === "predict" && (
        <div className="space-y-3 w-full max-w-[350px]">
          {[
            { key: "right", label: "Both move right →" },
            { key: "left", label: "← Red bounces back" },
            { key: "both", label: "They both stop" },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setPrediction(opt.key as any)}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition border ${
                prediction === opt.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button onClick={simulate} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            ▶ Simulate!
          </button>
        </div>
      )}
      {phase === "result" && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Result: <span className="font-bold text-foreground">{actual}</span></p>
          <p className="text-2xl font-bold text-primary">{score} points!</p>
          <button onClick={() => onComplete(score)} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
