import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { PhysicsIcon } from "@/components/PhysicsIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { streamPhysicsChat } from "@/lib/physics-chat";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = (Date.now() + 1).toString();

    // Create initial assistant message
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    const chatHistory = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamPhysicsChat({
      messages: chatHistory,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent } : m
          )
        );
      },
      onDone: () => {
        setIsLoading(false);
      },
      onError: (error) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      },
    });
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 min-h-screen flex flex-col">
        {!hasMessages ? (
          // Hero Section
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-32 h-32 mb-8 animate-float">
              <PhysicsIcon />
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4">
              Explore the Laws of{" "}
              <span className="termo-gradient-text">Physics</span>
            </h2>

            <p className="text-lg text-muted-foreground text-center max-w-xl mb-10">
              Ask any physics question and get detailed explanations with
              illustrations. From thermodynamics to quantum mechanics, we've got
              you covered.
            </p>

            <div className="w-full max-w-2xl mb-8">
              <SuggestedQuestions onSelect={handleSend} />
            </div>

            <div className="w-full max-w-2xl">
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
            <ScrollArea className="flex-1 py-6">
              <div className="space-y-6 pb-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    isLoading={isLoading && message.role === "assistant" && !message.content}
                  />
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-background via-background to-transparent">
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
