import { Atom } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-termo-deep-blue to-termo-deep-blue-dark flex items-center justify-center">
            <Atom className="w-6 h-6 text-termo-light-orange" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              Termo<span className="termo-gradient-text">Physics</span>
            </h1>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <span className="text-sm text-muted-foreground">
            AI-Powered Physics Learning
          </span>
        </nav>
      </div>
    </header>
  );
}
