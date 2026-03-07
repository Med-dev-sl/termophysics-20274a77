import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "termo_onboarding_completed";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

const teacherSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to TermoPhysics! 🎓",
    description: "Let's take a quick tour of the platform. You can skip this at any time.",
    placement: "center",
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "Use the sidebar to switch between the Dashboard and AI Chat. You can collapse it for more space.",
    targetSelector: "[data-sidebar]",
    placement: "right",
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description: "This is your home base. Create classrooms, manage students, and track progress all from here.",
    targetSelector: "[data-tour='dashboard-content']",
    placement: "bottom",
  },
  {
    id: "create-classroom",
    title: "Create a Classroom",
    description: "Click 'New Classroom' to create your first class. You'll get a unique code to share with students.",
    targetSelector: "[data-tour='new-classroom']",
    placement: "left",
  },
  {
    id: "ai-chat",
    title: "AI Physics Assistant",
    description: "Use the AI Chat to ask physics questions, generate explanations, and create educational images.",
    targetSelector: "[data-tour='ai-chat-link']",
    placement: "right",
  },
  {
    id: "done",
    title: "You're All Set! 🚀",
    description: "Start by creating a classroom and sharing the code with your students. Happy teaching!",
    placement: "center",
  },
];

const studentSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to TermoPhysics! 📚",
    description: "Let's show you around the platform. You can skip this at any time.",
    placement: "center",
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "Use the sidebar to switch between your Classes and the AI Chat assistant.",
    targetSelector: "[data-sidebar]",
    placement: "right",
  },
  {
    id: "dashboard",
    title: "Your Classes",
    description: "This is where you'll see all your enrolled classes. View notes, assignments, quizzes, and your progress.",
    targetSelector: "[data-tour='dashboard-content']",
    placement: "bottom",
  },
  {
    id: "join-class",
    title: "Join a Classroom",
    description: "Click 'Join Class' and enter the code your teacher gave you to join a classroom.",
    targetSelector: "[data-tour='join-class']",
    placement: "left",
  },
  {
    id: "ai-chat",
    title: "AI Physics Assistant",
    description: "Need help with physics? The AI Chat can explain concepts, solve problems, and generate diagrams.",
    targetSelector: "[data-tour='ai-chat-link']",
    placement: "right",
  },
  {
    id: "done",
    title: "You're Ready! 🎉",
    description: "Join a classroom with your class code and start learning. The AI assistant is always here to help!",
    placement: "center",
  },
];

export function useOnboarding(role: string | null) {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = role === "teacher" ? teacherSteps : studentSteps;

  useEffect(() => {
    if (!role) return;
    const completed = localStorage.getItem(`${ONBOARDING_KEY}_${role}`);
    if (!completed) {
      // Delay to let the page render
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, [role]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const skipTour = useCallback(() => {
    completeTour();
  }, []);

  const completeTour = useCallback(() => {
    if (role) {
      localStorage.setItem(`${ONBOARDING_KEY}_${role}`, "true");
    }
    setShowTour(false);
    setCurrentStep(0);
  }, [role]);

  const restartTour = useCallback(() => {
    setCurrentStep(0);
    setShowTour(true);
  }, []);

  return {
    showTour,
    currentStep,
    steps,
    totalSteps: steps.length,
    nextStep,
    prevStep,
    skipTour,
    restartTour,
    currentStepData: steps[currentStep],
  };
}
