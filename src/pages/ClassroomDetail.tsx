import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AppLayout } from "@/components/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesTab } from "@/components/classroom/NotesTab";
import { AssignmentsTab } from "@/components/classroom/AssignmentsTab";
import { QuizzesTab } from "@/components/classroom/QuizzesTab";
import { StudentsTab } from "@/components/classroom/StudentsTab";
import { ProgressTab } from "@/components/classroom/ProgressTab";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedPage } from "@/components/ui/motion-primitives";

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
  const [activeTab, setActiveTab] = useState("notes");

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
        <LoadingSpinner size="lg" text="Loading classroom..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!classroom) return <Navigate to="/dashboard" replace />;

  const isOwner = classroom.teacher_id === user.id;

  return (
    <AppLayout>
      <AnimatedPage className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <div>
            <h2 className="text-3xl font-display font-bold">{classroom.name}</h2>
            {classroom.subject && (
              <p className="text-muted-foreground">{classroom.subject}</p>
            )}
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-transparent border-b rounded-none px-0 h-auto gap-6">
              {["notes", "assignments", "quizzes", "progress", ...(isOwner ? ["students"] : [])].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 capitalize relative"
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <TabsContent value="notes" className="mt-0" forceMount={activeTab === "notes" ? true : undefined}>
                {activeTab === "notes" && <NotesTab classroomId={classroom.id} isTeacher={isOwner} />}
              </TabsContent>
              <TabsContent value="assignments" className="mt-0" forceMount={activeTab === "assignments" ? true : undefined}>
                {activeTab === "assignments" && <AssignmentsTab classroomId={classroom.id} isTeacher={isOwner} />}
              </TabsContent>
              <TabsContent value="quizzes" className="mt-0" forceMount={activeTab === "quizzes" ? true : undefined}>
                {activeTab === "quizzes" && <QuizzesTab classroomId={classroom.id} isTeacher={isOwner} />}
              </TabsContent>
              <TabsContent value="progress" className="mt-0" forceMount={activeTab === "progress" ? true : undefined}>
                {activeTab === "progress" && <ProgressTab classroomId={classroom.id} isTeacher={isOwner} classroomName={classroom.name} />}
              </TabsContent>
              {isOwner && (
                <TabsContent value="students" className="mt-0" forceMount={activeTab === "students" ? true : undefined}>
                  {activeTab === "students" && <StudentsTab classroomId={classroom.id} isTeacher={isOwner} />}
                </TabsContent>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </AnimatedPage>
    </AppLayout>
  );
};

export default ClassroomDetail;
