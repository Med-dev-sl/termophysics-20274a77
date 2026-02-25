import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question_text: string;
  question_type: "mcq" | "short_answer" | "file_upload";
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  sort_order: number;
}

interface QuizQuestionManagerProps {
  quizId: string;
  quizTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizQuestionManager({ quizId, quizTitle, open, onOpenChange }: QuizQuestionManagerProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // New question form
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"mcq" | "short_answer" | "file_upload">("mcq");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [points, setPoints] = useState("10");

  useEffect(() => {
    if (open) fetchQuestions();
  }, [open, quizId]);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("sort_order", { ascending: true });
    setQuestions((data as Question[]) || []);
    setLoading(false);
  };

  const resetForm = () => {
    setQuestionText("");
    setQuestionType("mcq");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setPoints("10");
  };

  const handleAdd = async () => {
    if (!questionText.trim()) return;

    const insert: any = {
      quiz_id: quizId,
      question_text: questionText.trim(),
      question_type: questionType,
      sort_order: questions.length,
      points: parseInt(points) || 10,
    };

    if (questionType === "mcq") {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast({ variant: "destructive", title: "MCQ needs at least 2 options" });
        return;
      }
      if (!correctAnswer) {
        toast({ variant: "destructive", title: "Select the correct answer" });
        return;
      }
      insert.options = validOptions;
      insert.correct_answer = correctAnswer;
    } else if (questionType === "short_answer" && correctAnswer.trim()) {
      insert.correct_answer = correctAnswer.trim();
    }

    const { error } = await supabase.from("quiz_questions").insert(insert);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Question added!" });
      resetForm();
      fetchQuestions();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      fetchQuestions();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Questions: {quizTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add question form */}
          <div className="space-y-4 border p-4 rounded-lg bg-muted/50">
            <h4 className="font-bold">Add New Question</h4>

            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter question..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value as any);
                    setCorrectAnswer("");
                  }}
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="file_upload">File Upload</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
              </div>
            </div>

            {questionType === "mcq" && (
              <div className="space-y-3">
                <Label>Options (select correct answer)</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctAnswer === opt && opt !== ""}
                      onChange={() => setCorrectAnswer(opt)}
                      disabled={!opt.trim()}
                      className="accent-primary"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                        if (correctAnswer === opt) setCorrectAnswer(e.target.value);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1"
                    />
                  </div>
                ))}
                {options.length < 6 && (
                  <Button variant="ghost" size="sm" onClick={() => setOptions([...options, ""])}>
                    <Plus className="h-3 w-3 mr-1" /> Add Option
                  </Button>
                )}
              </div>
            )}

            {questionType === "short_answer" && (
              <div className="space-y-2">
                <Label>Correct Answer (optional, for auto-grading)</Label>
                <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Expected answer..." />
              </div>
            )}

            <Button onClick={handleAdd} className="w-full" variant="hero" disabled={!questionText.trim()}>
              Add Question
            </Button>
          </div>

          {/* Questions list */}
          <div className="space-y-3">
            <h4 className="font-bold">Current Questions ({questions.length})</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions added yet.</p>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="p-3 border rounded-md bg-background space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-muted-foreground mr-2">#{idx + 1}</span>
                      <span className="text-sm">{q.question_text}</span>
                      <span className="ml-2 text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded">{q.question_type}</span>
                      <span className="ml-1 text-[10px] text-muted-foreground">{q.points}pts</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  {q.question_type === "mcq" && q.options && (
                    <div className="pl-6 text-xs space-y-0.5">
                      {(q.options as string[]).map((opt, i) => (
                        <p key={i} className={opt === q.correct_answer ? "text-green-500 font-bold" : "text-muted-foreground"}>
                          {String.fromCharCode(65 + i)}. {opt} {opt === q.correct_answer && "✓"}
                        </p>
                      ))}
                    </div>
                  )}
                  {q.question_type === "short_answer" && q.correct_answer && (
                    <p className="pl-6 text-xs text-green-500">Answer: {q.correct_answer}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
