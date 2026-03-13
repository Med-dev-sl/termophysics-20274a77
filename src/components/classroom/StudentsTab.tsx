import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Users, UserPlus, Loader2, Rocket, Share2, MessageSquare, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface Enrollment {
  id: string;
  student_id: string;
  enrolled_at: string;
  profiles: { display_name: string | null; email: string | null } | null;
}

interface StudentsTabProps {
  classroomId: string;
  classCode?: string;
  isTeacher?: boolean;
}

export function StudentsTab({ classroomId, classCode: initialClassCode, isTeacher }: StudentsTabProps) {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [classCode, setClassCode] = useState(initialClassCode || "");

  useEffect(() => {
    fetchStudents();
    if (!classCode) {
      fetchClassCode();
    }
  }, [classroomId]);

  const fetchClassCode = async () => {
    const { data } = await supabase
      .from("classrooms")
      .select("class_code")
      .eq("id", classroomId)
      .maybeSingle();
    if (data) setClassCode(data.class_code);
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("classroom_enrollments")
        .select(`
          id, 
          student_id, 
          enrolled_at, 
          profiles:student_id (
            display_name, 
            email
          )
        `)
        .eq("classroom_id", classroomId);

      if (error) throw error;
      setEnrollments((data as any) || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast({ variant: "destructive", title: "Could not load students", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowUpgradeModal(true);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(classCode);
    toast({ title: "Code Copied", description: "Class code copied to clipboard!" });
  };

  const shareWhatsApp = () => {
    const text = `Join my physics classroom on TermoPhysics! %0AClass Code: ${classCode}`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    const subject = "Invitation to Join My Physics Classroom";
    const body = `Hello! %0A%0AYou've been invited to join my physics classroom on TermoPhysics. %0A%0AClass Code: ${classCode}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleRemove = async (enrollmentId: string) => {
    const { error } = await supabase.from("classroom_enrollments").delete().eq("id", enrollmentId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Student removed" });
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading students...</p>;

  return (
    <div className="space-y-6">
      {isTeacher && (
        <Card className="border-termo-sky-blue/20 bg-termo-sky-blue/5">
          <CardContent className="pt-6">
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-termo-deep-blue font-semibold">Add Student by Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" variant="hero" disabled={inviting}>
                    {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Add
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{enrollments.length} student{enrollments.length !== 1 ? "s" : ""} enrolled</span>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No students enrolled yet.</p>
      ) : (
        <div className="space-y-2">
          {enrollments.map((e) => (
            <Card key={e.id} className="hover:border-termo-sky-blue/50 transition-colors">
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-termo-deep-blue">{e.profiles?.display_name || "Student"}</p>
                  <p className="text-sm text-muted-foreground">{e.profiles?.email || e.student_id}</p>
                </div>
                {isTeacher && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(e.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md border-none bg-gradient-to-br from-[#0f172a]/95 to-[#1e293b]/95 backdrop-blur-xl text-white shadow-2xl overflow-hidden p-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 space-y-6"
          >
            <div className="flex justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-termo-light-orange to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">System Upgrade in Progress</DialogTitle>
              <DialogDescription className="text-blue-200/70 text-base">
                Our development team is working on the direct invite feature.
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-blue-200 uppercase tracking-widest">Share Class Code</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-4xl font-mono font-black text-termo-light-orange tracking-[0.2em]">{classCode}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={copyCode}
                      className="rounded-full bg-white/10 hover:bg-white/20 border-none text-white h-9 w-9"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-2 text-white/70 hover:text-white h-auto py-2 hover:bg-white/5"
                      onClick={shareWhatsApp}
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                        <MessageSquare className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-2 text-white/70 hover:text-white h-auto py-2 hover:bg-white/5"
                      onClick={shareEmail}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
                    </Button>
                  </motion.div>
                </div>

                <p className="text-xs text-blue-300/60 leading-relaxed max-w-[240px] mx-auto pt-2">
                  Students join instantly by entering this code on their dashboard.
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full h-12 bg-white text-termo-deep-blue hover:bg-white/90 font-bold text-lg rounded-xl transition-all shadow-xl shadow-white/5"
                >
                  Got it, thanks!
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Decorative background circle */}
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-termo-light-orange/10 rounded-full blur-3xl pointer-events-none" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
