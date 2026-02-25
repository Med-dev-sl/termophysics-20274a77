import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesTab } from "@/components/classroom/NotesTab";
import { AssignmentsTab } from "@/components/classroom/AssignmentsTab";
import { QuizzesTab } from "@/components/classroom/QuizzesTab";
import { StudentsTab } from "@/components/classroom/StudentsTab";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  class_code: string;
  teacher_id: string;
}

const ClassroomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher } = useUserRole();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) fetchClassroom();
  }, [id, user]);

  const fetchClassroom = async () => {
    if (!id) return;
    const { data } = await supabase.from("classrooms").select("*").eq("id", id).single();
    setClassroom(data);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!classroom) return <Navigate to="/dashboard" replace />;

  const isOwner = classroom.teacher_id === user.id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8 container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-display font-bold">{classroom.name}</h2>
            {classroom.subject && (
              <p className="text-muted-foreground">{classroom.subject}</p>
            )}
          </div>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-transparent border-b rounded-none px-0 h-auto gap-6">
            <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2">Notes</TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2">Quizzes</TabsTrigger>
            {isOwner && <TabsTrigger value="students" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2">Students</TabsTrigger>}
          </TabsList>

          <TabsContent value="notes" className="mt-6">
            <NotesTab classroomId={classroom.id} isTeacher={isOwner} />
          </TabsContent>
          <TabsContent value="assignments" className="mt-6">
            <AssignmentsTab classroomId={classroom.id} isTeacher={isOwner} />
          </TabsContent>
          <TabsContent value="quizzes" className="mt-6">
            <QuizzesTab classroomId={classroom.id} isTeacher={isOwner} />
          </TabsContent>
          {isOwner && (
            <TabsContent value="students" className="mt-6">
              <StudentsTab classroomId={classroom.id} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default ClassroomDetail;
