import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { PhysicsIcon } from "@/components/PhysicsIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthModal } from "@/components/AuthModal";
import { ConversationsSidebar } from "@/components/ConversationsSidebar";
import { streamPhysicsChat } from "@/lib/physics-chat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useConversation } from "@/hooks/useConversation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    conversationId,
    createConversation,
    saveMessage,
    loadConversation,
    resetConversation,
  } = useConversation();

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

    // Create or use existing conversation for logged-in users
    let currentConvId = conversationId;
    if (user && !currentConvId) {
      currentConvId = await createConversation(content);
    }

    // Save user message
    if (user && currentConvId) {
      await saveMessage(currentConvId, "user", content);
    }

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
      onDone: async () => {
        setIsLoading(false);
        // Save assistant message
        if (user && currentConvId && assistantContent) {
          await saveMessage(currentConvId, "assistant", assistantContent);
        }
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

  const handleSelectConversation = async (id: string | null) => {
    if (!id) {
      handleNewConversation();
      return;
    }
    
    const loadedMessages = await loadConversation(id);
    setMessages(loadedMessages);
  };

  const handleNewConversation = () => {
    setMessages([]);
    resetConversation();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onAuthClick={() => setAuthModalOpen(true)}
      />

      {user && (
        <ConversationsSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      )}

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

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

            <p className="text-lg text-muted-foreground text-center max-w-xl mb-4">
              Ask any physics question and get detailed explanations with
              illustrations. From thermodynamics to quantum mechanics, we've got
              you covered.
            </p>

            {!user && (
              <p className="text-sm text-muted-foreground text-center mb-6">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-termo-light-orange hover:underline font-medium"
                >
                  Sign in
                </button>{" "}
                to save your chat history
              </p>
            )}

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
