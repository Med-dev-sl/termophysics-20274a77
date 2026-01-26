import { Atom, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-termo-deep-blue to-termo-deep-blue-dark flex items-center justify-center">
            <Atom className="w-6 h-6 text-termo-light-orange" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              Termo<span className="termo-gradient-text">Physics</span>
            </h1>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <span className="hidden md:block text-sm text-muted-foreground">
            AI-Powered Physics Learning
          </span>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="hero" size="sm" onClick={onAuthClick}>
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
