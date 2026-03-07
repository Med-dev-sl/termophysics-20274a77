import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  signUp: (email: string, password: string, role?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('User role fetch result:', { data, error });

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } else {
        setUserRole(data?.role || null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change callback
          // which can cause a deadlock with signUp/signIn promises
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role?: string) => {
    console.log('SignUp called with:', { email, role });

    // Validate role
    if (role && !['learner', 'teacher'].includes(role)) {
      return { error: { message: 'Invalid role. Must be learner or teacher.' } as any };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/chat',
        data: role ? { role } : undefined,
      },
    });
    console.log('SignUp result:', { error });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('SignIn called with:', { email });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('SignIn result:', { error });
    return { error };
  };

  const signOut = async () => {
    try {
      // First, clear local state
      setUser(null);
      setSession(null);

      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Ignore "AuthSessionMissingError" as the user is already logged out
      if (error && error.message !== "Auth session missing!") {
        console.error("Sign out error:", error);
        throw error;
      }
    } catch (error: any) {
      // If it's an AuthSessionMissingError, it's okay - user is already signed out
      if (error?.message?.includes("Auth session missing")) {
        console.log("Session was already cleared");
        return;
      }
      console.error("Failed to sign out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
