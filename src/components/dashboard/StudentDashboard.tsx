import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface EnrolledClassroom {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<EnrolledClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchEnrolledClassrooms();
  }, [user]);

  const fetchEnrolledClassrooms = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("classroom_enrollments")
      .select("classroom_id, classrooms(id, name, description, subject)")
      .eq("student_id", user.id);

    const enrolled = (data || [])
      .map((e: any) => e.classrooms)
      .filter(Boolean);
    setClassrooms(enrolled);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user || !classCode.trim()) return;
    setJoining(true);

    // Find classroom by code
    const { data: classroom, error: findError } = await supabase
      .from("classrooms")
      .select("id")
      .eq("class_code", classCode.trim())
      .single();

    if (findError || !classroom) {
      toast({ variant: "destructive", title: "Invalid code", description: "No classroom found with that code." });
      setJoining(false);
      return;
    }

    const { error } = await supabase.from("classroom_enrollments").insert({
      classroom_id: classroom.id,
      student_id: user.id,
    });

    setJoining(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message.includes("duplicate") ? "Already enrolled!" : error.message });
    } else {
      toast({ title: "Joined classroom!" });
      setDialogOpen(false);
      setClassCode("");
      fetchEnrolledClassrooms();
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading classrooms...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">My Classes</h2>
          <p className="text-muted-foreground">View your enrolled classrooms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" /> Join Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Classroom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Class Code</Label>
                <Input
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  placeholder="Enter class code"
                />
              </div>
              <Button onClick={handleJoin} disabled={joining || !classCode.trim()} className="w-full" variant="hero">
                {joining ? "Joining..." : "Join Classroom"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classrooms.length === 0 ? (
        <Card className="termo-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No classes yet. Join one with a class code!</p>
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
              {c.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
