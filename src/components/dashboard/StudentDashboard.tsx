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
import { LoadingSpinner, ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { TiltCard } from "@/components/ui/motion-primitives";

interface EnrolledClassroom {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showSuccess, showError, FeedbackModalComponent } = useFeedbackModal();
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

    const enrolled = (data || []).map((e: any) => e.classrooms).filter(Boolean);
    setClassrooms(enrolled);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user || !classCode.trim()) return;
    setJoining(true);

    const { data: classroom, error: findError } = await supabase
      .from("classrooms")
      .select("id")
      .eq("class_code", classCode.trim())
      .maybeSingle();

    if (findError) {
      showError("Search Failed", findError.message);
      setJoining(false);
      return;
    }

    if (!classroom) {
      showError("Invalid Code", "No classroom found with that code. Please check and try again.");
      setJoining(false);
      return;
    }

    const { error } = await supabase.from("classroom_enrollments").insert({
      classroom_id: classroom.id,
      student_id: user.id,
    });

    setJoining(false);
    if (error) {
      showError("Error", error.message.includes("duplicate") ? "Already enrolled!" : error.message);
    } else {
      showSuccess("Joined Classroom!", "You're now enrolled in this class.");
      setDialogOpen(false);
      setClassCode("");
      fetchEnrolledClassrooms();
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading classrooms..." className="py-12" />;

  return (
    <div className="space-y-6" data-tour="dashboard-content">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-display font-bold">My Classes</h2>
          <p className="text-muted-foreground">View your enrolled classrooms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="hero" data-tour="join-class">
                <Plus className="h-4 w-4 mr-2" /> Join Class
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Classroom</DialogTitle>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Class Code</Label>
                <Input value={classCode} onChange={(e) => setClassCode(e.target.value)} placeholder="Enter class code" />
              </div>
              <Button onClick={handleJoin} disabled={joining || !classCode.trim()} className="w-full" variant="hero">
                {joining ? <><ButtonSpinner /> Joining...</> : "Join Classroom"}
              </Button>
            </motion.div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {classrooms.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Card className="termo-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              </motion.div>
              <p className="text-muted-foreground text-center">No classes yet. Join one with a class code!</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {classrooms.map((c) => (
            <motion.div key={c.id} variants={staggerItem}>
              <TiltCard className="rounded-xl overflow-hidden cursor-pointer" onClick={() => navigate(`/classroom/${c.id}`)}>
                <Card className="glass-card hover:shadow-lg transition-all border-none overflow-hidden h-full">
                  <div className="h-2 w-full bg-gradient-to-r from-termo-deep-blue to-termo-light-orange" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-xl">{c.name}</CardTitle>
                    {c.subject && <CardDescription className="font-medium text-termo-light-orange/80">{c.subject}</CardDescription>}
                  </CardHeader>
                  {c.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                    </CardContent>
                  )}
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      )}
      <FeedbackModalComponent />
    </div>
  );
}
