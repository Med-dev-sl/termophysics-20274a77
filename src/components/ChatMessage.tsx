import { cn } from "@/lib/utils";
import { Atom, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
          </div>
        ) : (
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser ? "prose-invert" : "prose-slate dark:prose-invert"
          )}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
