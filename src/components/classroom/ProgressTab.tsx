import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, CheckCircle2, Clock, Download, TrendingUp, Users } from "lucide-react";
import { exportGradesToCSV } from "@/lib/export-grades";
import { useToast } from "@/hooks/use-toast";

interface ProgressTabProps {
  classroomId: string;
  isTeacher: boolean;
}

interface AssignmentGrade {
  id: string;
  title: string;
  max_score: number;
  due_date: string | null;
  type: "assignment" | "quiz";
  submissions: {
    student_id: string;
    student_name: string;
    score: number | null;
    graded: boolean;
    is_late: boolean;
  }[];
}

interface StudentSummary {
  student_id: string;
  student_name: string;
  total_earned: number;
  total_possible: number;
  graded_count: number;
  submitted_count: number;
  total_items: number;
  percentage: number;
}

export function ProgressTab({ classroomId, isTeacher }: ProgressTabProps) {
  const { user } = useAuth();
  const [grades, setGrades] = useState<AssignmentGrade[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  useEffect(() => {
    if (user) fetchProgress();
  }, [user, classroomId]);

  const fetchProgress = async () => {
    setLoading(true);
    const allGrades: AssignmentGrade[] = [];

    // Fetch assignments with submissions
    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, title, max_score, due_date")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: true });

    if (assignments) {
      for (const a of assignments) {
        const { data: subs } = await supabase
          .from("assignment_submissions")
          .select("student_id, score, graded_at, is_late, profiles!assignment_submissions_profiles_fkey(display_name)")
          .eq("assignment_id", a.id);

        allGrades.push({
          id: a.id,
          title: a.title,
          max_score: a.max_score,
          due_date: a.due_date,
          type: "assignment",
          submissions: (subs || []).map((s: any) => ({
            student_id: s.student_id,
            student_name: s.profiles?.display_name || "Unknown",
            score: s.score,
            graded: !!s.graded_at,
            is_late: s.is_late,
          })),
        });
      }
    }

    // Fetch quizzes with submissions
    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id, title, max_score, due_date")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: true });

    if (quizzes) {
      for (const q of quizzes) {
        const { data: subs } = await supabase
          .from("quiz_submissions")
          .select("student_id, total_score, graded_at, is_late, profiles!quiz_submissions_profiles_fkey(display_name)")
          .eq("quiz_id", q.id);

        allGrades.push({
          id: q.id,
          title: q.title,
          max_score: q.max_score,
          due_date: q.due_date,
          type: "quiz",
          submissions: (subs || []).map((s: any) => ({
            student_id: s.student_id,
            student_name: s.profiles?.display_name || "Unknown",
            score: s.total_score,
            graded: !!s.graded_at,
            is_late: s.is_late,
          })),
        });
      }
    }

    // Build student list from enrollments (teacher) or just current user
    if (isTeacher) {
      const { data: enrollments } = await supabase
        .from("classroom_enrollments")
        .select("student_id, profiles!classroom_enrollments_profiles_fkey(display_name)")
        .eq("classroom_id", classroomId);

      setStudents(
        (enrollments || []).map((e: any) => ({
          id: e.student_id,
          name: e.profiles?.display_name || "Unknown",
        }))
      );
    } else if (user) {
      setStudents([{ id: user.id, name: "You" }]);
    }

    setGrades(allGrades);
    setLoading(false);
  };

  const studentSummaries = useMemo<StudentSummary[]>(() => {
    const filteredStudents =
      selectedStudent === "all" ? students : students.filter((s) => s.id === selectedStudent);

    return filteredStudents.map((student) => {
      let totalEarned = 0;
      let totalPossible = 0;
      let gradedCount = 0;
      let submittedCount = 0;

      grades.forEach((g) => {
        const submission = g.submissions.find((s) => s.student_id === student.id);
        if (submission) {
          submittedCount++;
          if (submission.graded && submission.score !== null) {
            gradedCount++;
            totalEarned += submission.score;
            totalPossible += g.max_score;
          }
        }
      });

      return {
        student_id: student.id,
        student_name: student.name,
        total_earned: totalEarned,
        total_possible: totalPossible,
        graded_count: gradedCount,
        submitted_count: submittedCount,
        total_items: grades.length,
        percentage: totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0,
      };
    });
  }, [students, grades, selectedStudent]);

  const classAverage = useMemo(() => {
    if (studentSummaries.length === 0) return 0;
    const total = studentSummaries.reduce((sum, s) => sum + s.percentage, 0);
    return Math.round(total / studentSummaries.length);
  }, [studentSummaries]);

  if (loading) {
    return <p className="text-muted-foreground py-8 text-center">Loading progress...</p>;
  }

  if (grades.length === 0) {
    return (
      <Card className="termo-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No assignments or quizzes yet. Progress will appear here once graded work is available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600 dark:text-green-400";
    if (pct >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "[&>div]:bg-green-500";
    if (pct >= 60) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isTeacher ? "Class Average" : "Overall Grade"}
                </p>
                <p className={`text-2xl font-bold ${getScoreColor(classAverage)}`}>
                  {classAverage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{grades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold">
                  {grades.reduce(
                    (count, g) => count + g.submissions.filter((s) => s.graded).length,
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student filter (teacher only) */}
      {isTeacher && students.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by student:</span>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Student Summary Cards */}
      {isTeacher && selectedStudent === "all" && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Student Overview</h3>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {studentSummaries.map((s) => (
              <Card key={s.student_id} className="overflow-hidden">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{s.student_name}</span>
                    <span className={`text-lg font-bold ${getScoreColor(s.percentage)}`}>
                      {s.percentage}%
                    </span>
                  </div>
                  <Progress value={s.percentage} className={`h-2 ${getProgressColor(s.percentage)}`} />
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{s.submitted_count}/{s.total_items} submitted</span>
                    <span>•</span>
                    <span>{s.graded_count} graded</span>
                    <span>•</span>
                    <span>{s.total_earned}/{s.total_possible} pts</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Grades Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Detailed Grades</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Max Score</TableHead>
                {(selectedStudent !== "all"
                  ? studentSummaries
                  : isTeacher
                  ? studentSummaries
                  : studentSummaries
                ).map((s) => (
                  <TableHead key={s.student_id} className="text-center min-w-[100px]">
                    {s.student_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {g.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {g.max_score}
                  </TableCell>
                  {studentSummaries.map((student) => {
                    const sub = g.submissions.find(
                      (s) => s.student_id === student.student_id
                    );
                    return (
                      <TableCell key={student.student_id} className="text-center">
                        {sub ? (
                          sub.graded && sub.score !== null ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`font-semibold ${getScoreColor(
                                  (sub.score / g.max_score) * 100
                                )}`}
                              >
                                {sub.score}
                              </span>
                              {sub.is_late && (
                                <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                  Late
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">Pending</span>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">
                  {grades.reduce((sum, g) => sum + g.max_score, 0)}
                </TableCell>
                {studentSummaries.map((s) => (
                  <TableCell key={s.student_id} className="text-center">
                    <span className={getScoreColor(s.percentage)}>
                      {s.total_earned} ({s.percentage}%)
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
