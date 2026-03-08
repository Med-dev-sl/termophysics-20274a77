import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: (score: number) => void;
}

export default function BounceGame({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"guess" | "simulating" | "result">("guess");
  const [guess, setGuess] = useState(3);
  const [actualBounces, setActualBounces] = useState(0);
  const [score, setScore] = useState(0);
  const animRef = useRef<number>();
  const ballRef = useRef({ x: 60, y: 30, vx: 3, vy: 0, bounces: 0 });
  const trailRef = useRef<{ x: number; y: number; alpha: number }[]>([]);

  const W = 400, H = 300;
  const groundY = H - 35;
  const elasticity = 0.65;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#064e3b");
    bg.addColorStop(1, "#065f46");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = "#854d0e";
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = "#a16207";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Trail
    trailRef.current.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(52, 211, 153, ${pt.alpha})`;
      ctx.fill();
      pt.alpha *= 0.98;
    });
    trailRef.current = trailRef.current.filter(pt => pt.alpha > 0.05);

    // Ball
    const b = ballRef.current;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(b.x - 3, b.y - 3, 2, b.x, b.y, 12);
    g.addColorStop(0, "#34d399");
    g.addColorStop(1, "#059669");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bounce counter
    ctx.fillStyle = "#ecfdf5";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Bounces: ${b.bounces}`, 15, 25);
  }, []);

  const startSimulation = () => {
    setPhase("simulating");
    ballRef.current = { x: 60, y: 30, vx: 2.5, vy: 0, bounces: 0 };
    trailRef.current = [];

    const animate = () => {
      const b = ballRef.current;
      b.vy += 0.35;
      b.x += b.vx;
      b.y += b.vy;

      trailRef.current.push({ x: b.x, y: b.y, alpha: 0.6 });

      if (b.y >= groundY - 12) {
        b.y = groundY - 12;
        b.vy = -b.vy * elasticity;
        if (Math.abs(b.vy) > 1) b.bounces++;
      }

      draw();

      if ((Math.abs(b.vy) < 1 && b.y >= groundY - 14) || b.x > W + 20) {
        setActualBounces(b.bounces);
        const diff = Math.abs(b.bounces - guess);
        const pts = diff === 0 ? 100 : diff === 1 ? 70 : diff === 2 ? 40 : 10;
        setScore(pts);
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
      <h3 className="text-xl font-bold text-foreground">🏀 Bounce Predictor</h3>
      <div className="bg-card/60 border border-border rounded-lg p-3 max-w-sm text-center space-y-1">
        <p className="text-xs font-semibold text-primary">📖 Concept: Coefficient of Restitution & Energy Loss</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Each bounce loses energy due to inelastic deformation. The ratio of speeds before and after impact is the <span className="font-medium text-foreground">coefficient of restitution (e = v₂/v₁)</span>. Predict how energy dissipates!
        </p>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        How many times will the ball bounce? Guess before it drops!
      </p>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-border shadow-lg" />
      {phase === "guess" && (
        <div className="space-y-3 w-full max-w-[300px]">
          <div className="flex items-center justify-center gap-4">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setGuess(n)}
                className={`w-10 h-10 rounded-full font-bold text-sm transition ${
                  guess === n ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button onClick={startSimulation} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            Drop the Ball!
          </button>
        </div>
      )}
      {phase === "result" && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">It bounced <span className="font-bold text-foreground">{actualBounces}</span> times! You guessed <span className="font-bold text-foreground">{guess}</span>.</p>
          <p className="text-2xl font-bold text-primary">{score} points!</p>
          <button onClick={() => onComplete(score)} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
