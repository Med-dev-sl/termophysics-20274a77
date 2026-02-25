import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ClipboardList, Calendar, Download } from "lucide-react";
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
      setSubmissions(data || []);
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
                  </CardTitle>
                  {isTeacher ? (
                    <Button variant="outline" size="sm" onClick={() => fetchSubmissions(a)}>
                      View Submissions
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

      {/* Teacher view submissions dialog */}
      <Dialog open={viewSubmissionsOpen} onOpenChange={setViewSubmissionsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions: {selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingSubmissions ? (
              <p className="text-center text-muted-foreground">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
            ) : (
              <div className="grid gap-4">
                {submissions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-termo-deep-blue">
                            {s.profiles?.display_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Submitted: {format(new Date(s.submitted_at), "MMM d, h:mm a")}
                          </p>
                          {s.is_late && <span className="text-[10px] text-destructive font-bold uppercase">Late</span>}
                        </div>
                      </div>

                      {s.content && (
                        <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                          {s.content}
                        </div>
                      )}

                      {s.file_url && (
                        <Button variant="secondary" size="sm" asChild className="w-full flex items-center gap-2">
                          <a href={s.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            Download {s.file_name || "File"}
                          </a>
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
    </div>
  );
}
