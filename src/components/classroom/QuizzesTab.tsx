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

<<<<<<< HEAD
  // Teacher manage questions state
  const [questions, setQuestions] = useState<any[]>([]);
  const [manageQuestionsOpen, setManageQuestionsOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<"mcq" | "short_answer" | "file_upload">("short_answer");
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [newPoints, setNewPoints] = useState("10");


=======
  // Question manager
  const [manageQuizId, setManageQuizId] = useState<string | null>(null);
  const [manageQuizTitle, setManageQuizTitle] = useState("");
>>>>>>> e5dc59821c3b2d78c5ec6f26081b104dd638d0b2

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

<<<<<<< HEAD
  const handleAddQuestion = async () => {
    if (!selectedQuiz || !newQuestionText.trim()) return;
    const { error } = await supabase.from("quiz_questions").insert({
      quiz_id: selectedQuiz.id,
      question_text: newQuestionText.trim(),
      question_type: newQuestionType,
      correct_answer: newCorrectAnswer.trim() || null,
      options: newQuestionType === "mcq" ? newOptions.filter(opt => opt.trim() !== "") : null,
      points: parseInt(newPoints) || 10,
      sort_order: questions.length,
    });
=======
  const fetchSubmissions = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setLoadingSubmissions(true);
    setViewResultsOpen(true);

    const { data, error } = await supabase
      .from("quiz_submissions")
      .select(`*, profiles:student_id (display_name, email), quiz_answers (id, answer_text, question_id, is_correct, score)`)
      .eq("quiz_id", quiz.id);
>>>>>>> e5dc59821c3b2d78c5ec6f26081b104dd638d0b2



    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
<<<<<<< HEAD
      toast({ title: "Question added!" });
      setNewQuestionText("");
      setNewCorrectAnswer("");
      setNewOptions(["", "", "", ""]);
      fetchQuestions(selectedQuiz.id);

    }
  };

  const handleSubmitQuiz = async () => {
    if (!user || !selectedQuiz || questions.length === 0) return;
    setSubmitting(true);

    try {
      let totalScore = 0;
      const answersToInsert = questions.map((q) => {
        const studentAnswer = studentAnswers[q.id] || "";
        const isCorrect = q.correct_answer && studentAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
        const score = isCorrect ? (q.points || 10) : 0;
        if (isCorrect) totalScore += score;

        return {
          question_id: q.id,
          answer_text: studentAnswer,
          is_correct: isCorrect,
          score: score,
        };
      });

      // 1. Create submission
      const { data: submission, error: subError } = await supabase
        .from("quiz_submissions")
        .insert({
          quiz_id: selectedQuiz.id,
          student_id: user.id,
          total_score: totalScore,
          graded_at: new Date().toISOString(), // Auto-graded
        })
        .select()
        .single();

      if (subError) throw subError;

      // 2. Insert answers
      const finalAnswers = answersToInsert.map(ans => ({
        ...ans,
        submission_id: submission.id,
      }));

      const { error: ansError } = await supabase.from("quiz_answers").insert(finalAnswers);
      if (ansError) throw ansError;

      toast({ title: "Quiz submitted and auto-graded!", description: `Your score: ${totalScore}` });
      setTakeQuizOpen(false);
      setStudentAnswers({});
      fetchUserSubmissions();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission failed", description: error.message });
    } finally {
      setSubmitting(false);
=======
      setSubmissions(data || []);
>>>>>>> e5dc59821c3b2d78c5ec6f26081b104dd638d0b2
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
<<<<<<< HEAD

                      {/* Display individual answers */}
                      <div className="space-y-2 border-t pt-4 mt-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Answers:</p>
                        {s.quiz_answers?.map((ans: any, i: number) => {
                          const question = questions.find(q => q.id === ans.question_id);
                          return (
                            <div key={ans.id} className={`text-sm p-2 rounded ${ans.is_correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                              <div className="flex justify-between items-start">
                                <p className="font-medium text-xs">Q: {question?.question_text || "Deleted Question"}</p>
                                <span className={`text-[10px] font-bold ${ans.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                  {ans.is_correct ? 'Correct' : 'Incorrect'} ({ans.score || 0} pts)
                                </span>
                              </div>
                              <p className="mt-1">A: {ans.answer_text || <span className="italic text-muted-foreground">No answer</span>}</p>
                              {!ans.is_correct && question?.correct_answer && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Correct answer: <span className="font-medium text-foreground">{question.correct_answer}</span>
                                </p>
                              )}
                            </div>

                          );
                        })}
=======
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
>>>>>>> e5dc59821c3b2d78c5ec6f26081b104dd638d0b2
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
<<<<<<< HEAD

      {/* Teacher manage questions dialog */}
      <Dialog open={manageQuestionsOpen} onOpenChange={setManageQuestionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Manage Questions: {selectedQuiz?.title}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4 border p-4 rounded-lg bg-muted/50">
              <h4 className="font-bold">Add New Question</h4>
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Input value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} placeholder="What is the laws of thermodynamics?" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="w-full p-2 rounded-md border bg-background"
                  value={newQuestionType}
                  onChange={(e: any) => setNewQuestionType(e.target.value)}
                >
                  <option value="short_answer">Short Answer</option>
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="file_upload">File Upload</option>
                </select>
              </div>

              {newQuestionType === "mcq" && (
                <div className="space-y-2">
                  <Label>Options (MCQ Only)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {newOptions.map((opt, i) => (
                      <Input
                        key={i}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i] = e.target.value;
                          setNewOptions(updated);
                        }}
                        placeholder={`Option ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(newQuestionType === "mcq" || newQuestionType === "short_answer") && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Input
                    value={newCorrectAnswer}
                    onChange={(e) => setNewCorrectAnswer(e.target.value)}
                    placeholder={newQuestionType === "mcq" ? "Must match one of the options" : "Correct answer for grading"}
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    Note: For MCQ, ensure the answer exactly matches one of the options.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} />
              </div>

              <Button onClick={handleAddQuestion} className="w-full" variant="hero" disabled={!newQuestionText.trim()}>
                Add Question
              </Button>

            </div>

            <div className="space-y-3">
              <h4 className="font-bold">Current Questions ({questions.length})</h4>
              {questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No questions added yet.</p>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="p-3 border rounded-md bg-background flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground mr-2">#{idx + 1}</span>
                      <span className="text-sm">{q.question_text}</span>
                      <span className="ml-2 text-[10px] uppercase bg-muted px-1 rounded">{q.question_type}</span>
                      {q.correct_answer && (
                        <p className="text-[10px] text-termo-light-orange font-bold mt-1">
                          Correct: {q.correct_answer}
                        </p>
                      )}
                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.options.map((opt: string, i: number) => (
                            <span key={i} className="text-[9px] bg-muted/50 px-1 rounded">{opt}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                        Points: {q.points || 10}
                      </p>
                    </div>


                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student take quiz dialog */}
      <Dialog open={takeQuizOpen} onOpenChange={setTakeQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Taking Quiz: {selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {questions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">This quiz has no questions yet.</p>
            ) : (
              <>
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 p-4 border rounded-lg">
                    <p className="font-bold">Q{idx + 1}: {q.question_text}</p>
                    {q.question_type === "mcq" && q.options ? (
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            onClick={() => setStudentAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`p-3 rounded-md border cursor-pointer transition-colors ${studentAnswers[q.id] === opt
                              ? "bg-termo-light-orange/10 border-termo-light-orange text-termo-light-orange font-medium"
                              : "hover:bg-muted"
                              }`}
                          >
                            <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        value={studentAnswers[q.id] || ""}
                        onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Type your answer here..."
                      />
                    )}

                  </div>
                ))}
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="w-full"
                  variant="hero"
                >
                  {submitting ? "Submitting..." : "Submit All Answers"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
=======
>>>>>>> e5dc59821c3b2d78c5ec6f26081b104dd638d0b2
    </div>
  );
}
