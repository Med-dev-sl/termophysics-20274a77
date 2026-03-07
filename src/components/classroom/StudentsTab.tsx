import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Users, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: string;
  student_id: string;
  enrolled_at: string;
  profiles: { display_name: string | null; email: string | null } | null;
}

interface StudentsTabProps {
  classroomId: string;
  isTeacher?: boolean;
}

export function StudentsTab({ classroomId, isTeacher }: StudentsTabProps) {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

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
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      // 1. Find user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", inviteEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "No student found with this email address."
        });
        return;
      }

      // 2. Check if already enrolled
      const alreadyEnrolled = enrollments.some(e => e.student_id === profile.user_id);
      if (alreadyEnrolled) {
        toast({ title: "Already enrolled", description: "This student is already in the class." });
        return;
      }

      // 3. Add to classroom_enrollments
      const { error: enrollError } = await supabase
        .from("classroom_enrollments")
        .insert({
          classroom_id: classroomId,
          student_id: profile.user_id
        });

      if (enrollError) throw enrollError;

      toast({ title: "Success", description: "Student added to the class!" });
      setInviteEmail("");
      fetchStudents();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invite failed", description: error.message });
    } finally {
      setInviting(false);
    }
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
    </div>
  );
}
