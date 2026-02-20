import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

interface NotesTabProps {
  classroomId: string;
  isTeacher: boolean;
}

export function NotesTab({ classroomId, isTeacher }: NotesTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [classroomId]);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("classroom_notes")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });
    setNotes(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    setCreating(true);

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (file) {
      const filePath = `${classroomId}/notes/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("classroom-files")
        .upload(filePath, file);
      if (uploadError) {
        toast({ variant: "destructive", title: "Upload error", description: uploadError.message });
        setCreating(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("classroom-files").getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
      fileName = file.name;
    }

    const { error } = await supabase.from("classroom_notes").insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: title.trim(),
      content: content.trim() || null,
      file_url: fileUrl,
      file_name: fileName,
    });

    setCreating(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Note added!" });
      setDialogOpen(false);
      setTitle("");
      setContent("");
      setFile(null);
      fetchNotes();
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading notes...</p>;

  return (
    <div className="space-y-4">
      {isTeacher && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lecture 1: Kinematics" />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Note content..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Attachment (optional)</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <Button onClick={handleCreate} disabled={creating || !title.trim()} className="w-full" variant="hero">
                {creating ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {note.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {note.content && <p className="text-sm text-muted-foreground mb-2">{note.content}</p>}
                {note.file_url && (
                  <a href={note.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-termo-light-orange hover:underline inline-flex items-center gap-1">
                    <Download className="h-3 w-3" /> {note.file_name || "Download"}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
