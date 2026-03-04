import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

  // Question manager
  const [manageQuizId, setManageQuizId] = useState<string | null>(null);
  const [manageQuizTitle, setManageQuizTitle] = useState("");

  // Student quiz taking
  const [takeQuizId, setTakeQuizId] = useState<string | null>(null);
  const [takeQuizTitle, setTakeQuizTitle] = useState("");
  const [userSubmissions, setUserSubmissions] = useState<Set<string>>(new Set());

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

  if (loading) return <p className="text-muted-foreground">Loading quizzes...</p>;

  return (
    <div className="space-y-4">
      {isTeacher && (
        <Button variant="hero" size="sm" onClick={() => toast({ title: "Coming soon" })}>
          <Plus className="h-4 w-4 mr-2" /> New Quiz
        </Button>
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
                      <Button variant="ghost" size="sm" onClick={() => { setManageQuizId(q.id); setManageQuizTitle(q.title); }}>
                        Questions
                      </Button>
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
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

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
    </div>
  );
}
