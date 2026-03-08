import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: (score: number) => void;
}

export default function PendulumGame({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"swinging" | "released" | "result">("swinging");
  const [score, setScore] = useState(0);
  const animRef = useRef<number>();
  const state = useRef({ angle: Math.PI / 3, angVel: 0, time: 0, ballX: 0, ballY: 0, released: false, relVx: 0, relVy: 0 });

  const W = 400, H = 350;
  const pivotX = 120, pivotY = 60, length = 150;
  const targetX = 300, targetY = H - 50;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1e1b4b");
    bg.addColorStop(1, "#312e81");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = "#3f3f46";
    ctx.fillRect(0, H - 30, W, 30);

    // Target basket
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(targetX - 20, targetY - 25);
    ctx.lineTo(targetX - 15, targetY);
    ctx.lineTo(targetX + 15, targetY);
    ctx.lineTo(targetX + 20, targetY - 25);
    ctx.stroke();
    ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BASKET", targetX, targetY + 15);

    const s = state.current;

    if (!s.released) {
      // String
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(s.ballX, s.ballY);
      ctx.strokeStyle = "#a1a1aa";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pivot
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#71717a";
      ctx.fill();
    }

    // Ball
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, 10, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(s.ballX - 2, s.ballY - 2, 2, s.ballX, s.ballY, 10);
    g.addColorStop(0, "#60a5fa");
    g.addColorStop(1, "#2563eb");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, []);

  useEffect(() => {
    const animate = () => {
      const s = state.current;
      if (!s.released) {
        // Pendulum physics
        const g = 0.0005;
        s.angVel += -g * Math.sin(s.angle);
        s.angVel *= 0.999; // damping
        s.angle += s.angVel;
        s.ballX = pivotX + length * Math.sin(s.angle);
        s.ballY = pivotY + length * Math.cos(s.angle);
      } else {
        // Free flight
        s.relVy += 0.3;
        s.ballX += s.relVx;
        s.ballY += s.relVy;

        // Check basket hit
        if (s.ballY >= targetY - 15 && s.ballY <= targetY && Math.abs(s.ballX - targetX) < 20) {
          const dist = Math.abs(s.ballX - targetX);
          const pts = dist < 5 ? 100 : dist < 10 ? 80 : 60;
          setScore(pts);
          setPhase("result");
          draw();
          return;
        }

        // Miss
        if (s.ballY > H + 10 || s.ballX > W + 10 || s.ballX < -10) {
          setScore(10);
          setPhase("result");
          draw();
          return;
        }
      }

      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    // Start with initial swing
    state.current.angle = Math.PI / 3;
    state.current.angVel = 0;
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const releaseBall = () => {
    if (phase !== "swinging") return;
    const s = state.current;
    s.released = true;
    // Tangential velocity
    const speed = s.angVel * length;
    s.relVx = speed * Math.cos(s.angle);
    s.relVy = -speed * Math.sin(s.angle);
    setPhase("released");
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold text-foreground">🎪 Pendulum Release</h3>
      <div className="bg-card/60 border border-border rounded-lg p-3 max-w-sm text-center space-y-1">
        <p className="text-xs font-semibold text-primary">📖 Concept: Simple Harmonic Motion & Energy Conservation</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A pendulum converts between potential and kinetic energy as it swings. Releasing at the right moment demonstrates <span className="font-medium text-foreground">conservation of energy (KE + PE = constant)</span> and tangential velocity.
        </p>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Click to release the pendulum at the right moment to land the ball in the basket!
      </p>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-border shadow-lg cursor-pointer" onClick={releaseBall} />
      {phase === "swinging" && (
        <p className="text-xs text-muted-foreground animate-pulse">⏱ Click to release!</p>
      )}
      {phase === "result" && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-2">
          <p className="text-2xl font-bold text-primary">{score} points!</p>
          <button onClick={() => onComplete(score)} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
