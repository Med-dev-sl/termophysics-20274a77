import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Plus, Eye, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner, ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";
import { format } from "date-fns";
import { QuizQuestionManager } from "./QuizQuestionManager";
import { QuizTaker } from "./QuizTaker";
import { QuizGrader } from "./QuizGrader";

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
  const { showSuccess, showError, FeedbackModalComponent } = useFeedbackModal();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // New quiz state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [creating, setCreating] = useState(false);

  // Question manager state
  const [manageQuizId, setManageQuizId] = useState<string | null>(null);
  const [manageQuizTitle, setManageQuizTitle] = useState("");

  // Submissions state
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingStudentName, setGradingStudentName] = useState("");

  // Student quiz taking state
  const [takeQuizId, setTakeQuizId] = useState<string | null>(null);
  const [takeQuizTitle, setTakeQuizTitle] = useState("");
  const [userSubmissions, setUserSubmissions] = useState<Record<string, { score: number | null; graded: boolean }>>({});

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
      .select("quiz_id, total_score, graded_at")
      .eq("student_id", user.id);

    if (data) {
      const submissionsMap: Record<string, { score: number | null; graded: boolean }> = {};
      data.forEach(s => {
        submissionsMap[s.quiz_id] = {
          score: s.total_score,
          graded: !!s.graded_at
        };
      });
      setUserSubmissions(submissionsMap);
    }
  };

  const handleCreateQuiz = async () => {
    if (!user || !title.trim()) return;
    setCreating(true);
    const { error } = await supabase.from("quizzes").insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
      max_score: 100 // Default, updated as questions are added
    });
    setCreating(false);
    if (error) {
      showError("Error", error.message);
    } else {
      showSuccess("Quiz Created!", "Now add your questions.");
      setCreateDialogOpen(false);
      setTitle(""); setDescription(""); setDueDate(""); setTimeLimit("");
      fetchQuizzes();
    }
  };

  const fetchSubmissions = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setSubmissionsOpen(true);
    setLoadingSubmissions(true);

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

  if (loading) return <LoadingSpinner size="md" text="Loading quizzes..." className="py-8" />;

  return (
    <div className="space-y-4">
      {isTeacher && (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="h-4 w-4 mr-2" /> New Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter 1 Review" />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for students..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="No limit" />
                </div>
              </div>
              <Button onClick={handleCreateQuiz} disabled={creating || !title.trim()} className="w-full" variant="hero">
                {creating ? <><ButtonSpinner /> Creating...</> : "Create Quiz"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {quizzes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No quizzes yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => {
            const submission = userSubmissions[q.id];
            return (
              <Card key={q.id} className="hover:border-termo-sky-blue/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-termo-deep-blue">
                      <Brain className="h-4 w-4 text-termo-sky-blue" />
                      {q.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isTeacher ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => fetchSubmissions(q)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Results
                          </Button>
                          <Button variant="hero" size="sm" onClick={() => { setManageQuizId(q.id); setManageQuizTitle(q.title); }}>
                            Questions
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          {submission && (
                            <div className="text-right">
                              <p className="text-xs font-bold text-termo-deep-blue">
                                Score: {submission.score !== null ? `${submission.score}` : "..."}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase">
                                {submission.graded ? "Graded" : "Pending"}
                              </p>
                            </div>
                          )}
                          <Button
                            variant={submission ? "outline" : "hero"}
                            size="sm"
                            disabled={!!submission}
                            onClick={() => { setTakeQuizId(q.id); setTakeQuizTitle(q.title); }}
                          >
                            {submission ? "Submitted" : "Take Quiz"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {q.due_date && (
                    <CardDescription>
                      Due: {format(new Date(q.due_date), "MMM d, yyyy h:mm a")}
                    </CardDescription>
                  )}
                </CardHeader>
                {q.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{q.description}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Teacher: Manage Submissions */}
      <Dialog open={submissionsOpen} onOpenChange={setSubmissionsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-termo-sky-blue" />
              Submissions: {selectedQuiz?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingSubmissions ? (
              <LoadingSpinner size="md" text="Loading submissions..." className="py-8" />
            ) : submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No students have submitted this quiz yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((s) => (
                  <Card key={s.id} className="bg-muted/10 border-termo-sky-blue/10">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-termo-deep-blue">
                            {s.profiles?.display_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${s.graded_at ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {s.graded_at ? 'Graded' : 'Needs Review'}
                            </span>
                            <p className="text-lg font-bold text-termo-deep-blue">
                              {s.total_score !== null ? `${s.total_score}` : "???"}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Submitted: {format(new Date(s.submitted_at), "MMM d, h:mm a")}
                          </p>
                          {s.is_late && <span className="text-[10px] text-destructive font-bold uppercase">Late</span>}
                        </div>
                      </div>

                      {/* Teacher Grading Button */}
                      {!s.graded_at && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full mt-2 text-xs"
                          onClick={() => {
                            setGradingSubmissionId(s.id);
                            setGradingStudentName(s.profiles?.display_name || "Unknown Student");
                          }}
                        >
                          Review & Grade Answers
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <QuizGrader
        submissionId={gradingSubmissionId || ""}
        studentName={gradingStudentName}
        open={!!gradingSubmissionId}
        onOpenChange={(open) => { if (!open) setGradingSubmissionId(null); }}
        onGraded={() => {
          if (selectedQuiz) fetchSubmissions(selectedQuiz);
        }}
      />

      <QuizQuestionManager
        quizId={manageQuizId || ""}
        quizTitle={manageQuizTitle}
        open={!!manageQuizId}
        onOpenChange={(open) => { if (!open) setManageQuizId(null); }}
      />

      <QuizTaker
        quizId={takeQuizId || ""}
        quizTitle={takeQuizTitle}
        open={!!takeQuizId}
        onOpenChange={(open) => { if (!open) setTakeQuizId(null); }}
        onSubmitted={fetchUserSubmissions}
      />
      <FeedbackModalComponent />
    </div>
  );
}
