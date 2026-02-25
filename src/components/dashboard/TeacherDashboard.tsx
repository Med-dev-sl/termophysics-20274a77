import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen, Users, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  class_code: string;
  created_at: string;
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  const fetchClassrooms = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("classrooms")
      .select("*")
      .order("created_at", { ascending: false });
    setClassrooms(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setCreating(true);
    const { error } = await supabase.from("classrooms").insert({
      name: name.trim(),
      description: description.trim() || null,
      subject: subject.trim() || null,
      teacher_id: user.id,
    });
    setCreating(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Classroom created!" });
      setDialogOpen(false);
      setName("");
      setDescription("");
      setSubject("");
      fetchClassrooms();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Class code copied!" });
  };

  if (loading) return <p className="text-muted-foreground">Loading classrooms...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">My Classrooms</h2>
          <p className="text-muted-foreground">Manage your classes, assignments, and quizzes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" /> New Classroom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Classroom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Physics 101" />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Physics" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description..." />
              </div>
              <Button onClick={handleCreate} disabled={creating || !name.trim()} className="w-full" variant="hero">
                {creating ? "Creating..." : "Create Classroom"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classrooms.length === 0 ? (
        <Card className="termo-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No classrooms yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => (
            <Card
              key={c.id}
              className="termo-card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/classroom/${c.id}`)}
            >
              <CardHeader>
                <CardTitle className="font-display">{c.name}</CardTitle>
                {c.subject && <CardDescription>{c.subject}</CardDescription>}
              </CardHeader>
              <CardContent>
                {c.description && (
                  <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{c.class_code}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); copyCode(c.class_code); }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
