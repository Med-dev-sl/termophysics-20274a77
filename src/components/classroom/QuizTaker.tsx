import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question_text: string;
  question_type: "mcq" | "short_answer" | "file_upload";
  options: string[] | null;
  correct_answer: string | null;
  points: number;
}

interface QuizTakerProps {
  quizId: string;
  quizTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

export function QuizTaker({ quizId, quizTitle, open, onOpenChange, onSubmitted }: QuizTakerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setAnswers({});
      fetchQuestions();
    }
  }, [open, quizId]);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("quiz_questions")
      .select("id, question_text, question_type, options, points")
      .eq("quiz_id", quizId)
      .order("sort_order", { ascending: true });
    // Don't send correct_answer to students
    setQuestions((data as Question[]) || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user || questions.length === 0) return;
    setSubmitting(true);

    try {
      // Create submission
      const { data: submission, error: subErr } = await supabase
        .from("quiz_submissions")
        .insert({ quiz_id: quizId, student_id: user.id })
        .select()
        .single();
      if (subErr) throw subErr;

      // Insert answers
      const answerRows = questions.map((q) => ({
        submission_id: submission.id,
        question_id: q.id,
        answer_text: answers[q.id] || "",
      }));

      const { error: ansErr } = await supabase.from("quiz_answers").insert(answerRows);
      if (ansErr) throw ansErr;

      toast({ title: "Quiz submitted successfully!" });
      onOpenChange(false);
      onSubmitted();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Taking Quiz: {quizTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">This quiz has no questions yet.</p>
          ) : (
            <>
              {questions.map((q, idx) => (
                <div key={q.id} className="space-y-3 p-4 border rounded-lg">
                  <p className="font-bold">
                    Q{idx + 1}: {q.question_text}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">({q.points} pts)</span>
                  </p>

                  {q.question_type === "mcq" && q.options ? (
                    <div className="space-y-2 pl-2">
                      {(q.options as string[]).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className="accent-primary"
                          />
                          {String.fromCharCode(65 + i)}. {opt}
                        </label>
                      ))}
                    </div>
                  ) : q.question_type === "file_upload" ? (
                    <p className="text-xs text-muted-foreground italic">File upload not yet supported in this view.</p>
                  ) : (
                    <Textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Type your answer here..."
                    />
                  )}
                </div>
              ))}
              <Button onClick={handleSubmit} disabled={submitting} className="w-full" variant="hero">
                {submitting ? "Submitting..." : "Submit All Answers"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
