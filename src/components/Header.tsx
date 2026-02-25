import { Atom, Menu, LogOut, User, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick?: () => void;
  onAuthClick?: () => void;
}

export function Header({ onMenuClick, onAuthClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      // If it's an auth session missing error, treat it as success
      if (error?.message?.includes("Auth session missing")) {
        toast({
          title: "Signed out successfully",
          description: "See you next time!",
        });
      } else {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-inset-top">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="shrink-0 h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-termo-deep-blue to-termo-deep-blue-dark flex items-center justify-center flex-shrink-0">
            <Atom className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg sm:text-xl text-foreground truncate">
              Termo<span className="termo-gradient-text">Physics</span>
            </h1>
          </div>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span className="hidden lg:block text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            AI-Powered Physics Learning
          </span>
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline max-w-[100px] truncate text-xs sm:text-sm">
                    {user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} disabled={signingOut} className="text-destructive text-sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  {signingOut ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="hero" size="sm" onClick={onAuthClick} className="text-xs sm:text-sm">
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
