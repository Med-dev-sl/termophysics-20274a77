import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type FeedbackType = "success" | "error";

interface FeedbackModalProps {
  type: FeedbackType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  autoDismiss?: number; // ms, default 2500 for success
}

export function FeedbackModal({
  type,
  open,
  onOpenChange,
  title,
  description,
  autoDismiss,
}: FeedbackModalProps) {
  useEffect(() => {
    if (!open) return;
    const delay = autoDismiss ?? (type === "success" ? 2500 : 0);
    if (delay > 0) {
      const timer = setTimeout(() => onOpenChange(false), delay);
      return () => clearTimeout(timer);
    }
  }, [open, autoDismiss, type, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm border-none shadow-2xl bg-background/95 backdrop-blur-md">
        <div className="flex flex-col items-center text-center py-4 gap-4">
          <AnimatePresence mode="wait">
            {type === "success" ? <SuccessIcon key="s" /> : <ErrorIcon key="e" />}
          </AnimatePresence>
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-bold text-foreground"
          >
            {title}
          </motion.h3>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-sm text-muted-foreground max-w-[260px]"
            >
              {description}
            </motion.p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SuccessIcon() {
  return (
    <motion.div
      className="relative w-20 h-20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
    >
      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-accent"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 1.8 + i * 0.3, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
        />
      ))}
      {/* Circle background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-secondary"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      />
      {/* Checkmark */}
      <svg viewBox="0 0 52 52" className="absolute inset-0 w-full h-full">
        <motion.path
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        />
      </svg>
      {/* Sparkles */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60) * (Math.PI / 180);
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent"
            style={{ top: "50%", left: "50%" }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * 50,
              y: Math.sin(angle) * 50,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          />
        );
      })}
    </motion.div>
  );
}

function ErrorIcon() {
  return (
    <motion.div
      className="relative w-20 h-20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
    >
      {/* Shake container */}
      <motion.div
        className="absolute inset-0"
        animate={{ x: [0, -6, 6, -4, 4, 0] }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Circle background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-destructive to-destructive/80"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        />
        {/* X mark */}
        <svg viewBox="0 0 52 52" className="absolute inset-0 w-full h-full">
          <motion.path
            fill="none"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth="4"
            strokeLinecap="round"
            d="M17 17l18 18"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          />
          <motion.path
            fill="none"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth="4"
            strokeLinecap="round"
            d="M35 17l-18 18"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* Hook for easy usage */
export function useFeedbackModal() {
  const [state, setState] = useState<{
    open: boolean;
    type: FeedbackType;
    title: string;
    description?: string;
  }>({ open: false, type: "success", title: "" });

  const showSuccess = (title: string, description?: string) =>
    setState({ open: true, type: "success", title, description });

  const showError = (title: string, description?: string) =>
    setState({ open: true, type: "error", title, description });

  const close = () => setState((s) => ({ ...s, open: false }));

  const FeedbackModalComponent = () => (
    <FeedbackModal
      type={state.type}
      open={state.open}
      onOpenChange={(o) => !o && close()}
      title={state.title}
      description={state.description}
    />
  );

  return { showSuccess, showError, FeedbackModalComponent };
}
