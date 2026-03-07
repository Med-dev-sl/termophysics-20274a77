import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = "md", className, text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { container: "w-8 h-8", orbit: "w-6 h-6", dot: "w-1.5 h-1.5" },
    md: { container: "w-16 h-16", orbit: "w-12 h-12", dot: "w-2.5 h-2.5" },
    lg: { container: "w-24 h-24", orbit: "w-18 h-18", dot: "w-3 h-3" },
  };

  const s = sizeMap[size];

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("relative", s.container)}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("absolute rounded-full bg-accent", s.dot)}
            style={{ top: "50%", left: "50%", marginTop: "-4px", marginLeft: "-4px" }}
            animate={{
              x: [0, 20, 0, -20, 0],
              y: [-20, 0, 20, 0, -20],
              scale: [1, 1.3, 1, 0.8, 1],
              opacity: [1, 0.8, 0.6, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
        {/* Core pulse */}
        <motion.div
          className="absolute inset-[30%] rounded-full bg-gradient-to-br from-primary to-accent"
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {text && (
        <motion.p
          className="text-sm font-medium text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/** Inline button spinner replacement for Loader2 */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("w-4 h-4 rounded-full border-2 border-current border-t-transparent mr-2", className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}
