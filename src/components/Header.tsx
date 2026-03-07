import { Atom, Menu, LogOut, User, LayoutDashboard, MessageSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick?: () => void;
  onAuthClick?: () => void;
}

export function Header({ onMenuClick, onAuthClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      toast({ title: "Signed out successfully", description: "See you next time!" });
    } catch (error: any) {
      if (error?.message?.includes("Auth session missing")) {
        toast({ title: "Signed out successfully", description: "See you next time!" });
      } else {
        console.error(error);
        toast({ title: "Error", description: "Failed to sign out. Please try again.", variant: "destructive" });
      }
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-inset-top"
    >
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {user && (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={onMenuClick} className="shrink-0 h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-termo-deep-blue to-termo-deep-blue-dark flex items-center justify-center flex-shrink-0"
          >
            <Atom className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
          </motion.div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg sm:text-xl text-foreground truncate">
              Termo<span className="termo-gradient-text">Physics</span>
            </h1>
          </div>
        </div>
        <nav className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          {user && (
            <>
              {[
                { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                { path: "/chat", icon: MessageSquare, label: "AI Chat" },
              ].map((item) => (
                <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={location.pathname === item.path ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="gap-1.5 text-xs sm:text-sm relative overflow-hidden"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {location.pathname === item.path && (
                      <motion.div
                        layoutId="headerActiveTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-termo-light-orange"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
            </>
          )}
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline max-w-[100px] truncate text-xs sm:text-sm">
                      {user.email}
                    </span>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-sm">
                  <User className="h-4 w-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("termo_onboarding_completed_teacher");
                    localStorage.removeItem("termo_onboarding_completed_learner");
                    navigate("/dashboard");
                    window.location.reload();
                  }}
                  className="text-sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Restart Tour
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={signingOut} className="text-destructive text-sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  {signingOut ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="hero" size="sm" onClick={onAuthClick} className="text-xs sm:text-sm">
                Login
              </Button>
            </motion.div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
