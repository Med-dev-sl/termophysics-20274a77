import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ClipboardList, Calendar, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { LoadingSpinner, ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  created_at: string;
}

interface AssignmentsTabProps {
  classroomId: string;
  isTeacher: boolean;
}

export function AssignmentsTab({ classroomId, isTeacher }: AssignmentsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showSuccess, showError, FeedbackModalComponent } = useFeedbackModal();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [creating, setCreating] = useState(false);

  // Student submission state
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submitContent, setSubmitContent] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Teacher view submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [viewSubmissionsOpen, setViewSubmissionsOpen] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grading state
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeScores, setGradeScores] = useState<Record<string, string>>({});
  const [gradeFeedback, setGradeFeedback] = useState<Record<string, string>>({});
  const [savingGrade, setSavingGrade] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });
    setAssignments(data || []);
    setLoading(false);
  };

  const fetchSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    setViewSubmissionsOpen(true);

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        *,
        profiles:student_id (
          display_name,
          email
        )
      `)
      .eq("assignment_id", assignment.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      const subs = data || [];
      setSubmissions(subs);
      const scores: Record<string, string> = {};
      const feedback: Record<string, string> = {};
      subs.forEach((s: any) => {
        scores[s.id] = s.score !== null ? s.score.toString() : "";
        feedback[s.id] = s.feedback || "";
      });
      setGradeScores(scores);
      setGradeFeedback(feedback);
    }
    setLoadingSubmissions(false);
  };

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    setCreating(true);
    const { error } = await supabase.from("assignments").insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      max_score: parseInt(maxScore) || 100,
    });
    setCreating(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Assignment created!" });
      setDialogOpen(false);
      setTitle(""); setDescription(""); setDueDate(""); setMaxScore("100");
      fetchAssignments();
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedAssignment) return;
    setSubmitting(true);

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (submitFile) {
      const filePath = `${classroomId}/assignments/${selectedAssignment.id}/${Date.now()}-${submitFile.name}`;
      const { error: uploadError } = await supabase.storage.from("classroom-files").upload(filePath, submitFile);
      if (uploadError) {
        toast({ variant: "destructive", title: "Upload error", description: uploadError.message });
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("classroom-files").getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
      fileName = submitFile.name;
    }

    const isLate = selectedAssignment.due_date ? new Date() > new Date(selectedAssignment.due_date) : false;

    const { error } = await supabase.from("assignment_submissions").insert({
      assignment_id: selectedAssignment.id,
      student_id: user.id,
      content: submitContent.trim() || null,
      file_url: fileUrl,
      file_name: fileName,
      is_late: isLate,
    });

    setSubmitting(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: isLate ? "Submitted (late)" : "Submitted!" });
      setSubmitDialogOpen(false);
      setSubmitContent(""); setSubmitFile(null); setSelectedAssignment(null);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    setSavingGrade(submissionId);
    const scoreVal = parseInt(gradeScores[submissionId]);
    const feedbackVal = gradeFeedback[submissionId]?.trim() || null;

    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        score: isNaN(scoreVal) ? null : scoreVal,
        feedback: feedbackVal,
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    setSavingGrade(null);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Grade saved!" });
      // Update local state
      setSubmissions(prev =>
        prev.map(s => s.id === submissionId
          ? { ...s, score: isNaN(scoreVal) ? null : scoreVal, feedback: feedbackVal, graded_at: new Date().toISOString() }
          : s
        )
      );
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading assignments...</p>;

  return (
    <div className="space-y-4">
      {isTeacher && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="h-4 w-4 mr-2" /> New Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Homework 1" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions..." rows={3} /></div>
              <div className="space-y-2"><Label>Due Date</Label><Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Max Score</Label><Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} /></div>
              <Button onClick={handleCreate} disabled={creating || !title.trim()} className="w-full" variant="hero">{creating ? "Creating..." : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Student submit dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit Assignment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Your Answer</Label><Textarea value={submitContent} onChange={(e) => setSubmitContent(e.target.value)} placeholder="Write your answer..." rows={4} /></div>
            <div className="space-y-2"><Label>Upload File (optional)</Label><Input type="file" onChange={(e) => setSubmitFile(e.target.files?.[0] || null)} /></div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full" variant="hero">{submitting ? "Submitting..." : "Submit"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    {a.title}
                    <Badge variant="secondary" className="text-[10px]">Max: {a.max_score}</Badge>
                  </CardTitle>
                  {isTeacher ? (
                    <Button variant="outline" size="sm" onClick={() => fetchSubmissions(a)}>
                      View & Grade
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedAssignment(a); setSubmitDialogOpen(true); }}>Submit</Button>
                  )}
                </div>
                {a.due_date && (
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {format(new Date(a.due_date), "MMM d, yyyy h:mm a")}
                  </CardDescription>
                )}
              </CardHeader>
              {a.description && (
                <CardContent><p className="text-sm text-muted-foreground">{a.description}</p></CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Teacher grading dialog */}
      <Dialog open={viewSubmissionsOpen} onOpenChange={setViewSubmissionsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Grade Submissions: {selectedAssignment?.title}
              <Badge variant="outline" className="ml-2">Max: {selectedAssignment?.max_score}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingSubmissions ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
            ) : (
              <div className="space-y-6">
                {submissions.map((s) => (
                  <Card key={s.id} className={s.graded_at ? "border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20" : ""}>
                    <CardContent className="pt-6 space-y-4">
                      {/* Student info header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">
                            {s.profiles?.display_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            {s.graded_at ? (
                              <Badge variant="default" className="bg-green-600 text-[10px] gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Graded
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <AlertCircle className="h-3 w-3" /> Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(s.submitted_at), "MMM d, h:mm a")}
                          </p>
                          {s.is_late && <Badge variant="destructive" className="text-[10px]">Late</Badge>}
                        </div>
                      </div>

                      {/* Student's answer */}
                      {s.content && (
                        <div className="bg-muted/50 p-3 rounded-lg text-sm">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Student's Answer</p>
                          <p className="whitespace-pre-wrap">{s.content}</p>
                        </div>
                      )}

                      {s.file_url && (
                        <Button variant="secondary" size="sm" asChild className="w-full flex items-center gap-2">
                          <a href={s.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            Download: {s.file_name || "File"}
                          </a>
                        </Button>
                      )}

                      {/* Grading controls */}
                      <div className="border-t pt-4 space-y-3">
                        <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider">Feedback</Label>
                            <Textarea
                              value={gradeFeedback[s.id] || ""}
                              onChange={(e) => setGradeFeedback(prev => ({ ...prev, [s.id]: e.target.value }))}
                              placeholder="Write feedback for the student..."
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider">Score</Label>
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                min={0}
                                max={selectedAssignment?.max_score || 100}
                                value={gradeScores[s.id] || ""}
                                onChange={(e) => setGradeScores(prev => ({ ...prev, [s.id]: e.target.value }))}
                                className="h-9 w-20"
                              />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">/ {selectedAssignment?.max_score}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSaveGrade(s.id)}
                          disabled={savingGrade === s.id}
                          variant="hero"
                          size="sm"
                          className="w-full"
                        >
                          {savingGrade === s.id ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                          ) : s.graded_at ? "Update Grade" : "Save Grade"}
                        </Button>
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
