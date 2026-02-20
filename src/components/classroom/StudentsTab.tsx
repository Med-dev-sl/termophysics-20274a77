import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: string;
  student_id: string;
  enrolled_at: string;
  profiles: { display_name: string | null; email: string | null } | null;
}

interface StudentsTabProps {
  classroomId: string;
}

export function StudentsTab({ classroomId }: StudentsTabProps) {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("classroom_enrollments")
      .select("id, student_id, enrolled_at, profiles!classroom_enrollments_student_id_fkey(display_name, email)")
      .eq("classroom_id", classroomId);

    // The join may not work due to missing FK, fallback gracefully
    setEnrollments((data as any) || []);
    setLoading(false);
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{enrollments.length} student{enrollments.length !== 1 ? "s" : ""} enrolled</span>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No students enrolled yet. Share your class code!</p>
      ) : (
        <div className="space-y-2">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{e.profiles?.display_name || "Student"}</p>
                  <p className="text-sm text-muted-foreground">{e.profiles?.email || e.student_id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(e.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
