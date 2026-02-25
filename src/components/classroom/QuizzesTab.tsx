import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Brain, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { QuizQuestionManager } from "./QuizQuestionManager";
import { QuizTaker } from "./QuizTaker";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  time_limit_minutes: number | null;
  max_score: number;
}

interface QuizzesTabProps {
  classroomId: string;
  isTeacher: boolean;
}

export function QuizzesTab({ classroomId, isTeacher }: QuizzesTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [creating, setCreating] = useState(false);

  // Question manager
  const [manageQuizId, setManageQuizId] = useState<string | null>(null);
  const [manageQuizTitle, setManageQuizTitle] = useState("");

  // Student quiz taking
  const [takeQuizId, setTakeQuizId] = useState<string | null>(null);
  const [takeQuizTitle, setTakeQuizTitle] = useState("");
  const [userSubmissions, setUserSubmissions] = useState<Set<string>>(new Set());

  // Teacher view results
  const [viewResultsOpen, setViewResultsOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    if (!isTeacher && user) fetchUserSubmissions();
  }, [classroomId, user, isTeacher]);

  const fetchQuizzes = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });
    setQuizzes(data || []);
    setLoading(false);
  };

  const fetchUserSubmissions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_submissions")
      .select("quiz_id")
      .eq("student_id", user.id);
    if (data) setUserSubmissions(new Set(data.map(s => s.quiz_id)));
  };

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    setCreating(true);
    const { error } = await supabase.from("quizzes").insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
    });
    setCreating(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Quiz created!" });
      setDialogOpen(false);
      setTitle(""); setDescription(""); setDueDate(""); setTimeLimit("");
      fetchQuizzes();
    }
  };

  const fetchSubmissions = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setLoadingSubmissions(true);
    setViewResultsOpen(true);

    const { data, error } = await supabase
      .from("quiz_submissions")
      .select(`*, profiles:student_id (display_name, email), quiz_answers (id, answer_text, question_id, is_correct, score)`)
      .eq("quiz_id", quiz.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setSubmissions(data || []);
    }
    setLoadingSubmissions(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading quizzes...</p>;

  return (
    <div className="space-y-4">
      {isTeacher && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="h-4 w-4 mr-2" /> New Quiz</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Quiz</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz 1" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Quiz description..." rows={3} /></div>
              <div className="space-y-2"><Label>Due Date</Label><Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Time Limit (minutes, optional)</Label><Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="30" /></div>
              <Button onClick={handleCreate} disabled={creating || !title.trim()} className="w-full" variant="hero">{creating ? "Creating..." : "Create Quiz"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {quizzes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No quizzes yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    {q.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isTeacher ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => { setManageQuizId(q.id); setManageQuizTitle(q.title); }}>
                          Questions
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => fetchSubmissions(q)}>
                          View Results
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant={userSubmissions.has(q.id) ? "outline" : "hero"}
                        size="sm"
                        disabled={userSubmissions.has(q.id)}
                        onClick={() => { setTakeQuizId(q.id); setTakeQuizTitle(q.title); }}
                      >
                        {userSubmissions.has(q.id) ? "Already Submitted" : "Take Quiz"}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {q.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {format(new Date(q.due_date), "MMM d, yyyy h:mm a")}
                    </span>
                  )}
                  {q.time_limit_minutes && <span>{q.time_limit_minutes} min</span>}
                </div>
              </CardHeader>
              {q.description && (
                <CardContent><p className="text-sm text-muted-foreground">{q.description}</p></CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Teacher question manager */}
      <QuizQuestionManager
        quizId={manageQuizId || ""}
        quizTitle={manageQuizTitle}
        open={!!manageQuizId}
        onOpenChange={(open) => { if (!open) setManageQuizId(null); }}
      />

      {/* Student quiz taker */}
      <QuizTaker
        quizId={takeQuizId || ""}
        quizTitle={takeQuizTitle}
        open={!!takeQuizId}
        onOpenChange={(open) => { if (!open) setTakeQuizId(null); }}
        onSubmitted={fetchUserSubmissions}
      />

      {/* Teacher view results */}
      <Dialog open={viewResultsOpen} onOpenChange={setViewResultsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Results: {selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingSubmissions ? (
              <p className="text-center text-muted-foreground">Loading results...</p>
            ) : submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
            ) : (
              <div className="grid gap-4">
                {submissions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">{s.profiles?.display_name || "Unknown Student"}</p>
                          <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                            Score: {s.total_score ?? "Pending"} / {selectedQuiz?.max_score}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(s.submitted_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 border-t pt-2">
                        {s.quiz_answers?.map((ans: any, i: number) => (
                          <div key={ans.id} className="text-sm bg-muted/30 p-2 rounded flex justify-between">
                            <span>{ans.answer_text || <span className="italic text-muted-foreground">No answer</span>}</span>
                            {ans.is_correct !== null && (
                              <span className={ans.is_correct ? "text-green-500" : "text-destructive"}>
                                {ans.is_correct ? "✓" : "✗"} {ans.score ?? 0}pts
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
