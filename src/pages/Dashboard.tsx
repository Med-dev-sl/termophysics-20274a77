import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AppLayout } from "@/components/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Navigate } from "react-router-dom";
import { AnimatedPage } from "@/components/ui/motion-primitives";

const Dashboard = () => {
  const { user, loading, userRole } = useAuth();
  const { isTeacher } = useUserRole();
  const { showTour, currentStep, steps, totalSteps, nextStep, prevStep, skipTour, currentStepData } = useOnboarding(userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <AnimatedPage className="container mx-auto px-4 py-8">
        {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
      </AnimatedPage>
      {currentStepData && (
        <OnboardingTour
          show={showTour}
          step={currentStepData}
          currentIndex={currentStep}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
        />
      )}
    </AppLayout>
  );
};

export default Dashboard;
