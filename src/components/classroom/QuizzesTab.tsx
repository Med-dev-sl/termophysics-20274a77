import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Brain, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

  // Teacher view submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [viewSubmissionsOpen, setViewSubmissionsOpen] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, [classroomId]);

  const fetchQuizzes = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });
    setQuizzes(data || []);
    setLoading(false);
  };

  const fetchSubmissions = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setLoadingSubmissions(true);
    setViewSubmissionsOpen(true);

    const { data, error } = await supabase
      .from("quiz_submissions")
      .select(`
        *,
        profiles:student_id (
          display_name,
          email
        )
      `)
      .eq("quiz_id", quiz.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setSubmissions(data || []);
    }
    setLoadingSubmissions(false);
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
                  {isTeacher && (
                    <Button variant="outline" size="sm" onClick={() => fetchSubmissions(q)}>
                      View Results
                    </Button>
                  )}
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

      {/* Teacher view submissions dialog */}
      <Dialog open={viewSubmissionsOpen} onOpenChange={setViewSubmissionsOpen}>
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
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-termo-deep-blue">
                            {s.profiles?.display_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-termo-light-orange/10 text-termo-light-orange px-3 py-1 rounded-full text-sm font-bold">
                            Score: {s.total_score ?? "N/A"} / {selectedQuiz?.max_score}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(s.submitted_at), "MMM d, h:mm a")}
                          </p>
                        </div>
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
