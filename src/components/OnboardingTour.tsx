import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, SkipForward } from "lucide-react";
import { OnboardingStep } from "@/hooks/useOnboarding";
import { cn } from "@/lib/utils";

interface OnboardingTourProps {
  show: boolean;
  step: OnboardingStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function OnboardingTour({
  show,
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTourProps) {
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isLast = currentIndex === totalSteps - 1;
  const isFirst = currentIndex === 0;
  const isCentered = step.placement === "center" || !step.targetSelector;

  useEffect(() => {
    if (!show || !step.targetSelector) {
      setPosition(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    } else {
      setPosition(null);
    }
  }, [show, step]);

  if (!show) return null;

  const getTooltipStyle = (): React.CSSProperties => {
    if (isCentered || !position) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10001,
      };
    }

    const padding = 16;
    const placement = step.placement || "bottom";
    const style: React.CSSProperties = { position: "fixed", zIndex: 10001 };

    switch (placement) {
      case "bottom":
        style.top = position.top + position.height + padding;
        style.left = Math.max(16, position.left + position.width / 2 - 160);
        break;
      case "top":
        style.bottom = window.innerHeight - position.top + padding;
        style.left = Math.max(16, position.left + position.width / 2 - 160);
        break;
      case "right":
        style.top = position.top + position.height / 2 - 60;
        style.left = position.left + position.width + padding;
        break;
      case "left":
        style.top = position.top + position.height / 2 - 60;
        style.right = window.innerWidth - position.left + padding;
        break;
    }

    return style;
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[10000] transition-opacity duration-300"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={onSkip}
      />

      {/* Highlight cutout for targeted elements */}
      {position && !isCentered && (
        <div
          className="fixed z-[10000] rounded-lg ring-4 ring-accent/60 pointer-events-none"
          style={{
            top: position.top - 4,
            left: position.left - 4,
            width: position.width + 8,
            height: position.height + 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
            backgroundColor: "transparent",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className={cn(
          "w-[320px] max-w-[90vw] rounded-xl border border-border bg-card p-5 shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-300"
        )}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full flex-1 transition-colors",
                i <= currentIndex ? "bg-accent" : "bg-muted"
              )}
            />
          ))}
        </div>

        <h3 className="text-base font-display font-bold mb-1.5 pr-6">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <SkipForward className="h-3 w-3" />
            Skip tour
          </Button>

          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={onPrev} className="gap-1 text-xs">
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
            )}
            <Button variant="hero" size="sm" onClick={onNext} className="gap-1 text-xs">
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
