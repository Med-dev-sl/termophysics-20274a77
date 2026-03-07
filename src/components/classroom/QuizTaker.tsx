import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner, ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";

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

    setQuestions((data as Question[]) || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user || questions.length === 0) return;
    setSubmitting(true);

    try {
      // 1. Fetch correct answers securely at submission time
      const { data: qData, error: qErr } = await supabase
        .from("quiz_questions")
        .select("id, question_type, correct_answer, points")
        .eq("quiz_id", quizId);

      if (qErr) throw qErr;

      // 2. Create submission
      const { data: submission, error: subErr } = await supabase
        .from("quiz_submissions")
        .insert({
          quiz_id: quizId,
          student_id: user.id,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (subErr) throw subErr;

      // 3. Process answers and calculate automatic scores
      let totalAutoScore = 0;
      let allAutoGraded = true;

      const answerRows = questions.map((q) => {
        const studentAnswer = (answers[q.id] || "").trim();
        const questionDetail = qData.find(qd => qd.id === q.id);

        let isCorrect = null;
        let pointsEarned = 0;
        let canAutoGrade = false;

        if (questionDetail) {
          if (q.question_type === "mcq") {
            canAutoGrade = true;
            isCorrect = studentAnswer === questionDetail.correct_answer;
            pointsEarned = isCorrect ? questionDetail.points : 0;
          } else if (q.question_type === "short_answer") {
            // Auto-grade short answer only if a "correct answer" template exists
            if (questionDetail.correct_answer) {
              canAutoGrade = true;
              isCorrect = studentAnswer.toLowerCase() === questionDetail.correct_answer.toLowerCase();
              pointsEarned = isCorrect ? questionDetail.points : 0;
            } else {
              allAutoGraded = false;
            }
          } else {
            allAutoGraded = false; // File upload cannot be auto-graded
          }
        }

        if (canAutoGrade) {
          totalAutoScore += pointsEarned;
        }

        return {
          submission_id: submission.id,
          question_id: q.id,
          answer_text: studentAnswer,
          is_correct: isCorrect,
          score: canAutoGrade ? pointsEarned : null
        };
      });

      // 4. Save answers
      const { error: ansErr } = await supabase.from("quiz_answers").insert(answerRows);
      if (ansErr) throw ansErr;

      // 5. Update submission with total score and graded_at if fully auto-graded
      const updateData: any = {
        total_score: totalAutoScore
      };

      if (allAutoGraded) {
        updateData.graded_at = new Date().toISOString();
      }

      await supabase
        .from("quiz_submissions")
        .update(updateData)
        .eq("id", submission.id);

      toast({
        title: "Quiz submitted!",
        description: allAutoGraded
          ? `Your score: ${totalAutoScore} points`
          : "Submitted successfully. Some questions require teacher review."
      });

      onOpenChange(false);
      onSubmitted();
    } catch (err: any) {
      console.error("Submission error:", err);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-termo-sky-blue/30">
        <DialogHeader>
          <DialogTitle className="text-termo-deep-blue flex items-center gap-2">
            Taking Quiz: {quizTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-termo-sky-blue" />
            </div>
          ) : questions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">This quiz has no questions yet.</p>
          ) : (
            <>
              {questions.map((q, idx) => (
                <div key={q.id} className="space-y-3 p-4 border rounded-lg bg-background shadow-sm hover:border-termo-sky-blue/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-termo-deep-blue">
                      Q{idx + 1}: {q.question_text}
                    </p>
                    <span className="text-xs font-semibold bg-termo-sky-blue/10 text-termo-sky-blue px-2 py-1 rounded">
                      {q.points} PTS
                    </span>
                  </div>

                  {q.question_type === "mcq" && q.options ? (
                    <div className="space-y-2 pl-2">
                      {(q.options as string[]).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded hover:bg-muted/50 transition-colors">
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className="accent-termo-sky-blue h-4 w-4"
                          />
                          <span className="font-medium mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
                        </label>
                      ))}
                    </div>
                  ) : q.question_type === "file_upload" ? (
                    <div className="p-4 border border-dashed rounded-lg bg-muted/20 text-center">
                      <p className="text-xs text-muted-foreground italic">File upload should be provided as text for now.</p>
                      <Textarea
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Paste link or description of your file..."
                        className="mt-2"
                      />
                    </div>
                  ) : (
                    <Textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Type your answer here..."
                      className="border-termo-sky-blue/20 focus-visible:ring-termo-sky-blue"
                    />
                  )}
                </div>
              ))}
              <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 text-lg" variant="hero">
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Submitting Answers...
                  </>
                ) : "Complete & Submit"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
