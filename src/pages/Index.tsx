import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { PhysicsIcon } from "@/components/PhysicsIcon";
import { ImageGenerator } from "@/components/ImageGenerator";
import { GeneratedImageDisplay } from "@/components/GeneratedImageDisplay";
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
  imageUrl?: string;
  imagePrompt?: string;
}

const Index = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, { url: string; prompt: string }>>({});
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
          title: t("chat.error") || "Error",
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
    setGeneratedImages({});
    resetConversation();
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    const imageId = Date.now().toString();
    setGeneratedImages((prev) => ({
      ...prev,
      [imageId]: { url: imageUrl, prompt },
    }));
    
    // Add image message to chat
    const imageMessage: Message = {
      id: imageId,
      role: "assistant",
      content: `Generated image for: ${prompt}`,
      imageUrl,
      imagePrompt: prompt,
    };
    setMessages((prev) => [...prev, imageMessage]);
  };

  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `physics-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyImagePrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    });
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

      <main className="pt-16 min-h-screen flex flex-col safe-area-inset-bottom">
        {!hasMessages ? (
          // Hero Section
          <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12 gap-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-8 animate-float">
              <PhysicsIcon />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-center mb-2 sm:mb-4">
              {t("chat.hero.title") || "Explore the Laws of"}{" "}
              <span className="termo-gradient-text">{t("chat.hero.physics") || "Physics"}</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-center max-w-xl mb-4">
              {t("chat.hero.description") || "Ask any physics question and get detailed explanations with illustrations. From thermodynamics to quantum mechanics, we've got you covered."}
            </p>

            {!user && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-termo-light-orange hover:underline font-medium"
                >
                  {t("header.signIn")}
                </button>{" "}
                {t("chat.hero.saveHistory") || "to save your chat history"}
              </p>
            )}

            <div className="w-full max-w-2xl mb-6 sm:mb-8 px-3 sm:px-0 flex gap-2 justify-center">
              <ImageGenerator 
                disabled={isLoading}
                onImageGenerated={handleImageGenerated}
              />
            </div>

            <div className="w-full max-w-2xl px-3 sm:px-0">
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-3 sm:px-4 pb-safe">
            <ScrollArea className="flex-1 py-4 sm:py-6">
              <div className="space-y-4 sm:space-y-6 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className="px-1">
                    <ChatMessage
                      role={message.role}
                      content={message.content}
                      isLoading={isLoading && message.role === "assistant" && !message.content}
                    />
                    {message.imageUrl && (
                      <div className="mt-3 sm:mt-4">
                        <GeneratedImageDisplay
                          imageUrl={message.imageUrl}
                          prompt={message.imagePrompt || ""}
                          model="Physics AI"
                          onDownload={() => handleDownloadImage(message.imageUrl!)}
                          onCopyPrompt={() => handleCopyImagePrompt(message.imagePrompt || "")}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="sticky bottom-0 pb-4 sm:pb-6 pt-3 sm:pt-4 bg-gradient-to-t from-background via-background to-transparent space-y-3 px-1 safe-area-inset-bottom">
              <div className="flex gap-2 justify-center flex-wrap">
                <ImageGenerator 
                  disabled={isLoading}
                  onImageGenerated={handleImageGenerated}
                />
              </div>
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
