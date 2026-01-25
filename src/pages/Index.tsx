import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { PhysicsIcon } from "@/components/PhysicsIcon";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    // Simulated AI response - will be replaced with actual AI integration
    setTimeout(() => {
      const responses: Record<string, string> = {
        "What is thermodynamics?": `**Thermodynamics** is the branch of physics that studies heat, work, temperature, and energy transfer.

🔥 **Key Concepts:**

1. **First Law**: Energy cannot be created or destroyed, only transformed (Conservation of Energy)

2. **Second Law**: Entropy (disorder) of an isolated system always increases

3. **Third Law**: As temperature approaches absolute zero, entropy approaches a minimum

**Applications:** Engines, refrigerators, power plants, and understanding the universe's fate!`,
        "Explain electromagnetic waves": `**Electromagnetic Waves** are oscillating electric and magnetic fields that travel through space at the speed of light.

⚡ **Key Properties:**

- **Speed**: 299,792,458 m/s (in vacuum)
- **No medium required**: Unlike sound, EM waves travel through vacuum
- **Transverse waves**: Fields oscillate perpendicular to direction of travel

**The EM Spectrum:**
Radio → Microwave → Infrared → Visible Light → UV → X-rays → Gamma rays

Light, radio signals, and X-rays are all electromagnetic waves!`,
        "How does quantum mechanics work?": `**Quantum Mechanics** describes the behavior of matter and energy at the atomic and subatomic scale.

🔮 **Core Principles:**

1. **Wave-Particle Duality**: Particles like electrons exhibit both wave and particle properties

2. **Uncertainty Principle**: We cannot simultaneously know both position and momentum precisely

3. **Superposition**: Particles exist in multiple states until measured

4. **Quantum Entanglement**: Particles can be correlated regardless of distance

This is why quantum computers can solve problems classical computers cannot!`,
        "What is nuclear fusion?": `**Nuclear Fusion** is the process where atomic nuclei combine to form heavier nuclei, releasing enormous energy.

☀️ **How It Works:**

1. **Extreme conditions**: Temperatures >100 million °C required
2. **Nuclei overcome repulsion**: Electrostatic forces are overcome
3. **Mass converted to energy**: E = mc² (Einstein's famous equation)

**In the Sun:**
4H → He + Energy (26.7 MeV)

This powers all stars and could provide limitless clean energy on Earth!`,
      };

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          responses[content] ||
          `Great question about "${content}"! 

**Physics Explanation:**

Physics is the fundamental science that studies matter, energy, and their interactions. Your question touches on important concepts that help us understand the natural world.

Let me break this down:

1. **Core Concept**: Every physical phenomenon follows mathematical laws
2. **Energy Conservation**: Energy is always conserved in isolated systems
3. **Applications**: This knowledge enables technology from smartphones to spacecraft

Would you like me to elaborate on any specific aspect?`,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
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
              Ask any physics question and get detailed explanations with illustrations. 
              From thermodynamics to quantum mechanics, we've got you covered.
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
                  />
                ))}
                {isLoading && (
                  <ChatMessage role="assistant" content="" isLoading />
                )}
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
