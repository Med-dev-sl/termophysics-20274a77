import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, suffix = "", className = "", duration = 1.2 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const startTime = useRef<number | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isInView) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isInView, value, duration]);

  return <span ref={ref} className={className}>{display}{suffix}</span>;
}

interface AnimatedProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
}

export function AnimatedProgressBar({ value, className = "", barClassName = "", delay = 0 }: AnimatedProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      {/* Shimmer overlay */}
      {isInView && value > 0 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 1.5, delay: delay + 0.5, repeat: 2 }}
        />
      )}
    </div>
  );
}
