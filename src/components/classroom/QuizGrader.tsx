import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Answer {
    id: string;
    answer_text: string | null;
    score: number | null;
    is_correct: boolean | null;
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
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [scores, setScores] = useState<Record<string, string>>({});
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
            answersData.forEach(a => {
                initialScores[a.id] = a.score !== null ? a.score.toString() : "";
            });
            setScores(initialScores);
        }
        setLoading(false);
    };

    const handleScoreChange = (answerId: string, val: string) => {
        setScores(prev => ({ ...prev, [answerId]: val }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // 1. Update individual answer scores
            for (const answer of answers) {
                const scoreVal = parseInt(scores[answer.id]);
                if (!isNaN(scoreVal)) {
                    const isCorrect = scoreVal >= (answer.quiz_questions.points / 2); // Simple heuristic
                    await supabase
                        .from("quiz_answers")
                        .update({
                            score: scoreVal,
                            is_correct: isCorrect
                        })
                        .eq("id", answer.id);
                }
            }

            // 2. Recalculate total score for submission
            const { data: updatedAnswers } = await supabase
                .from("quiz_answers")
                .select("score")
                .eq("submission_id", submissionId);

            const totalScore = (updatedAnswers || []).reduce((sum, a) => sum + (a.score || 0), 0);

            // 3. Update submission record
            await supabase
                .from("quiz_submissions")
                .update({
                    total_score: totalScore,
                    graded_at: new Date().toISOString()
                })
                .eq("id", submissionId);

            toast({ title: "Grading complete!", description: `Updated score: ${totalScore}` });
            onGraded();
            onOpenChange(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-termo-sky-blue/30">
                <DialogHeader>
                    <DialogTitle className="text-termo-deep-blue">
                        Grading: {studentName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-termo-sky-blue" />
                        </div>
                    ) : (
                        <>
                            {answers.map((a, idx) => (
                                <div key={a.id} className="p-4 border rounded-lg bg-background shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-bold text-termo-deep-blue">Question {idx + 1}</p>
                                            <p className="text-sm">{a.quiz_questions.question_text}</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded inline-block">
                                                {a.quiz_questions.question_type}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-muted-foreground mr-1">Points: {a.quiz_questions.points}</p>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md text-sm">
                                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Student's Answer:</p>
                                        <p className="whitespace-pre-wrap">{a.answer_text || <span className="italic text-muted-foreground">No answer provided</span>}</p>
                                    </div>

                                    {a.quiz_questions.correct_answer && (
                                        <div className="bg-green-50 border border-green-100 p-3 rounded-md text-sm">
                                            <p className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wider">Reference Answer:</p>
                                            <p className="text-green-800">{a.quiz_questions.correct_answer}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex-1 max-w-[150px]">
                                            <Label className="text-xs">Award Score</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    max={a.quiz_questions.points}
                                                    min={0}
                                                    value={scores[a.id]}
                                                    onChange={(e) => handleScoreChange(a.id, e.target.value)}
                                                    className="h-9"
                                                />
                                                <span className="text-sm text-muted-foreground">/ {a.quiz_questions.points}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-5">
                                            {a.score !== null && (
                                                <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                                                    <CheckCircle2 className="h-3 w-3" /> Auto-Graded
                                                </span>
                                            )}
                                            {a.score === null && (
                                                <span className="flex items-center gap-1 text-[10px] text-orange-600 font-bold uppercase">
                                                    <AlertCircle className="h-3 w-3" /> Needs Review
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="sticky bottom-0 pt-4 bg-background border-t">
                                <Button onClick={handleSubmit} disabled={submitting} className="w-full" variant="hero">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save All Grades"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
