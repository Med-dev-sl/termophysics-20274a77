import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: (score: number) => void;
}

export default function ProjectileLaunchGame({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"aim" | "flying" | "result">("aim");
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(70);
  const [score, setScore] = useState(0);
  const animRef = useRef<number>();
  const projState = useRef({ x: 40, y: 0, vx: 0, vy: 0, trail: [] as { x: number; y: number }[] });
  const targetXRef = useRef(280 + Math.random() * 80);

  const W = 400, H = 300;
  const groundY = H - 40;
  const targetX = 280 + Math.random() * 80;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0f172a");
    sky.addColorStop(1, "#1e293b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    for (let i = 0; i < 20; i++) {
      ctx.fillRect((i * 53) % W, (i * 37) % (groundY - 20), 1.5, 1.5);
    }

    // Ground
    ctx.fillStyle = "#365314";
    ctx.fillRect(0, groundY, W, H - groundY);

    // Target
    ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
    ctx.fillRect(targetX - 15, groundY - 30, 30, 30);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(targetX - 15, groundY - 30, 30, 30);
    ctx.fillStyle = "#fca5a5";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎯", targetX, groundY - 10);

    // Cannon
    ctx.save();
    ctx.translate(40, groundY);
    ctx.rotate(-angle * Math.PI / 180);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(0, -4, 25, 8);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(40, groundY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#64748b";
    ctx.fill();

    // Trail
    const p = projState.current;
    if (p.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      p.trail.forEach((pt, i) => {
        if (i > 0) ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Projectile
    if (phase !== "aim" || p.trail.length > 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.strokeStyle = "#d97706";
      ctx.stroke();
    }
  }, [angle, phase, targetX]);

  const launch = () => {
    if (phase !== "aim") return;
    setPhase("flying");
    const speed = power * 0.15;
    const rad = angle * Math.PI / 180;
    projState.current = { x: 40, y: groundY, vx: speed * Math.cos(rad), vy: -speed * Math.sin(rad), trail: [] };

    const animate = () => {
      const p = projState.current;
      p.vy += 0.15; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.trail.push({ x: p.x, y: p.y });

      draw();

      if (p.y >= groundY) {
        p.y = groundY;
        const dist = Math.abs(p.x - targetX);
        const pts = dist < 15 ? 100 : dist < 30 ? 75 : dist < 60 ? 50 : dist < 100 ? 25 : 5;
        setScore(pts);
        setPhase("result");
        draw();
        return;
      }
      if (p.x > W + 20 || p.x < -20) {
        setScore(0);
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
      <h3 className="text-xl font-bold text-foreground">🚀 Projectile Launch</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Set angle & power to hit the target!
      </p>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-border shadow-lg" />
      {phase === "aim" && (
        <div className="w-full max-w-[400px] space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-14">Angle: {angle}°</span>
            <input type="range" min={10} max={80} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="flex-1 accent-[hsl(var(--primary))]" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-14">Power: {power}%</span>
            <input type="range" min={20} max={100} value={power} onChange={(e) => setPower(Number(e.target.value))} className="flex-1 accent-[hsl(var(--primary))]" />
          </div>
          <button onClick={launch} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            🔥 Launch!
          </button>
        </div>
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
