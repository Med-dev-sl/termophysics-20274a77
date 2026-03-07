import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { LoadingSpinner, ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";

interface Answer {
    id: string;
    answer_text: string | null;
    score: number | null;
    is_correct: boolean | null;
    feedback: string | null;
    question_id: string;
    quiz_questions: {
        question_text: string;
        question_type: string;
        points: number;
        correct_answer: string | null;
    };
}

interface QuizGraderProps {
    submissionId: string;
    studentName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGraded: () => void;
}

export function QuizGrader({ submissionId, studentName, open, onOpenChange, onGraded }: QuizGraderProps) {
    const { toast } = useToast();
    const { showSuccess, showError, FeedbackModalComponent } = useFeedbackModal();
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [scores, setScores] = useState<Record<string, string>>({});
    const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && submissionId) {
            fetchAnswers();
        }
    }, [open, submissionId]);

    const fetchAnswers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("quiz_answers")
            .select(`
        id,
        answer_text,
        score,
        is_correct,
        feedback,
        question_id,
        quiz_questions (
          question_text,
          question_type,
          points,
          correct_answer
        )
      `)
            .eq("submission_id", submissionId);

        if (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } else {
            const answersData = (data as any[]) || [];
            setAnswers(answersData);

            const initialScores: Record<string, string> = {};
            const initialFeedbacks: Record<string, string> = {};
            answersData.forEach(a => {
                initialScores[a.id] = a.score !== null ? a.score.toString() : "";
                initialFeedbacks[a.id] = a.feedback || "";
            });
            setScores(initialScores);
            setFeedbacks(initialFeedbacks);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            for (const answer of answers) {
                const scoreVal = parseInt(scores[answer.id]);
                const feedbackVal = feedbacks[answer.id]?.trim() || null;
                if (!isNaN(scoreVal) || feedbackVal) {
                    await supabase
                        .from("quiz_answers")
                        .update({
                            score: isNaN(scoreVal) ? null : scoreVal,
                            is_correct: !isNaN(scoreVal) ? scoreVal >= (answer.quiz_questions.points / 2) : null,
                            feedback: feedbackVal,
                        })
                        .eq("id", answer.id);
                }
            }

            const { data: updatedAnswers } = await supabase
                .from("quiz_answers")
                .select("score")
                .eq("submission_id", submissionId);

            const totalScore = (updatedAnswers || []).reduce((sum, a) => sum + (a.score || 0), 0);

            await supabase
                .from("quiz_submissions")
                .update({
                    total_score: totalScore,
                    graded_at: new Date().toISOString()
                })
                .eq("id", submissionId);

            toast({ title: "Grading complete!", description: `Total score: ${totalScore}` });
            onGraded();
            onOpenChange(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const totalAwarded = answers.reduce((sum, a) => {
        const s = parseInt(scores[a.id]);
        return sum + (isNaN(s) ? 0 : s);
    }, 0);
    const totalPossible = answers.reduce((sum, a) => sum + a.quiz_questions.points, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        Grading: {studentName}
                        {!loading && (
                            <Badge variant="outline" className="text-sm font-mono">
                                {totalAwarded} / {totalPossible}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            {answers.map((a, idx) => (
                                <div key={a.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">Question {idx + 1}</p>
                                            <p className="text-sm">{a.quiz_questions.question_text}</p>
                                            <Badge variant="secondary" className="text-[10px]">
                                                {a.quiz_questions.question_type}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            {a.quiz_questions.points} pts
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                                        <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Student's Answer</p>
                                        <p className="whitespace-pre-wrap">{a.answer_text || <span className="italic text-muted-foreground">No answer provided</span>}</p>
                                    </div>

                                    {a.quiz_questions.correct_answer && (
                                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 rounded-md text-sm">
                                            <p className="text-[10px] font-bold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wider">Correct Answer</p>
                                            <p className="text-green-800 dark:text-green-300">{a.quiz_questions.correct_answer}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-[1fr_auto] gap-4 items-end pt-2 border-t">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider">Feedback</Label>
                                            <Textarea
                                                value={feedbacks[a.id] || ""}
                                                onChange={(e) => setFeedbacks(prev => ({ ...prev, [a.id]: e.target.value }))}
                                                placeholder="Optional feedback for this answer..."
                                                rows={2}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider">Score</Label>
                                            <div className="flex items-center gap-1.5">
                                                <Input
                                                    type="number"
                                                    max={a.quiz_questions.points}
                                                    min={0}
                                                    value={scores[a.id]}
                                                    onChange={(e) => setScores(prev => ({ ...prev, [a.id]: e.target.value }))}
                                                    className="h-9 w-20"
                                                />
                                                <span className="text-sm text-muted-foreground">/ {a.quiz_questions.points}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        {a.score !== null ? (
                                            <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                                                <CheckCircle2 className="h-3 w-3" /> Auto-Graded
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] text-orange-600 font-bold uppercase">
                                                <AlertCircle className="h-3 w-3" /> Needs Review
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="sticky bottom-0 pt-4 bg-background border-t">
                                <Button onClick={handleSubmit} disabled={submitting} className="w-full" variant="hero">
                                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : `Save All Grades (${totalAwarded}/${totalPossible})`}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
