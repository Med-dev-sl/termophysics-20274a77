import { cn } from "@/lib/utils";

interface PhysicsIconProps {
  className?: string;
}

export function PhysicsIcon({ className }: PhysicsIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Atom nucleus */}
      <circle
        cx="50"
        cy="50"
        r="8"
        className="fill-termo-light-orange"
      />
      
      {/* Electron orbits */}
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="15"
        className="stroke-primary"
        strokeWidth="2"
        fill="none"
        transform="rotate(0 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="15"
        className="stroke-primary"
        strokeWidth="2"
        fill="none"
        transform="rotate(60 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="15"
        className="stroke-primary"
        strokeWidth="2"
        fill="none"
        transform="rotate(120 50 50)"
      />
      
      {/* Electrons */}
      <circle cx="85" cy="50" r="4" className="fill-termo-light-orange animate-pulse-soft" />
      <circle cx="32" cy="28" r="4" className="fill-termo-light-orange animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
      <circle cx="32" cy="72" r="4" className="fill-termo-light-orange animate-pulse-soft" style={{ animationDelay: "1s" }} />
    </svg>
  );
}
