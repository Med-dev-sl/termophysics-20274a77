import { useAuth } from "@/hooks/useAuth";

export function useUserRole() {
  const { userRole } = useAuth();
  return {
    isTeacher: userRole === "teacher",
    isStudent: userRole === "learner",
    role: userRole,
  };
}
