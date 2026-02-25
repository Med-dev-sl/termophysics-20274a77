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

  const [newClassCode, setNewClassCode] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClassrooms();
    }
  }, [user]);

  const fetchClassrooms = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching classrooms:", error);
    } else {
      setClassrooms(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setCreating(true);

    const { data, error } = await supabase.from("classrooms").insert({
      name: name.trim(),
      description: description.trim() || null,
      subject: subject.trim() || null,
      teacher_id: user.id,
    }).select().single();

    setCreating(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Classroom created successfully!" });
      setDialogOpen(false);
      setName("");
      setDescription("");
      setSubject("");
      if (data) {
        setNewClassCode(data.class_code);
        setShowShareModal(true);
      }
      fetchClassrooms();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Class code copied!",
      description: "Share this code with your students so they can join."
    });
  };

  if (loading && classrooms.length === 0) return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Loading classrooms...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">My Classrooms</h2>
          <p className="text-muted-foreground">Manage your classes and share codes with students</p>
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
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description for your students..." />
              </div>
              <Button onClick={handleCreate} disabled={creating || !name.trim()} className="w-full" variant="hero">
                {creating ? "Creating..." : "Create Classroom"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success/Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Classroom Ready!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Share this code with your students to let them join your classroom:
            </p>
            <div className="flex items-center gap-3 bg-muted p-4 rounded-xl border-2 border-dashed border-termo-light-orange/30 w-full justify-center">
              <span className="text-3xl font-mono font-bold tracking-widest text-termo-light-orange">
                {newClassCode}
              </span>
              <Button variant="ghost" size="icon" onClick={() => copyCode(newClassCode || "")}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <Button onClick={() => setShowShareModal(false)} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {classrooms.length === 0 ? (
        <Card className="termo-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No classrooms yet. Create your first one to start teaching!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => (
            <Card
              key={c.id}
              className="glass-card overflow-hidden hover:shadow-lg transition-all group active-scale border-none"
            >
              <div className="h-2 bg-gradient-to-r from-termo-deep-blue to-termo-light-orange" />
              <CardHeader className="cursor-pointer pb-2" onClick={() => navigate(`/classroom/${c.id}`)}>
                <CardTitle className="font-display group-hover:text-termo-light-orange transition-colors text-xl">{c.name}</CardTitle>
                {c.subject && <CardDescription className="font-medium text-termo-light-orange/80">{c.subject}</CardDescription>}
              </CardHeader>

              <CardContent>
                {c.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
                )}
                <div className="pt-4 border-t border-border mt-auto">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
                    Student Join Code
                  </Label>
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border border-border">
                    <span className="font-mono font-bold text-termo-deep-blue dark:text-termo-light-orange">
                      {c.class_code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(c.class_code);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Users className="h-3 w-3" />
                      <span>Classroom Dashboard</span>
                    </div>
                    <Button
                      variant="link"
                      className="text-xs h-auto p-0"
                      onClick={() => navigate(`/classroom/${c.id}`)}
                    >
                      Go to Classroom →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
