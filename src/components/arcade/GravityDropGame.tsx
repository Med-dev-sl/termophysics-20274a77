import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: (score: number) => void;
}

export default function GravityDropGame({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"aim" | "dropping" | "result">("aim");
  const [targetZone, setTargetZone] = useState(0);
  const [score, setScore] = useState(0);
  const [ballX, setBallX] = useState(200);
  const animRef = useRef<number>();
  const ballState = useRef({ x: 200, y: 30, vy: 0, landed: false });

  const canvasWidth = 400;
  const canvasHeight = 350;
  const groundY = canvasHeight - 40;

  useEffect(() => {
    setTargetZone(80 + Math.random() * (canvasWidth - 160));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    sky.addColorStop(0, "#1a1a2e");
    sky.addColorStop(1, "#16213e");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Ground
    ctx.fillStyle = "#2d6a4f";
    ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);

    // Target zone
    ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
    ctx.fillRect(targetZone - 25, groundY - 5, 50, 10);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(targetZone - 25, groundY - 5, 50, 10);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TARGET", targetZone, groundY + 20);

    // Obstacles (wind arrows)
    ctx.strokeStyle = "rgba(99, 179, 237, 0.6)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const arrowY = 80 + i * 80;
      const dir = i % 2 === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2 - dir * 40, arrowY);
      ctx.lineTo(canvasWidth / 2 + dir * 40, arrowY);
      ctx.lineTo(canvasWidth / 2 + dir * 30, arrowY - 5);
      ctx.moveTo(canvasWidth / 2 + dir * 40, arrowY);
      ctx.lineTo(canvasWidth / 2 + dir * 30, arrowY + 5);
      ctx.stroke();
    }

    // Ball
    const b = ballState.current;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
    const ballGrad = ctx.createRadialGradient(b.x - 3, b.y - 3, 2, b.x, b.y, 12);
    ballGrad.addColorStop(0, "#fbbf24");
    ballGrad.addColorStop(1, "#d97706");
    ctx.fillStyle = ballGrad;
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Shadow
    if (b.y > 50) {
      const shadowAlpha = Math.min(0.4, (b.y / groundY) * 0.4);
      ctx.beginPath();
      ctx.ellipse(b.x, groundY, 12 * (b.y / groundY), 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.fill();
    }
  }, [targetZone]);

  const dropBall = () => {
    if (phase !== "aim") return;
    setPhase("dropping");
    ballState.current = { x: ballX, y: 30, vy: 0, landed: false };

    const animate = () => {
      const b = ballState.current;
      if (b.landed) return;

      b.vy += 0.4; // gravity
      // Wind effect
      if (b.y > 60 && b.y < 140) b.x += 0.8;
      if (b.y > 160 && b.y < 240) b.x -= 0.6;
      if (b.y > 240 && b.y < 320) b.x += 0.4;

      b.y += b.vy;

      if (b.y >= groundY - 12) {
        b.y = groundY - 12;
        b.landed = true;
        const dist = Math.abs(b.x - targetZone);
        const pts = dist < 10 ? 100 : dist < 25 ? 70 : dist < 50 ? 40 : 10;
        setScore(pts);
        setPhase("result");
      }

      draw();
      if (!b.landed) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  useEffect(() => {
    if (phase === "aim") {
      ballState.current.x = ballX;
      draw();
    }
  }, [ballX, phase, draw]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold text-foreground">🎯 Gravity Drop</h3>
      <div className="bg-card/60 border border-border rounded-lg p-3 max-w-sm text-center space-y-1">
        <p className="text-xs font-semibold text-primary">📖 Concept: Gravitational Acceleration & Air Resistance</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Objects fall due to gravity (9.8 m/s²) but wind and air resistance alter their path. Learn how forces combine to affect trajectory — the foundation of <span className="font-medium text-foreground">Newton's Second Law (F=ma)</span>.
        </p>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Position the ball and drop it! Wind will push it — try to land on the target.
      </p>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="rounded-xl border border-border shadow-lg cursor-pointer"
        onClick={dropBall}
      />
      {phase === "aim" && (
        <div className="w-full max-w-[400px] space-y-2">
          <input
            type="range"
            min={20}
            max={canvasWidth - 20}
            value={ballX}
            onChange={(e) => setBallX(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
          <p className="text-xs text-center text-muted-foreground">Slide to position, then click canvas to drop!</p>
        </div>
      )}
      {phase === "result" && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-2">
          <p className="text-2xl font-bold text-primary">{score} points!</p>
          <button
            onClick={() => onComplete(score)}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
