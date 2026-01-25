import { Flame, Zap, Waves, Atom } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const suggestions = [
  {
    icon: Flame,
    question: "What is thermodynamics?",
    color: "text-termo-light-orange",
  },
  {
    icon: Zap,
    question: "Explain electromagnetic waves",
    color: "text-yellow-500",
  },
  {
    icon: Waves,
    question: "How does quantum mechanics work?",
    color: "text-blue-400",
  },
  {
    icon: Atom,
    question: "What is nuclear fusion?",
    color: "text-green-400",
  },
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {suggestions.map((item, index) => (
        <button
          key={index}
          onClick={() => onSelect(item.question)}
          className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-termo-light-orange/30 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className={`p-2 rounded-lg bg-muted group-hover:bg-termo-light-orange/10 transition-colors ${item.color}`}>
            <item.icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
            {item.question}
          </span>
        </button>
      ))}
    </div>
  );
}
