import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

const EQUATIONS = [
  "E = mc²", "F = ma", "PV = nRT", "ΔS ≥ 0", "λ = h/p",
  "∇·E = ρ/ε₀", "F = qE", "W = Fd", "KE = ½mv²", "ΔU = Q - W",
  "p = mv", "τ = r × F", "v = fλ", "η = W/Q", "S = k ln Ω",
  "∮ E·dA = Q/ε₀", "ℏω = E", "Ψ(x,t)", "∂²u/∂t²",
];

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; opacity: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    particles.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    }));

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Get computed style for theming
      const style = getComputedStyle(document.documentElement);
      const isDark = document.documentElement.classList.contains("dark");
      const dotColor = isDark ? "245, 158, 11" : "30, 64, 120";
      const lineColor = isDark ? "245, 158, 11" : "30, 64, 120";

      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor}, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.current.length; j++) {
          const p2 = particles.current[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function FloatingEquation({ equation, delay, duration, startX, startY }: {
  equation: string; delay: number; duration: number; startX: number; startY: number;
}) {
  return (
    <motion.span
      className="absolute text-xs sm:text-sm font-mono text-muted-foreground/20 dark:text-muted-foreground/15 select-none pointer-events-none whitespace-nowrap"
      style={{ left: `${startX}%`, top: `${startY}%` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 0.3, 0.3, 0],
        y: [20, -30, -60, -100],
        x: [0, Math.random() * 30 - 15],
        rotate: [0, Math.random() * 10 - 5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 8 + 4,
        ease: "easeInOut",
      }}
    >
      {equation}
    </motion.span>
  );
}

export function PhysicsBackground() {
  const equationElements = useMemo(() =>
    EQUATIONS.slice(0, 12).map((eq, i) => ({
      equation: eq,
      delay: i * 1.5 + Math.random() * 2,
      duration: 8 + Math.random() * 4,
      startX: 5 + Math.random() * 85,
      startY: 10 + Math.random() * 75,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <ParticleCanvas />
      {equationElements.map((props, i) => (
        <FloatingEquation key={i} {...props} />
      ))}
      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-termo-light-orange/5 blur-[100px]"
        animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-primary/5 blur-[80px]"
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}
