import { Variants } from "framer-motion";

// Page transition variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.3 } },
};

// Staggered container
export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// Staggered item
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// Slide from left
export const slideFromLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Slide from right
export const slideFromRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Scale up fade
export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring", stiffness: 200, damping: 20 } },
};

// Float animation (continuous)
export const floatAnimation = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
};

// 3D card hover
export const card3DHover = {
  rest: {
    rotateX: 0, rotateY: 0, scale: 1, z: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.03, z: 30,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Glow pulse for cards
export const glowPulse: Variants = {
  initial: { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)" },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(245, 158, 11, 0)",
      "0 0 20px 2px rgba(245, 158, 11, 0.15)",
      "0 0 0 0 rgba(245, 158, 11, 0)",
    ],
    transition: { duration: 3, repeat: Infinity },
  },
};

// Tab content animation
export const tabContent: Variants = {
  initial: { opacity: 0, x: 10, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -10, filter: "blur(4px)", transition: { duration: 0.2 } },
};

// Table row animation
export const tableRow: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: "easeOut" },
  }),
};

// Button press animation
export const buttonPress = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { type: "spring" as const, stiffness: 400, damping: 15 },
};

// Shimmer effect for loading
export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
};
