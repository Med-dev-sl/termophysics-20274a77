import { cn } from "@/lib/utils";
import { Atom, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUser
            ? "bg-termo-light-orange/20 text-termo-light-orange"
            : "bg-primary/10 text-primary"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Atom className="w-5 h-5" />}
      </div>
      <div
        className={cn(
          "flex-1 max-w-[80%] rounded-2xl px-5 py-4",
          isUser
            ? "bg-termo-light-orange text-termo-deep-blue-dark rounded-tr-sm"
            : "bg-card shadow-md border border-border rounded-tl-sm"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
}
